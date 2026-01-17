"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import { Mail, Shield, Briefcase, Users, DollarSign, User, Loader2, UserPlus } from "lucide-react"

// Fallback roles if fetch fails
const FALLBACK_ROLES = [
  { id: "SQUAD_MEMBER", name: "Squad Member", description: "Standard access" },
]

export function InviteModal({ children, workspaceId }: { children?: React.ReactNode, workspaceId?: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)

  const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open) {
      fetchRoles()
    }
  }, [open, workspaceId])

  const fetchRoles = async () => {
    setRolesLoading(true)
    try {
      // Get current user's workspace if not provided
      let targetWorkspaceId = workspaceId
      if (!targetWorkspaceId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: membership } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .single()
          targetWorkspaceId = membership?.workspace_id
        }
      }

      if (!targetWorkspaceId) return

      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("workspace_id", targetWorkspaceId)
        .order("is_system", { ascending: false }) // System roles first (Owner)
        .order("name", { ascending: true })

      if (error) throw error
      
      setRoles(data || [])
      // Default select the first non-owner role, or just the second one
      if (data && data.length > 0) {
        const defaultRole = data.find(r => r.name === 'Member') || data[0]
        setSelectedRoleId(defaultRole.id)
      }
    } catch (error) {
      console.error("Failed to fetch roles", error)
      setRoles(FALLBACK_ROLES) // Use fallback for UI preview if DB fails
    } finally {
      setRolesLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneratedLink("")

    try {
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

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const { error } = await supabase
        .from("invites") // Changed from workspace_invites to invites
        .insert({
          workspace_id: targetWorkspaceId,
          email,
          role_id: selectedRoleId, // Use role_id now
          token,
          created_by: user.id,
        })

      if (error) throw error

      const inviteLink = `${window.location.origin}/invite/${token}`
      setGeneratedLink(inviteLink)

      toast.success("Invite generated!")
      setCopied(false)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success("Link copied to clipboard")
  }

  const getRoleIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes("admin") || n.includes("owner")) return Shield
    if (n.includes("manager")) return Briefcase
    if (n.includes("buyer")) return DollarSign
    if (n.includes("client")) return User
    return Users
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-white text-black hover:bg-white/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-white/10 text-white p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Invite to Workspace</DialogTitle>
            <DialogDescription className="text-white/60">
              Generate a unique invite link for your team member.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {!generatedLink ? (
            <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/80">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80">Select Role</Label>
                {rolesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {roles.map((r) => {
                      const Icon = getRoleIcon(r.name)
                      const isSelected = selectedRoleId === r.id
                      return (
                        <div
                          key={r.id}
                          onClick={() => setSelectedRoleId(r.id)}
                          className={`
                            cursor-pointer p-3 rounded-lg border transition-all flex items-start gap-3
                            ${isSelected 
                              ? "border-[var(--brand)] bg-[var(--brand)]/10" 
                              : "border-white/10 bg-white/5 hover:bg-white/10"}
                          `}
                        >
                          <div className={`p-2 rounded-md ${isSelected ? "text-[var(--brand)] bg-[var(--brand)]/20" : "text-white/60 bg-white/10"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-medium text-sm ${isSelected ? "text-[var(--brand)]" : "text-white"}`}>
                              {r.name}
                            </div>
                            <div className="text-xs text-white/50 leading-snug mt-0.5">
                              {r.description || "No description"}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3 text-green-500">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-green-500">Invite Created!</h3>
                <p className="text-xs text-green-500/80 mt-1">Share this link with your team member.</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Invite Link</Label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="bg-white/5 border-white/10 text-white font-mono text-xs"
                  />
                  <Button onClick={copyLink} type="button" variant="secondary" className="shrink-0">
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end">
          {!generatedLink ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1 sm:flex-none text-white/60 hover:text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="invite-form" 
                disabled={loading || !selectedRoleId} 
                className="flex-1 sm:flex-none bg-white text-black hover:bg-white/90"
              >
                {loading ? "Generating..." : "Generate Invite Link"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setOpen(false)} className="w-full bg-white text-black hover:bg-white/90">
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
