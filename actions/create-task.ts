'use server'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/database"

export async function createTask(task: { title: string, assignee: string, deadline: string, workspace_id: string }) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 2. Insert Task
    const { data, error } = await supabase
        .from('tasks')
        .insert({
            title: task.title,
            workspace_id: task.workspace_id,
            status: 'DRAFTING', // Default status
            priority: 'MEDIUM',
            created_by: user.id,
            description: `Auto-generated from War Room Chat. Assignee: ${task.assignee}, Deadline: ${task.deadline}`,
            // In a real app, we would resolve assignee name to a user_id here
        })
        .select()
        .single()

    if (error) {
        console.error("Create Task Error:", error)
        throw new Error("Failed to create task")
    }

    return data
}
