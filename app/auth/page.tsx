"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowRight, Mail, Lock, Building, UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Suspense, useEffect } from "react"

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}

function AuthContent() {
  const [step, setStep] = useState<"identity" | "fork">("identity")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get("token")

  const [inviteToken, setInviteToken] = useState(tokenFromUrl || "")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (tokenFromUrl) {
      setStep("fork") // Show the join option immediately if token exists
      setInviteToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      let user = signInData.user

      if (signInError) {
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          throw signUpError
        }

        user = signUpData.user
        toast.success("Account created!")
      } else {
        toast.success("Welcome back!")
      }

      if (user) {
        // Check if user has any workspaces
        const { data: memberships } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)

        if (memberships && memberships.length > 0) {
          // Condition A: Existing User -> Dashboard
          router.push('/dashboard')
        } else {
          // Condition B: New User -> Onboarding Wizard
          router.push('/onboarding')
        }
      }

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWithToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteToken) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in or sign up first to join a workspace.")
        setStep("identity")
        setLoading(false)
        return
      }

      // 1. Verify Token
      const { data: invite, error: inviteError } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("token", inviteToken)
        .single()

      if (inviteError || !invite) {
        throw new Error("Invalid or expired invite token.")
      }

      // 2. Add Member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: invite.workspace_id,
          user_id: user.id,
          role: invite.role
        })

      if (memberError) {
        // Ignore duplicate key error safely
        if (!memberError.message.includes("duplicate")) {
          throw memberError
        }
      }

      // 3. Delete Invite (One-time use) ?? Or keep it? 
      // Typically verify if used. For now, we deleted it to prevent re-use if intended one-time.
      // But maybe multi-use? Let's check schema/intent. 
      // User asked "send to people". Usually links are unique or general. 
      // If unique, delete. Logic above generates unique token per invite request.
      // Let's delete it.
      await supabase.from("workspace_invites").delete().eq("token", inviteToken)

      toast.success("Joined workspace successfully!")
      router.push("/dashboard")

    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Glass Modal */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl animate-fade-in-up">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="p-3 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === "identity" ? "Welcome to the Dojo" : "Choose Your Path"}
          </h1>
        </div>

        {step === "identity" && (
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ninja@agency.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Processing..." : "Continue"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        )}

        {step === "fork" && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/onboarding")}
              className="group p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center gap-4"
            >
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Create New Agency</h3>
                <p className="text-sm text-white/60">Start a fresh workspace</p>
              </div>
              <ArrowRight className="ml-auto w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-white/40">Or</span>
              </div>
            </div>

            <form onSubmit={handleJoinWithToken} className="flex flex-col gap-2">
              <div className="relative">
                <UserPlus className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Enter Invite Token"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleJoinWithToken} disabled={loading} variant="secondary" className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Join Existing Workspace
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
