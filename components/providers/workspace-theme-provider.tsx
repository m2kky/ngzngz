"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function WorkspaceThemeProvider() {
    const supabase = createClient()

    useEffect(() => {
        async function loadTheme() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: workspaces } = await supabase
                .from("workspaces")
                .select("branding_config")
                .limit(1)

            if (workspaces && workspaces.length > 0) {
                const config = workspaces[0].branding_config as any
                if (config?.primaryColor) {
                    document.documentElement.style.setProperty("--brand", config.primaryColor)
                }
            }
        }

        loadTheme()
    }, [supabase])

    return null
}
