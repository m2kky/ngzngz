import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { getWorkspaceContext, getAgentMemories } from '@/lib/supabase/queries'
import { tools } from '@/lib/ai/tools'

// Initialize Supabase Admin Client (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
    try {
        const { messages, userId } = await req.json()

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 401 })
        }

        // 1. جيب workspace context
        let context
        try {
            context = await getWorkspaceContext(userId, supabaseAdmin)
        } catch (err) {
            console.error('Error fetching workspace context:', err)
            return new Response(JSON.stringify({ error: 'Failed to fetch workspace context' }), { status: 500 })
        }

        if (!context || !context.workspace_id) {
            return new Response(JSON.stringify({ error: 'No workspace found for user' }), { status: 404 })
        }

        // 2. جيب آخر 5 ذكريات
        const recentMemories = await getAgentMemories(context.workspace_id, supabaseAdmin, 5)

        // 3. ادمج الذكريات مع الـ context
        const enhancedContext = { ...context, recentMemories }

        // 4. جيب user info
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('full_name, email')
            .eq('id', userId)
            .single()

        const user = {
            id: userId,
            email: userData?.email,
            user_metadata: { full_name: userData?.full_name }
        }

        // 5. بنّي system prompt
        const systemPrompt = buildSystemPrompt(enhancedContext, user)

        // 4. استخدم streamText مع tools
        const result = streamText({
            model: google('gemini-1.5-flash'),
            system: systemPrompt,
            tools: tools,
            messages: messages,
            toolChoice: 'auto',
        })

        // 5. رجّع streaming response
        return result.toTextStreamResponse()

    } catch (error) {
        console.error('Chat API Error:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error',
            }),
            { status: 500 }
        )
    }
}
