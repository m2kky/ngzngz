"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LevelProgressRing } from "@/components/gamification/level-progress-ring"
import { Trophy, Target } from "lucide-react"
import Link from "next/link"

export function NinjaStatusWidget() {
    const [user, setUser] = useState<any>(null)
    const [rank, setRank] = useState<number | null>(null)
    const [nextAchievement, setNextAchievement] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        // Get user data with gamification fields
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

        if (userData) {
            setUser(userData)

            // Calculate weekly rank
            const { data: allUsers } = await supabase
                .from('users')
                .select('id, weekly_xp')
                .order('weekly_xp', { ascending: false })

            if (allUsers) {
                const userRank = allUsers.findIndex(u => u.id === userData.id) + 1
                setRank(userRank)
            }

            // Get next achievement (first one not yet unlocked)
            const { data: achievements } = await supabase
                .from('achievements')
                .select('*')
                .order('xp_reward')
                .limit(10)

            if (achievements && achievements.length > 0) {
                const unlockedBadges = userData.badges || []
                const nextBadge = achievements.find(a => !unlockedBadges.includes(a.id))
                setNextAchievement(nextBadge)
            }
        }
    }

    if (!user) return null

    return (
        <Link href="/dojo">
            <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all cursor-pointer border-2 border-transparent hover:border-[var(--brand)] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] group">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: Avatar with Level Ring */}
                    <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                        <div className="relative">
                            <LevelProgressRing
                                currentXP={user.xp_points || 0}
                                level={user.ninja_level || 1}
                                size={100}
                            />
                            <img
                                src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.full_name}`}
                                alt={user.full_name}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full object-cover border-2 border-white/20"
                            />
                        </div>
                    </div>

                    {/* Middle: Rank */}
                    <div className="flex-1 text-center">
                        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Weekly Rank</div>
                        <div className="flex items-center justify-center gap-2">
                            {rank && rank <= 3 && (
                                <Trophy
                                    size={24}
                                    className={
                                        rank === 1 ? "text-yellow-400" :
                                            rank === 2 ? "text-gray-400" :
                                                "text-orange-600"
                                    }
                                />
                            )}
                            <div className="text-3xl font-bold text-white">#{rank || '?'}</div>
                        </div>
                        <div className="text-xs text-[var(--brand)] mt-1">
                            {user.weekly_xp || 0} XP this week
                        </div>
                    </div>

                    {/* Right: Next Quest */}
                    <div className="flex-1 text-right">
                        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                            <Target size={12} />
                            Next Quest
                        </div>
                        {nextAchievement ? (
                            <>
                                <div className="text-sm font-semibold text-white truncate">
                                    {nextAchievement.title}
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                    +{nextAchievement.xp_reward} XP
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-zinc-500">All unlocked!</div>
                        )}
                    </div>
                </div>

                {/* Hover hint */}
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <div className="text-xs text-zinc-400 group-hover:text-[var(--brand)] transition-colors">
                        Click to view full Dojo →
                    </div>
                </div>
            </div>
        </Link>
    )
}
