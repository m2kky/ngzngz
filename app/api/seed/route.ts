import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
    const supabase = await createClient()

    try {
        console.log("Starting seed process...")

        // 1. Check if Workspace exists
        let workspace
        const { data: existingWorkspaces, error: fetchError } = await supabase
            .from("workspaces")
            .select("*")
            .eq("slug", "ninja-agency-demo")
            .single()

        if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 is "not found"
            console.error("Error fetching workspace:", fetchError)
            throw fetchError
        }

        if (existingWorkspaces) {
            console.log("Workspace already exists, using it.")
            workspace = existingWorkspaces
        } else {
            console.log("Creating new workspace...")
            const { data: newWorkspace, error: createError } = await supabase
                .from("workspaces")
                .insert([
                    {
                        name: "Ninja Agency",
                        slug: "ninja-agency-demo",
                        status: "ACTIVE",
                        branding_config: {
                            primaryColor: "#ccff00",
                            secondaryColor: "#a855f7",
                            fontFamily: "Inter",
                        },
                    },
                ])
                .select()
                .single()

            if (createError) {
                console.error("Error creating workspace:", createError)
                throw createError
            }
            workspace = newWorkspace
        }

        // 2. Create Sample Persona (if not exists)
        const { data: existingPersonas } = await supabase
            .from("personas")
            .select("*")
            .eq("workspace_id", workspace.id)
            .eq("name", "Gen Z Gamer")
            .single()

        if (!existingPersonas) {
            console.log("Creating persona...")
            const { error: pError } = await supabase
                .from("personas")
                .insert([
                    {
                        workspace_id: workspace.id,
                        name: "Gen Z Gamer",
                        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                        description: "Hardcore gamer who loves energy drinks and rgb lighting.",
                        core_profile: {
                            age: "18-24",
                            occupation: "Student / Streamer",
                            location: "Global",
                        },
                        goals: {
                            primary: "Level up gaming setup",
                            secondary: "Grow twitch following",
                        },
                        pain_points: ["Lag", "Expensive gear", "Fake authenticity"],
                        tone_keywords: ["Hype", "Authentic", "Meme-friendly"],
                    },
                ])

            if (pError) {
                console.error("Error creating persona:", pError)
                throw pError
            }
        }

        // 3. Create Sample Strategy (if not exists)
        const { data: existingStrategies } = await supabase
            .from("strategies")
            .select("*")
            .eq("workspace_id", workspace.id)
            .eq("title", "Q4 Gaming Launch")
            .single()

        if (!existingStrategies) {
            console.log("Creating strategy...")
            const { error: sError } = await supabase.from("strategies").insert([
                {
                    workspace_id: workspace.id,
                    title: "Q4 Gaming Launch",
                    status: "active",
                    business_context: {
                        internal: "Strong brand presence in esports.",
                    },
                    marketing_objectives: {
                        primary: "Increase market share by 15%",
                    },
                    budget_allocation: {
                        total: 50000,
                        channels: { social: 30000, influencers: 20000 },
                    },
                },
            ])

            if (sError) {
                console.error("Error creating strategy:", sError)
                throw sError
            }
        }

        return NextResponse.json({ success: true, message: "Database seeded successfully! 🚀" })
    } catch (error: any) {
        console.error("Seed API Error:", error)
        // Return 200 to see the error in Powershell without exception
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error,
            env_check: {
                url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        }, { status: 200 })
    }
}
