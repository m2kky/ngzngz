'use server'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/database"
import { getErrorMessage } from "@/lib/errors"

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

    try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // 2. Insert Task
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: task.title,
                workspace_id: task.workspace_id,
                status: 'DRAFTING',
                priority: 'MEDIUM',
                created_by: user.id,
                description: `Auto-generated from War Room Chat. Assignee: ${task.assignee}, Deadline: ${task.deadline}`,
            })
            .select()
            .single()

        if (error) {
            console.error("Create Task Error:", getErrorMessage(error))
            throw new Error("Failed to create task")
        }

        return data
    } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error("Create Task Error:", message)
        throw new Error(message || "Failed to create task")
    }
}
