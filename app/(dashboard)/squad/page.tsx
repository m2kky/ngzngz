"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import type { Database } from "@/types/database"
import { toast } from "sonner"

type User = Database["public"]["Tables"]["users"]["Row"]

export default function SquadPage() {
    const [teamMembers, setTeamMembers] = useState<User[]>([])
    const supabase = createClient() as any

    useEffect(() => {
        fetchTeamMembers()
    }, [])

    async function fetchTeamMembers() {
        const { data } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) {
            setTeamMembers(data)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Squad</h2>
                <Button
                    onClick={() => toast.success("Invite link copied!")}
                    className="bg-[#ccff00] text-black hover:bg-[#b3ff00]"
                >
                    <Plus size={16} className="mr-2" />
                    Invite Member
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                    <Card key={member.id} className="glass-card p-6 flex items-center gap-4 hover:border-white/20 transition-colors">
                        <Avatar className="w-16 h-16 border-2 border-white/10">
                            <AvatarImage
                                src={member.avatar_url || `https://i.pravatar.cc/150?u=${member.email}`}
                            />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                {(member.full_name?.[0] || member.email?.[0] || "?").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-white font-bold">{member.full_name || "Unknown Ninja"}</h3>
                            <p className="text-zinc-500 text-sm">{member.role || "Member"}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[#ccff00] text-xs font-mono">
                                    {member.xp_points || 0} XP
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400 text-xs">Lvl {member.ninja_level || 1}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
