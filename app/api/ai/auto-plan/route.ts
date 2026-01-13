import { NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { projectId, name, description, workspaceId } = await request.json()
        const supabase = await createClient()

        if (!projectId || !workspaceId) {
            return NextResponse.json({ error: "Project ID and Workspace ID are required" }, { status: 400 })
        }

        // 1. Fetch Workspace Members to assign tasks
        const { data: members } = await supabase
            .from("workspace_members")
            .select(`
                user_id,
                users (
                    id,
                    full_name,
                    role
                )
            `)
            .eq("workspace_id", workspaceId)

        const teamContext = members?.map((m: any) => ({
            id: m.user_id,
            name: m.users.full_name,
            role: m.users.role
        })) || []

        // 2. Construct Prompt
        const systemPrompt = `
        You are an expert Project Manager for a Gen Z marketing agency.
        Your goal is to break down a marketing project into actionable tasks.
        
        Available Team Members:
        ${JSON.stringify(teamContext)}

        Rules:
        1. Generate 5-10 specific tasks.
        2. Assign each task to the most appropriate team member based on their role (e.g., Copywriting -> SQUAD_MEMBER/COPYWRITER, Strategy -> ACCOUNT_MANAGER).
        3. Set priority (LOW, MEDIUM, HIGH, URGENT).
        4. Return ONLY a valid JSON array of objects. No markdown, no explanation.
        
        Task Schema:
        {
            "title": "string",
            "description": "string",
            "priority": "string",
            "assignee_id": "string (user_id from available team)"
        }
        `

        const userPrompt = `
        Project Name: ${name}
        Description: ${description}
        
        Generate the task plan now.
        `

        // 3. Call AI
        const aiResponse = await callGemini(userPrompt, systemPrompt)

        // 4. Parse Response
        // Clean up markdown code blocks if present
        const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim()
        let tasks = []
        try {
            tasks = JSON.parse(cleanJson)
        } catch (e) {
            console.error("Failed to parse AI response:", aiResponse)
            return NextResponse.json({ error: "Failed to parse AI plan" }, { status: 500 })
        }

        // 5. Insert Tasks
        const tasksToInsert = tasks.map((task: any) => ({
            workspace_id: workspaceId,
            project_id: projectId,
            title: task.title,
            description: task.description,
            status: "DRAFTING",
            priority: task.priority || "MEDIUM",
            assignee_id: task.assignee_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
            .from("tasks")
            .insert(tasksToInsert)

        if (error) throw error

        return NextResponse.json({ taskCount: tasks.length })

    } catch (error) {
        console.error("Auto-Plan API Error:", error)
        return NextResponse.json(
            { error: "Failed to generate plan" },
            { status: 500 }
        )
    }
}
