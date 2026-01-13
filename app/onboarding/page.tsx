"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import {
  Crown,
  Palette,
  Laptop,
  BarChart3,
  Target,
  Users,
  Briefcase,
  Rocket,
  ArrowRight,
  Check,
  Building
} from "lucide-react"
import { toast } from "sonner"

// Step 1: Identity Options
const ROLES = [
  { id: 'owner', label: 'Agency Owner', icon: Crown, color: 'text-zinc-100', bg: 'bg-zinc-800/50', border: 'border-zinc-700' },
  { id: 'manager', label: 'Project Manager', icon: Briefcase, color: 'text-zinc-300', bg: 'bg-zinc-800/30', border: 'border-zinc-800' },
  { id: 'creative', label: 'Creative', icon: Palette, color: 'text-zinc-300', bg: 'bg-zinc-800/30', border: 'border-zinc-800' },
  { id: 'media_buyer', label: 'Media Buyer', icon: BarChart3, color: 'text-zinc-300', bg: 'bg-zinc-800/30', border: 'border-zinc-800' },
]

// Step 2: Mission Options
const MISSIONS = [
  { id: 'scaling', label: 'Scaling Ads', icon: Rocket },
  { id: 'organizing', label: 'Systemizing Ops', icon: Users },
  { id: 'creative', label: 'Creative Workflow', icon: Palette },
  { id: 'reporting', label: 'Client Reporting', icon: BarChart3 },
]

export default function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form State
  const [role, setRole] = useState<string | null>(null)
  const [mission, setMission] = useState<string[]>([])
  const [workspaceName, setWorkspaceName] = useState("")
  const [invites, setInvites] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleNext = () => {
    if (step === 1 && !role) return toast.error("Please select your role")
    if (step === 2 && mission.length === 0) return toast.error("Select at least one mission")
    if (step === 3 && !workspaceName) return toast.error("Please name your HQ")

    if (step < 4) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Update User Metadata (Role & Mission)
      const mappedRole = role === 'owner' ? 'SYSTEM_ADMIN' : 'SQUAD_MEMBER'
      await supabase.auth.updateUser({
        data: {
          role: mappedRole,
          mission
        }
      })

      // 2. Create Workspace
      const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substring(2, 7)
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: workspaceName,
          slug,
          created_by: user.id,
          status: 'ACTIVE'
        })
        .select()
        .single()

      if (workspaceError) throw workspaceError

      // 3. Add User to Squad (as Admin/Owner equivalent)
      await supabase.from("squads").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role_in_squad: "LEAD"
      })

      // 4. Handle Invites (Optional)
      if (invites) {
        const emails = invites.split(',').map(e => e.trim()).filter(e => e)
        // In a real app, we would send invites here
        // For now, we just log it or maybe create pending invites
        console.log("Inviting:", emails)
      }

      toast.success("Welcome to the Dojo! 🥷")
      router.push("/dashboard")
      router.refresh()

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-sans text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-white/10 text-white/40'
                }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    Identify Yourself
                  </h1>
                  <p className="text-zinc-400">Who are you in the agency world?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {ROLES.map((r) => {
                    const Icon = r.icon
                    const isSelected = role === r.id
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`p-4 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden ${isSelected
                          ? `${r.bg} ${r.border} ring-1 ring-zinc-500`
                          : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/50 hover:border-white/10'
                          }`}
                      >
                        <div className={`mb-3 ${r.color}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{r.label}</h3>
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="w-4 h-4 rounded-full bg-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Mission */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">Your Mission</h1>
                  <p className="text-zinc-400">What is your main focus right now?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {MISSIONS.map((m) => {
                    const Icon = m.icon
                    const isSelected = mission.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (isSelected) setMission(mission.filter(id => id !== m.id))
                          else setMission([...mission, m.id])
                        }}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${isSelected
                          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-zinc-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {m.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Establish HQ */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">Establish HQ</h1>
                  <p className="text-zinc-400">Name your digital fortress.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                      <Input
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="e.g. Ninja Media"
                        className="pl-10 h-12 bg-black/20 border-white/10 text-lg focus:border-purple-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Assemble Squad */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">Assemble Squad</h1>
                  <p className="text-zinc-400">Invite your elite team members (optional).</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Addresses</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                      <Input
                        value={invites}
                        onChange={(e) => setInvites(e.target.value)}
                        placeholder="ninja1@agency.com, ninja2@agency.com"
                        className="pl-10 h-12 bg-black/20 border-white/10 text-lg focus:border-purple-500/50 transition-all"
                      />
                    </div>
                    <p className="text-xs text-zinc-500">Separate multiple emails with commas.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Back
                </Button>
              ) : <div />}

              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-105"
              >
                {loading ? 'Launching...' : step === 4 ? 'Launch HQ' : 'Next Mission'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
