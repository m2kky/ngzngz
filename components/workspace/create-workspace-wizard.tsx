"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Check, Copy, ArrowRight, ArrowLeft, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface CreateWorkspaceWizardProps {
    onClose: () => void
    onComplete: () => void
}

type Step = "identity" | "branding" | "team"

export function CreateWorkspaceWizard({ onClose, onComplete }: CreateWorkspaceWizardProps) {
    const [step, setStep] = useState<Step>("identity")
    const [loading, setLoading] = useState(false)
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [primaryColor, setPrimaryColor] = useState("#ccff00")
    const [invites, setInvites] = useState<string[]>([])
    const [inviteInput, setInviteInput] = useState("")

    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Step 1: Create Workspace (Identity)
    const handleCreateIdentity = async () => {
        if (!name.trim()) return toast.error("Please enter a workspace name")

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substring(2, 7)

            const { data, error } = await supabase
                .from("workspaces")
                .insert([{
                    name,
                    slug,
                    status: "ACTIVE",
                    created_by: user.id
                }])
                .select()
                .single()

            if (error) throw error

            setWorkspaceId(data.id)
            setStep("branding")
        } catch (error: any) {
            console.error("Workspace creation error:", error)
            toast.error(`Failed to create workspace: ${error.message || "Unknown error"}`)
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Update Branding
    const handleUpdateBranding = async () => {
        if (!workspaceId) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from("workspaces")
                .update({
                    logo_url: logoUrl,
                    branding_config: { primaryColor }
                })
                .eq("id", workspaceId)

            if (error) throw error
            setStep("team")
        } catch (error) {
            console.error(error)
            toast.error("Failed to save branding")
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Send Invites & Finish
    const handleFinish = async () => {
        if (!workspaceId) return

        setLoading(true)
        try {
            // Create invites if any
            if (invites.length > 0) {
                const inviteData = invites.map(email => ({
                    workspace_id: workspaceId,
                    email,
                    token: Math.random().toString(36).substring(2) + Date.now().toString(36),
                    status: 'PENDING'
                }))

                const { error } = await supabase
                    .from("workspace_invites")
                    .insert(inviteData)

                if (error) throw error
                toast.success(`Sent ${invites.length} invitations!`)
            }

            onComplete()
        } catch (error) {
            console.error(error)
            toast.error("Failed to send invites")
        } finally {
            setLoading(false)
        }
    }

    // File Upload Handler
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const uploadToast = toast.loading("Uploading logo...")

        try {
            const { error: uploadError } = await supabase.storage
                .from("logos")
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("logos")
                .getPublicUrl(filePath)

            setLogoUrl(publicUrl)
            toast.success("Logo uploaded!", { id: uploadToast })
        } catch (error) {
            console.error(error)
            toast.error("Upload failed", { id: uploadToast })
        }
    }

    const addInvite = () => {
        if (inviteInput && !invites.includes(inviteInput)) {
            setInvites([...invites, inviteInput])
            setInviteInput("")
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${step === 'identity' ? 'bg-[var(--brand)]' : 'bg-zinc-800'}`} />
                            <div className={`w-2 h-2 rounded-full ${step === 'branding' ? 'bg-[var(--brand)]' : 'bg-zinc-800'}`} />
                            <div className={`w-2 h-2 rounded-full ${step === 'team' ? 'bg-[var(--brand)]' : 'bg-zinc-800'}`} />
                        </div>
                        <span className="text-sm font-medium text-zinc-400 ml-2">
                            {step === 'identity' && "Step 1: Identity"}
                            {step === 'branding' && "Step 2: Branding"}
                            {step === 'team' && "Step 3: Team"}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === "identity" && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Name your Workspace</h2>
                                    <p className="text-zinc-400">What should we call your agency or team?</p>
                                </div>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Acme Agency"
                                    className="bg-zinc-900 border-zinc-800 h-12 text-lg"
                                    autoFocus
                                />
                            </motion.div>
                        )}

                        {step === "branding" && (
                            <motion.div
                                key="branding"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Make it yours</h2>
                                    <p className="text-zinc-400">Upload a logo and pick your vibe.</p>
                                </div>

                                <div className="flex justify-center">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[var(--brand)] bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
                                    >
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="text-zinc-500 group-hover:text-[var(--brand)] mb-2" />
                                                <span className="text-xs text-zinc-500">Upload Logo</span>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoUpload}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg border border-zinc-700 shrink-0 transition-colors"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <Input
                                            value={primaryColor}
                                            onChange={(e) => {
                                                setPrimaryColor(e.target.value)
                                                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                                    document.documentElement.style.setProperty("--brand", e.target.value)
                                                }
                                            }}
                                            placeholder="#ccff00"
                                            className="bg-zinc-900 border-zinc-800 font-mono"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === "team" && (
                            <motion.div
                                key="team"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Invite your Squad</h2>
                                    <p className="text-zinc-400">Work is better together.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={inviteInput}
                                            onChange={(e) => setInviteInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addInvite()}
                                            placeholder="colleague@example.com"
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                        <Button onClick={addInvite} variant="secondary">
                                            <Plus size={18} />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {invites.map((email) => (
                                            <div key={email} className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-sm flex items-center gap-2">
                                                {email}
                                                <button onClick={() => setInvites(invites.filter(i => i !== email))} className="text-zinc-500 hover:text-white">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-900">
                                    <Label className="text-xs text-zinc-500 mb-2 block">OR COPY INVITE LINK</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-500 truncate">
                                            https://ninjagenz.app/invite/{workspaceId}
                                        </div>
                                        <Button variant="outline" size="icon" onClick={() => toast.success("Link copied!")}>
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex justify-between shrink-0">
                    {step !== 'identity' ? (
                        <Button variant="ghost" onClick={() => setStep(step === 'team' ? 'branding' : 'identity')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div />}

                    <Button
                        onClick={() => {
                            if (step === 'identity') handleCreateIdentity()
                            else if (step === 'branding') handleUpdateBranding()
                            else handleFinish()
                        }}
                        disabled={loading}
                        className="bg-[var(--brand)] text-black hover:opacity-90 min-w-[120px]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                {step === 'team' ? "Finish" : "Next"}
                                {step !== 'team' && <ArrowRight className="ml-2 h-4 w-4" />}
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
