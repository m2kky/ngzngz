import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const supabase = await createClient()
    const taskId = params.id

    try {
        // 1. Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Fetch original task
        const { data: originalTask, error: fetchError } = await supabase
            .from("tasks")
            .select("*")
            .eq("id", taskId)
            .single()

        if (fetchError || !originalTask) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        // 3. Prepare new task data
        // We omit 'id' and 'created_at' to let DB handle them (or generate new UUID if needed)
        // We explicitly set the fields requested
        const newTaskData = {
            ...originalTask,
            id: crypto.randomUUID(), // Generate new ID
            title: `[Clone] ${originalTask.title}`,
            status: "DRAFTING",
            ai_score: null,
            ai_feedback: null,
            assignee_id: user.id, // Assign to current user
            created_by: user.id, // Set creator to current user
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        // 4. Insert new task
        const { data: newTask, error: insertError } = await supabase
            .from("tasks")
            .insert(newTaskData)
            .select()
            .single()

        if (insertError) {
            console.error("Error cloning task:", insertError)
            return NextResponse.json(
                { error: "Failed to clone task" },
                { status: 500 }
            )
        }

        return NextResponse.json(newTask)
    } catch (error) {
        console.error("Internal error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
