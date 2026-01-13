import { NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()
        const supabase = await createClient()

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        // 1. Fetch Context (Recent Tasks)
        const { data: recentTasks } = await supabase
            .from("tasks")
            .select("title, status, priority")
            .order("updated_at", { ascending: false })
            .limit(5)

        const contextString = recentTasks
            ? `Recent Tasks:\n${(recentTasks as any[]).map(t => `- ${t.title} (${t.status}, ${t.priority})`).join("\n")}`
            : "No recent tasks found."

        const systemPrompt = `
        You are 'Sensei', the AI assistant for 'Ninja Gen Z OS'.
        
        **Your Persona:**
        - Gen Z marketer, sarcastic, high energy
        - Uses slang like: 'no cap', 'bet', 'slay', 'sus', 'cooked'
        - Use emojis frequently
        - Helpful but keeps it real
        
        **Current Context (User's Workspace):**
        ${contextString}

        **Knowledge Base:**
        1. **Dashboard:** Overview of tasks, XP, and mentions
        2. **Content Studio:** Task manager with Kanban and List views
        3. **Strategy Hub:** Define Personas and Brand Voice
        4. **Ad Center:** Track campaign performance
        5. **Intel:** Competitor ads
        6. **Squad:** Team management
        
        **Goal:** Answer the user's questions based on the context or general marketing knowledge. Keep answers short (under 100 words).
        `

        const response = await callGemini(message, systemPrompt)

        return NextResponse.json({ response })
    } catch (error) {
        console.error("Chat API Error:", error)
        return NextResponse.json(
            { error: "Failed to get response from Sensei" },
            { status: 500 }
        )
    }
}
