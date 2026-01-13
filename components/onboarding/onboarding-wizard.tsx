"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Rocket, Briefcase, Target, FolderPlus, ArrowRight, Loader2, CheckCircle2, Building2 } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@/types/database"
import { cn } from "@/lib/utils"

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]

interface OnboardingWizardProps {
    user: any
    currentWorkspace: Workspace | null
}

const STEPS = [
    { title: "Agency Identity", description: "Establish your HQ", icon: Building2 },
    { title: "First Client", description: "Who are we serving?", icon: Briefcase },
    { title: "Brand DNA", description: "Define the strategy", icon: Target },
    { title: "First Mission", description: "Launch the project", icon: Rocket },
]

export function OnboardingWizard({ user, currentWorkspace }: OnboardingWizardProps) {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isComplete, setIsComplete] = useState(false)

    // Form State
    const [agencyName, setAgencyName] = useState("")
    const [agencyLogo, setAgencyLogo] = useState("")

    const [clientName, setClientName] = useState("")
    const [clientIndustry, setClientIndustry] = useState("")

    const [brandVoice, setBrandVoice] = useState("")
    const [brandTone, setBrandTone] = useState("")

    const [projectName, setProjectName] = useState("")
    const [projectType, setProjectType] = useState("Social Media Campaign")

    // Validation
    const isStep1Valid = agencyName.length > 2
    const isStep2Valid = clientName.length > 2
    const isStep3Valid = brandVoice.length > 2
    const isStep4Valid = projectName.length > 2

    useEffect(() => {
        if (currentWorkspace?.name && !agencyName) {
            setAgencyName(currentWorkspace.name)
        }
    }, [currentWorkspace])

    const handleNext = () => {
        if (step < 4) setStep(step + 1)
        else handleComplete()
    }

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            if (!currentWorkspace?.id) throw new Error("Workspace not found")

            // 1. Update Agency (Workspace)
            const { error: wsError } = await supabase
                .from("workspaces")
                .update({ name: agencyName, logo_url: agencyLogo || null } as any)
                .eq("id", currentWorkspace.id)

            if (wsError) throw wsError

            // 2. Create Client
            const { data: client, error: clientError } = await supabase
                .from("clients")
                .insert({
                    workspace_id: currentWorkspace.id,
                    name: clientName,
                    // Store industry in metadata or description if explicit column doesn't exist?
                    // Assuming name is enough for now, or storing industry in contact_email for hack/demo
                })
                .select()
                .single()

            if (clientError) throw clientError

            // 3. Create Strategy (Optional/Mock for now if table missing, OR insert if exists)
            // Attempting to insert into 'strategies' - if it fails, we catch and ignore (graceful degradation)
            try {
                await supabase
                    .from("strategies") // Assumption: table exists based on "StrategyCreator" context
                    .insert({
                        workspace_id: currentWorkspace.id,
                        client_id: client.id,
                        name: `${clientName} Brand Strategy`,
                        situation: { internal: { uvp: brandVoice }, swot: {} }, // Minimal data
                        strategy: { coreMessaging: brandTone }
                    } as any)
            } catch (e) {
                console.warn("Strategy table might not exist, skipping strategy creation", e)
            }

            // 4. Create Project
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .insert({
                    workspace_id: currentWorkspace.id,
                    client_id: client.id,
                    name: projectName,
                    description: `Initial ${projectType} for ${clientName}`,
                    status: 'ACTIVE',
                    start_date: new Date().toISOString(),
                    // total_budget: 0 // Optional
                })
                .select()
                .single()

            if (projectError) throw projectError

            // Success!
            setIsComplete(true)
            toast.success("Agency Setup Complete!", { description: "Redirecting to your first mission..." })

            // Redirect after delay
            setTimeout(() => {
                router.push(`/projects/${project.id}`)
                // Refresh to ensure sidebar/context updates?
                router.refresh()
            }, 1500)

        } catch (error: any) {
            console.error("Onboarding Error:", error)
            toast.error("Failed to setup your agency", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    if (isComplete) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="w-24 h-24 bg-[#ccff00] rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(204,255,0,0.5)]">
                        <Rocket size={48} className="text-black animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black text-white">All Systems Go!</h1>
                    <p className="text-zinc-400">Launching your first mission...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col">
            {/* Header / Progress */}
            <div className="h-20 border-b border-white/10 flex items-center px-8 justify-between bg-zinc-900/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--brand)] rounded-lg flex items-center justify-center font-black text-black">
                        NZ
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Agency Setup</h1>
                        <p className="text-xs text-zinc-500">Step {step} of 4</p>
                    </div>
                </div>
                <div className="w-64">
                    <Progress value={(step / 4) * 100} className="h-2" indicatorClassName="bg-[var(--brand)]" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Context/Guide */}
                <div className="w-1/3 bg-zinc-900 border-r border-white/10 p-12 hidden lg:flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay" />

                    <div className="relative z-10">
                        <div className="mb-12">
                            {STEPS.map((s, i) => (
                                <div key={i} className={cn("flex items-center gap-4 mb-6 transition-all", step === i + 1 ? "opacity-100 translate-x-2" : "opacity-40")}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border",
                                        step === i + 1 ? "bg-[var(--brand)] border-[var(--brand)] text-black font-bold" :
                                            step > i + 1 ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-700 text-zinc-500"
                                    )}>
                                        {step > i + 1 ? <CheckCircle2 size={20} /> : i + 1}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-lg", step === i + 1 ? "text-white" : "text-zinc-400")}>{s.title}</h3>
                                        <p className="text-sm text-zinc-500">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 text-zinc-500 text-sm">
                        "Success is not final, failure is not fatal: it is the courage to continue that counts."
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex-1 p-12 overflow-y-auto flex items-center justify-center relative">
                    {/* Gloss Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--brand)]/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="w-full max-w-xl relative z-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">Name your HQ</h2>
                                    <p className="text-zinc-400">Every legendary agency needs a name that strikes fear (or joy) into the heart of the market.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base">Agency Name</Label>
                                        <Input
                                            value={agencyName}
                                            onChange={(e) => setAgencyName(e.target.value)}
                                            placeholder="e.g. Midnight Creative"
                                            className="h-14 text-lg bg-zinc-900/50 border-white/10 mt-2"
                                            autoFocus
                                        />
                                    </div>
                                    {/* Logo Upload Mock */}
                                    <div>
                                        <Label className="text-base text-zinc-400">Logo URL (Optional)</Label>
                                        <Input
                                            value={agencyLogo}
                                            onChange={(e) => setAgencyLogo(e.target.value)}
                                            placeholder="https://..."
                                            className="bg-zinc-900/50 border-white/10 mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">First Client</h2>
                                    <p className="text-zinc-400">Who is the lucky brand taking the first ride with you?</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base">Client Name</Label>
                                        <Input
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder="e.g. Nike, Red Bull, Local Cafe"
                                            className="h-14 text-lg bg-zinc-900/50 border-white/10 mt-2"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-base text-zinc-400">Industry</Label>
                                        <Input
                                            value={clientIndustry}
                                            onChange={(e) => setClientIndustry(e.target.value)}
                                            placeholder="e.g. Fashion, Tech, F&B"
                                            className="bg-zinc-900/50 border-white/10 mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">Brand DNA</h2>
                                    <p className="text-zinc-400">Define the core essence of {clientName || "the client"}.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base">Brand Voice (Keywords)</Label>
                                        <Textarea
                                            value={brandVoice}
                                            onChange={(e) => setBrandVoice(e.target.value)}
                                            placeholder="e.g. Bold, Rebellious, Professional, Friendly..."
                                            className="bg-zinc-900/50 border-white/10 mt-2 min-h-[100px]"
                                            autoFocus
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">This feeds into the AI Strategy engine.</p>
                                    </div>
                                    <div>
                                        <Label className="text-base text-zinc-400">Core Message / Tone</Label>
                                        <Input
                                            value={brandTone}
                                            onChange={(e) => setBrandTone(e.target.value)}
                                            placeholder="e.g. 'Just Do It' vibes"
                                            className="bg-zinc-900/50 border-white/10 mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">The First Mission</h2>
                                    <p className="text-zinc-400">What are we executing for {clientName}?</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-base">Project Name</Label>
                                        <Input
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="e.g. Q4 Launch Campaign"
                                            className="h-14 text-lg bg-zinc-900/50 border-white/10 mt-2"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {["Social Media", "Paid Ads", "Rebranding", "SEO"].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => setProjectType(type)}
                                                className={cn(
                                                    "p-4 rounded-xl border cursor-pointer transition-all hover:scale-105",
                                                    projectType === type ? "bg-[var(--brand)] text-black border-[var(--brand)] font-bold shadow-lg" : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex pt-6 gap-4">
                            {step > 1 && (
                                <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
                                    Back
                                </Button>
                            )}
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 2 && !isStep2Valid) ||
                                    (step === 3 && !isStep3Valid) ||
                                    (step === 4 && !isStep4Valid) ||
                                    isLoading
                                }
                                className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold h-12 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Initializing...
                                    </>
                                ) : step === 4 ? (
                                    <>
                                        Launch Agency
                                        <Rocket className="w-5 h-5 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Next Step
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
