import { NextResponse } from 'next/server'
import { AutomationEngine } from '@/lib/automation/engine'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
    try {
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

        // Get current user and workspace to make the test real
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
        }

        // Get first workspace
        const { data: member } = await supabase
            .from('workspace_members')
            .select('workspace_id, workspaces(name, slug)')
            .eq('user_id', user.id)
            .single()

        if (!member) {
            return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
        }

        const engine = new AutomationEngine(supabase)

        // Mock Payload
        const payload = {
            task: {
                id: 'test-task-123',
                title: 'Test Task from API',
                status: 'todo',
                priority: 'high'
            },
            user: {
                id: user.id,
                name: user.email?.split('@')[0] || 'Ninja',
                email: user.email || 'test@ninja.com'
            },
            workspace: {
                id: member.workspace_id,
                name: (member.workspaces as any)?.name,
                slug: (member.workspaces as any)?.slug
            }
        }

        // Trigger 'task.created' event
        const result = await engine.trigger('task.created', payload)

        return NextResponse.json({
            success: true,
            message: 'Automation Triggered',
            payload,
            result
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
