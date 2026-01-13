const GEMINI_MODEL = "gemini-2.0-flash-exp";

export async function callGemini(
    prompt: string,
    systemInstruction: string = ""
): Promise<string> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: systemInstruction
                        ? { parts: [{ text: systemInstruction }] }
                        : undefined,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sensei is taking a nap (Error)."
        );
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Sensei says: The API connection is kinda sus rn. Try refreshing. 💀";
    }
}
