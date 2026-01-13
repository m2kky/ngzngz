import { NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/ai/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { title, context, personaId } = await request.json()
        const supabase = await createClient()

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        // Fetch Persona Details
        let personaContext = ""
        if (personaId) {
            const { data: persona } = await supabase
                .from("personas")
                .select("*")
                .eq("id", personaId)
                .single()

            if (persona) {
                personaContext = `
                You are writing as the persona: ${persona.name}.
                Description: ${persona.description}
                Tone Keywords: ${persona.tone_keywords?.join(", ")}
                Core Profile: ${JSON.stringify(persona.core_profile)}
                `
            }
        }

        // Fetch Active Strategy (Optional: just taking the first active one for now)
        const { data: strategy } = await supabase
            .from("strategies")
            .select("*")
            .eq("status", "active")
            .limit(1)
            .single()

        let strategyContext = ""
        if (strategy) {
            strategyContext = `
            Align with this marketing strategy:
            Objectives: ${JSON.stringify(strategy.marketing_objectives)}
            Target Audience: ${JSON.stringify(strategy.target_audience)}
            `
        }

        const systemPrompt = `
        You are a Gen Z marketing content creator (Sensei).
        ${personaContext}
        ${strategyContext}
        
        Write a creative, viral-worthy piece of content.
        Use emojis, slang (if appropriate for persona), and keep it engaging.
        `

        const userPrompt = context
            ? `Title: ${title}\nContext: ${context}`
            : `Title: ${title}`

        const result = await callGemini(userPrompt, systemPrompt)

        return NextResponse.json({ content: result })
    } catch (error) {
        console.error("Generate API Error:", error)
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        )
    }
}
