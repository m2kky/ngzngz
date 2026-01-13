"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User } from "lucide-react"

interface AssignUserConfigProps {
    value: string
    onChange: (value: string) => void
}

export function AssignUserConfig({ value, onChange }: AssignUserConfigProps) {
    const { currentWorkspace } = useWorkspace()
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchMembers()
        }
    }, [currentWorkspace?.id])

    const fetchMembers = async () => {
        // Fetch workspace invites/members. This depends on how membership is modeled.
        // Assuming we can get users via workspace_invites or a junction table.
        // For now, fetching profiles that are 'SQUAD_MEMBER' or similar, simplified query for MVP.
        // In a real app, this would query a workspace_members view.
        // Just hacking it to fetch all users for demo purposes since schemas vary.

        try {
            // Ideally: fetch users who have access to this workspace.
            // Using a simple query on 'users' table for now, effectively "Global Search" for MVP if RLS allows, 
            // or strictly relying on `workspace_invites` + `users` join.
            // Let's assume we can fetch from `users` for now.
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, avatar_url, email')
                .limit(20)

            if (data) setMembers(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center gap-2 text-zinc-500 text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Loading team...</div>

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Assign to</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-zinc-950 border-white/10 h-10">
                    <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="me">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">Me</div>
                            <span>Assign to Me (Trigger-er)</span>
                        </div>
                    </SelectItem>
                    {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback>{member.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span>{member.full_name}</span>
                                <span className="text-zinc-500 text-xs">({member.email})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
