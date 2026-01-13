"use client"

import { useState, useEffect } from "react"
import { Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"

export function BrandLogoPanel() {
    const [logos, setLogos] = useState<{ primary?: string; secondary?: string; favicon?: string }>({})
    const [uploading, setUploading] = useState<string | null>(null)
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        if (currentWorkspace?.branding_config) {
            const config = currentWorkspace.branding_config as any
            setLogos(config.logos || {})
        }
    }, [currentWorkspace])

    const handleUpload = async (file: File, type: 'primary' | 'secondary' | 'favicon') => {
        if (!currentWorkspace) return

        setUploading(type)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${currentWorkspace.id}/${type}-${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('brand-assets')
                .upload(fileName, file, { upsert: true })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('brand-assets')
                .getPublicUrl(fileName)

            const updatedLogos = { ...logos, [type]: publicUrl }
            setLogos(updatedLogos)

            // Update workspace branding_config
            const { error: updateError } = await supabase
                .from('workspaces')
                .update({
                    branding_config: {
                        ...(currentWorkspace.branding_config as any),
                        logos: updatedLogos
                    }
                } as any)
                .eq('id', currentWorkspace.id)

            if (updateError) throw updateError

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logo uploaded!`)
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(`Failed to upload logo: ${error.message}`)
        } finally {
            setUploading(null)
        }
    }

    const LogoUploadCard = ({
        type,
        label,
        description
    }: {
        type: 'primary' | 'secondary' | 'favicon';
        label: string;
        description: string
    }) => (
        <div className="space-y-3">
            <div>
                <h4 className="text-sm font-semibold text-white">{label}</h4>
                <p className="text-xs text-zinc-400">{description}</p>
            </div>

            <div className="relative group">
                {logos[type] ? (
                    <div className="aspect-video rounded-lg border border-white/10 bg-white/5 overflow-hidden relative">
                        <img
                            src={logos[type]}
                            alt={label}
                            className="w-full h-full object-contain p-4"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleUpload(file, type)
                                    }}
                                />
                                <Button size="sm" variant="secondary" className="pointer-events-none">
                                    <Upload size={14} className="mr-2" />
                                    Replace
                                </Button>
                            </label>
                        </div>
                    </div>
                ) : (
                    <label className="cursor-pointer block">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleUpload(file, type)
                            }}
                        />
                        <div className="aspect-video rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2">
                            {uploading === type ? (
                                <div className="text-sm text-zinc-400">Uploading...</div>
                            ) : (
                                <>
                                    <ImageIcon size={24} className="text-zinc-400" />
                                    <div className="text-sm text-zinc-400">Click to upload</div>
                                </>
                            )}
                        </div>
                    </label>
                )}
            </div>
        </div>
    )

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon size={20} className="text-[var(--brand)]" />
                    The DNA
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Upload your brand logos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LogoUploadCard
                    type="primary"
                    label="Primary Logo"
                    description="Main brand logo"
                />
                <LogoUploadCard
                    type="secondary"
                    label="Secondary Logo"
                    description="Alternative variation"
                />
                <LogoUploadCard
                    type="favicon"
                    label="Favicon"
                    description="Browser icon (32x32)"
                />
            </div>
        </div>
    )
}
