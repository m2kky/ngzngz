import { NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
    try {
        const { title, content } = await request.json()

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            )
        }

        const systemPrompt = `
      You are 'Sensei', a Gen Z marketing creative director. 
      Analyze text for tone, engagement, and brand alignment.
      Return ONLY a JSON object with keys:
      - 'score' (number 0-100)
      - 'feedback' (string, max 100 characters)
    `

        const userPrompt = `Title: ${title}\n\nContent: ${content}`
        const result = await callGemini(userPrompt, systemPrompt)

        // Parse JSON response
        try {
            const cleanJson = result.replace(/```json|```/g, "").trim()
            const parsed = JSON.parse(cleanJson)
            return NextResponse.json(parsed)
        } catch (parseError) {
            return NextResponse.json({
                score: 50,
                feedback: "Couldn't parse AI score. Try again!",
            })
        }
    } catch (error) {
        console.error("Analyze API Error:", error)
        return NextResponse.json(
            { error: "Failed to analyze content" },
            { status: 500 }
        )
    }
}
