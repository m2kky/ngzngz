"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Mail, UserPlus, Shield, Briefcase, Users, DollarSign, User } from "lucide-react"

const roles = [
  {
    id: "ADMIN",
    label: "Admin",
    description: "Full access to everything",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    id: "ACCOUNT_MANAGER",
    label: "Account Manager",
    description: "Client facing & Strategy",
    icon: Briefcase,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "SQUAD_MEMBER",
    label: "Squad Member",
    description: "Creatives & Editors",
    icon: Users,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: "MEDIA_BUYER",
    label: "Media Buyer",
    description: "Ad Center Access",
    icon: DollarSign,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    id: "CLIENT",
    label: "Client",
    description: "View-only access",
    icon: User,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
]

export function InviteModal({ children, workspaceId }: { children?: React.ReactNode, workspaceId?: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("SQUAD_MEMBER")
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneratedLink("")

    try {
      // 1. Get current user's workspace
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let targetWorkspaceId = workspaceId;

      if (!targetWorkspaceId) {
        const { data: membership } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
          .single()

        if (!membership) throw new Error("No workspace found")
        targetWorkspaceId = membership.workspace_id
      }

      // 2. Create invite record
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const { error } = await supabase
        .from("workspace_invites")
        .insert({
          workspace_id: targetWorkspaceId,
          email,
          role,
          token,
          created_by: user.id,
        })

      if (error) throw error

      // 3. Generate Link
      const inviteLink = `${window.location.origin}/auth?token=${token}`
      setGeneratedLink(inviteLink)

      toast.success("Invite generated!")
      setCopied(false)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success("Link copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Ninja
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle>Summon a Team Member</DialogTitle>
          <DialogDescription className="text-white/60">
            Select a role and generate a unique invite link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
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
            <Label>Select Role</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className={`cursor-pointer p-3 rounded-lg border transition-all ${role === r.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  onClick={() => setRole(r.id)}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`p-1.5 rounded-md ${r.bg} ${r.color}`}>
                      <r.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{r.label}</span>
                  </div>
                  <p className="text-xs text-white/50 pl-[34px]">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:gap-0">
            {!generatedLink ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90">
                  {loading ? "Generating..." : "Generate Invite Link"}
                </Button>
              </>
            ) : (
              <div className="w-full space-y-3">
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="bg-white/5 border-white/10 text-zinc-400 font-mono text-xs" />
                  <Button
                    type="button"
                    onClick={copyToClipboard}
                    className={generatedLink ? (copied ? "bg-green-500 hover:bg-green-600 text-white" : "bg-purple-500 hover:bg-purple-600 text-white") : ""}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false)
                  setGeneratedLink("")
                  setEmail("")
                  setRole("SQUAD_MEMBER")
                }} className="w-full text-white/60 hover:bg-white/5 border-white/10">
                  Done
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
