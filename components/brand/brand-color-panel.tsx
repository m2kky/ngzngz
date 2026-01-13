"use client"

import { useState, useEffect } from "react"
import { Palette as PaletteIcon, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"

export function BrandColorPanel() {
    const [colors, setColors] = useState<string[]>([])
    const [newColor, setNewColor] = useState("#ccff00")
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        if (currentWorkspace?.branding_config) {
            const config = currentWorkspace.branding_config as any
            setColors(config.colors || ["#ccff00", "#a855f7"])
        }
    }, [currentWorkspace])

    const addColor = async () => {
        if (!currentWorkspace) return

        const updatedColors = [...colors, newColor]
        setColors(updatedColors)

        const { error } = await supabase
            .from('workspaces')
            .update({
                branding_config: {
                    ...(currentWorkspace.branding_config as any),
                    colors: updatedColors
                }
            } as any)
            .eq('id', currentWorkspace.id)

        if (error) {
            toast.error("Failed to add color")
            console.error(error)
        } else {
            toast.success("Color added to palette")
            setNewColor("#ccff00")
        }
    }

    const removeColor = async (index: number) => {
        if (!currentWorkspace) return

        const updatedColors = colors.filter((_, i) => i !== index)
        setColors(updatedColors)

        const { error } = await supabase
            .from('workspaces')
            .update({
                branding_config: {
                    ...(currentWorkspace.branding_config as any),
                    colors: updatedColors
                }
            } as any)
            .eq('id', currentWorkspace.id)

        if (error) {
            toast.error("Failed to remove color")
            console.error(error)
        } else {
            toast.success("Color removed from palette")
        }
    }

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PaletteIcon size={20} className="text-[var(--brand)]" />
                    The Spectrum
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Manage your brand color palette</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {colors.map((color, index) => (
                    <div key={index} className="relative group">
                        <div
                            className="aspect-square rounded-lg border border-white/20 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                            style={{ backgroundColor: color }}
                        />
                        <button
                            onClick={() => removeColor(index)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                            <X size={14} />
                        </button>
                        <div className="mt-2 text-center">
                            <p className="text-xs font-mono text-zinc-300">{color.toUpperCase()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
                <div className="flex-1 flex gap-2">
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <Input
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="#RRGGBB"
                        className="flex-1 bg-white/5 border-white/20 text-white"
                    />
                </div>
                <Button onClick={addColor} className="bg-[var(--brand)] text-black hover:opacity-90">
                    <Plus size={16} className="mr-2" />
                    Add Color
                </Button>
            </div>
        </div>
    )
}
