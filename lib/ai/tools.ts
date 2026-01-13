import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

/**
 * Vercel AI SDK Core - Modern Pattern
 * Each tool has execute logic embedded directly
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tools: Record<string, any> = {
  create_task: tool({
    description: 'Create a new task in a workspace',
    parameters: z.object({
      workspace_name: z.string().describe('Workspace name'),
      project_id: z.string().describe('Project ID'),
      title: z.string().describe('Task title'),
      description: z.string().optional().describe('Task description'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: any) => {
      try {
        const { workspace_name, project_id, title, description, priority, status } = params
        const supabase = createClient()

        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id')
          .eq('name', workspace_name)
          .single()

        if (!workspace) {
          return { success: false, error: 'Workspace not found' }
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            workspace_id: workspace.id,
            project_id,
            title,
            description: description || '',
            priority,
            status,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true, message: `✅ Task created: ${title}`, data }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
  }),

  get_tasks: tool({
    description: 'Get tasks from a workspace',
    parameters: z.object({
      workspace_name: z.string().describe('Workspace name'),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: any) => {
      try {
        const { workspace_name, status } = params
        const supabase = createClient()

        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id')
          .eq('name', workspace_name)
          .single()

        if (!workspace) {
          return { success: false, error: 'Workspace not found' }
        }

        let query = supabase
          .from('tasks')
          .select('id, title, status, priority, created_at')
          .eq('workspace_id', workspace.id)

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query.limit(10)

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true, message: `Found ${data?.length || 0} tasks`, data: data || [] }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
  }),

  update_task: tool({
    description: 'Update a task status',
    parameters: z.object({
      task_id: z.string().describe('Task ID'),
      status: z.enum(['todo', 'in_progress', 'done']),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: any) => {
      try {
        const { task_id, status } = params
        const supabase = createClient()

        const { data, error } = await supabase
          .from('tasks')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', task_id)
          .select()
          .single()

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true, message: `✅ Task updated to ${status}`, data }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
  }),

  save_memory: tool({
    description: 'Save important information, user preferences, or strategic plans for long-term retention. Use this ONLY for permanent facts, NOT for temporary conversation.',
    parameters: z.object({
      content: z.string().describe('The fact/preference to remember (e.g., "Client X hates red", "Use formal tone in reports")'),
      category: z.enum(['preference', 'fact', 'plan', 'insight']).describe('Type of memory'),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: any) => {
      try {
        const { content, category } = params
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return { success: false, message: 'User not authenticated' }
        }

        const { data: member } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .single()

        if (!member) {
          return { success: false, message: 'Workspace not found' }
        }

        const { error } = await supabase.from('sensei_memories').insert({
          workspace_id: member.workspace_id,
          content,
          category,
        })

        if (error) {
          return { success: false, message: `Failed to save memory: ${error.message}` }
        }

        return { success: true, message: '✅ I stored this in my long-term memory.' }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
  }),

  read_memories: tool({
    description: 'Retrieve past memories, user preferences, or saved plans. Use this when the user asks about past decisions or "what do you know about X".',
    parameters: z.object({
      query_category: z.enum(['preference', 'fact', 'plan', 'insight', 'all']).optional().default('all'),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: any) => {
      try {
        const { query_category } = params
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return { success: false, message: 'User not authenticated' }
        }

        const { data: member } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .single()

        if (!member) {
          return { success: false, message: 'Workspace not found' }
        }

        let query = supabase
          .from('sensei_memories')
          .select('content, category, created_at')
          .eq('workspace_id', member.workspace_id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (query_category !== 'all') {
          query = query.eq('category', query_category)
        }

        const { data } = await query

        if (!data || data.length === 0) {
          return { success: true, message: 'My memory is empty.' }
        }

        const formatted = data.map((m: any) => `• [${m.category.toUpperCase()}] ${m.content}`).join('\n')
        return { success: true, message: `Here is what I remember:\n${formatted}` }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
  }),
}

// Additional tools can be added here following the same pattern
// The create_task tool above demonstrates the Vercel AI SDK Core pattern
