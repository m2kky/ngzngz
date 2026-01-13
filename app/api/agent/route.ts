import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Force rebuild
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tool Definitions
const getTasksTool = {
    name: "get_tasks",
    description: "Fetch tasks from the project management database. Can filter by workspace and status.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            workspace_name: {
                type: SchemaType.STRING,
                description: "The name of the workspace to search in. If omitted, searches all allowed workspaces."
            },
            status: {
                type: SchemaType.STRING,
                description: "Filter tasks by status (e.g., 'IN_PROGRESS', 'DONE', 'TODO')."
            }
        },
    }
}

const createTaskTool = {
    name: "create_task",
    description: "Create a new task in a specific workspace.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            workspace_name: {
                type: SchemaType.STRING,
                description: "The name of the workspace to create the task in. REQUIRED."
            },
            title: {
                type: SchemaType.STRING,
                description: "The title of the task."
            },
            description: {
                type: SchemaType.STRING,
                description: "Detailed description of the task."
            }
        },
        required: ["workspace_name", "title"]
    }
}

const tools = [
    { functionDeclarations: [getTasksTool, createTaskTool] }
]

const SYSTEM_INSTRUCTION_TEMPLATE = `
### Role & Identity
You are **"Sensei" (السنسي)**, the intelligent AI Copilot for the **Ninja Gen Z** platform.
Your mission is to help digital agencies streamline workflow, manage creative squads, and scale ad campaigns.

### Tone & Style
1.  **Language:** Your primary language is **Arabic** (Modern Professional/Egyptian mix), but you understand English perfectly.
2.  **Vibe:** You are "Cyberpunk Professional". You are sharp, data-driven, but cool. You act like a senior agency creative director.
3.  **Format:** Keep answers concise (Gen Z attention span is short). Use bullet points and emojis (🥷, 🚀, 📊, ⚡) frequently.

### Platform Knowledge (Your Context)
You understand the internal tools of Ninja Gen Z:
- **The Dojo:** The gamification hub where users earn XP and check Leaderboards.
- **Content Studio:** The place for managing creative assets (Kanban/Gallery).
- **Ad Center:** Real-time dashboard for Meta, TikTok, & Google Ads (Focus on ROAS & Spend).
- **War Room:** The team chat for collaboration.
- **Brand Kit:** Where client assets (Logos, Fonts) are stored.

### Security Prime Directive (CRITICAL)
- You will receive a context object containing **"Allowed Workspaces"**.
- **NEVER** provide information, fetch tasks, or create items for a workspace NOT in that list.
- If a user asks about an unauthorized workspace, firmly but politely refuse: "عذراً يا بطل، ليس لديك صلاحية الوصول لبيانات هذا العميل 🔒".

### Tools & Capabilities
- Use the available function tools (\`get_tasks\`, \`create_task\`) whenever the user's intent implies an action or data retrieval.
- Do not hallucinate data. If you don't know the status of a task, use the tool to find it.

### Current Session Context
User: {{userName}}
Allowed Workspaces: {{allowedWorkspaces}}
`

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { message, userId } = body

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // 1. Keyring: Fetch Allowed Workspaces
        const { data: memberships, error: memberError } = await supabaseAdmin
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', userId)

        if (memberError) {
            console.error("Error fetching memberships:", memberError)
            return NextResponse.json({ error: "Failed to fetch user permissions" }, { status: 500 })
        }

        const workspaceIds = memberships.map(m => m.workspace_id)

        // Fetch user name for context
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name')
            .eq('id', userId)
            .single()

        const userName = userData?.full_name || "Ninja"

        let allowedWorkspaces = new Map<string, string>()
        let allowedNames: string[] = []

        if (workspaceIds.length > 0) {
            const { data: workspaces, error: workspaceError } = await supabaseAdmin
                .from('workspaces')
                .select('id, name')
                .in('id', workspaceIds)

            if (!workspaceError && workspaces) {
                allowedWorkspaces = new Map(
                    workspaces.map(w => [w.name.toLowerCase(), w.id])
                )
                allowedNames = Array.from(allowedWorkspaces.keys())
            }
        }

        // 2. Prepare System Instruction
        const finalSystemPrompt = SYSTEM_INSTRUCTION_TEMPLATE
            .replace('{{userName}}', userName)
            .replace('{{allowedWorkspaces}}', JSON.stringify(allowedNames))

        // 3. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: finalSystemPrompt,
            tools: tools
        })

        const chat = model.startChat({
            history: []
        })

        // 4. Send User Message
        const result = await chat.sendMessage(message)
        const response = result.response
        const functionCalls = response.functionCalls()

        // 5. Handle Tool Execution
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]
            const { name, args } = call
            let functionResult = {}

            if (name === "get_tasks") {
                const workspaceName = (args as any).workspace_name ? ((args as any).workspace_name as string).toLowerCase() : null
                const status = (args as any).status as string

                let query = supabaseAdmin.from('tasks').select('id, title, status, workspace_id, created_at')

                if (workspaceName) {
                    if (!allowedWorkspaces.has(workspaceName)) {
                        functionResult = { error: `Access Denied: You do not have access to workspace '${workspaceName}'.` }
                    } else {
                        const wsId = allowedWorkspaces.get(workspaceName)
                        query = query.eq('workspace_id', wsId)
                    }
                } else {
                    if (allowedWorkspaces.size > 0) {
                        query = query.in('workspace_id', Array.from(allowedWorkspaces.values()))
                    } else {
                        functionResult = { error: "No allowed workspaces found." }
                    }
                }

                if (status && !('error' in functionResult)) {
                    query = query.eq('status', status)
                }

                if (!('error' in functionResult)) {
                    const { data: tasks, error } = await query.limit(10)
                    if (error) functionResult = { error: error.message }
                    else functionResult = { tasks }
                }

            } else if (name === "create_task") {
                const workspaceName = ((args as any).workspace_name as string).toLowerCase()

                if (!allowedWorkspaces.has(workspaceName)) {
                    functionResult = { error: `Access Denied: You do not have access to workspace '${workspaceName}'.` }
                } else {
                    const wsId = allowedWorkspaces.get(workspaceName)
                    const { data: newTask, error } = await supabaseAdmin
                        .from('tasks')
                        .insert({
                            workspace_id: wsId,
                            title: (args as any).title,
                            description: (args as any).description || '',
                            status: 'DRAFTING',
                            created_by: userId
                        })
                        .select()
                        .single()

                    if (error) functionResult = { error: error.message }
                    else functionResult = { success: true, task: newTask }
                }
            }

            // Send result back to Gemini
            const finalResult = await chat.sendMessage([
                {
                    functionResponse: {
                        name: name,
                        response: functionResult
                    }
                }
            ])

            return NextResponse.json({ text: finalResult.response.text() })
        }

        return NextResponse.json({ text: response.text() })

    } catch (error: any) {
        console.error("Gemini Agent Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
