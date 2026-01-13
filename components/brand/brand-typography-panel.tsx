"use client"

import { useState, useEffect } from "react"
import { Type } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const GOOGLE_FONTS = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Raleway",
    "Outfit",
    "Space Grotesk",
    "DM Sans",
    "Work Sans",
    "Plus Jakarta Sans",
]

export function BrandTypographyPanel() {
    const [headingFont, setHeadingFont] = useState("Inter")
    const [bodyFont, setBodyFont] = useState("Inter")
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        if (currentWorkspace?.branding_config) {
            const config = currentWorkspace.branding_config as any
            setHeadingFont(config.typography?.headingFont || "Inter")
            setBodyFont(config.typography?.bodyFont || "Inter")
        }
    }, [currentWorkspace])

    const updateTypography = async (field: 'headingFont' | 'bodyFont', value: string) => {
        if (!currentWorkspace) return

        const typography = {
            headingFont: field === 'headingFont' ? value : headingFont,
            bodyFont: field === 'bodyFont' ? value : bodyFont,
        }

        const { error } = await supabase
            .from('workspaces')
            .update({
                branding_config: {
                    ...(currentWorkspace.branding_config as any),
                    typography
                }
            } as any)
            .eq('id', currentWorkspace.id)

        if (error) {
            toast.error("Failed to update typography")
            console.error(error)
        } else {
            toast.success("Typography updated")
            if (field === 'headingFont') setHeadingFont(value)
            else setBodyFont(value)
        }
    }

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Type size={20} className="text-[var(--brand)]" />
                    Typography
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Choose your brand fonts</p>
            </div>

            <div className="space-y-6">
                {/* Heading Font */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">Heading Font</label>
                    <Select value={headingFont} onValueChange={(val) => updateTypography('headingFont', val)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {GOOGLE_FONTS.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div
                        className="p-6 rounded-lg bg-white/5 border border-white/10"
                        style={{ fontFamily: headingFont }}
                    >
                        <h1 className="text-3xl font-bold text-white">
                            The Quick Brown Fox
                        </h1>
                        <p className="text-lg text-zinc-400 mt-2">
                            Jumps over the lazy dog
                        </p>
                    </div>
                </div>

                {/* Body Font */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">Body Font</label>
                    <Select value={bodyFont} onValueChange={(val) => updateTypography('bodyFont', val)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {GOOGLE_FONTS.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div
                        className="p-6 rounded-lg bg-white/5 border border-white/10"
                        style={{ fontFamily: bodyFont }}
                    >
                        <p className="text-base text-white leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
