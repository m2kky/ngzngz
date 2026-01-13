'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function analyzeChat(chatHistory: string) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        // Fallback for demo if no key
        return {
            summary: "Demo Mode: The client is unhappy with the video colors and wants a more cheerful intro.",
            tasks: [
                { assignee: "Sarah", task: "Adjust video colors", deadline: "ASAP" },
                { assignee: "Mike", task: "Write new intro script", deadline: "1 Hour" }
            ]
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = `
            Act as a Project Manager Assistant AI. Analyze the following chat history from an agency team.
            
            Chat History:
            ${chatHistory}

            Output Requirements:
            1. Summarize the conflict/issue in 1 sentence (in Arabic).
            2. Extract action items (Tasks) assigned to people.
            
            Return ONLY a valid JSON object with this structure:
            {
                "summary": "string",
                "tasks": [{ "assignee": "string", "task": "string", "deadline": "string" }]
            }
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)

    } catch (error) {
        console.error("Gemini Analysis Error:", error)
        throw new Error("Failed to analyze chat")
    }
}
