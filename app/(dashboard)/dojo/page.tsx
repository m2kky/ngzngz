"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LeaderboardEntry } from "@/components/gamification/leaderboard-entry"
import { AchievementCard } from "@/components/gamification/achievement-card"
import { Trophy, Award } from "lucide-react"

export default function DojoPage() {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [achievements, setAchievements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Get current user
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            // Get current user's data
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single()

            setCurrentUser(userData)

            // Get leaderboard (all users sorted by weekly_xp)
            const { data: allUsers } = await supabase
                .from('users')
                .select('id, full_name, avatar_url, weekly_xp, ninja_level')
                .order('weekly_xp', { ascending: false })
                .limit(20)

            setLeaderboard(allUsers || [])

            // Get all achievements
            const { data: achievementsData } = await supabase
                .from('achievements')
                .select('*')
                .order('category, xp_reward')

            setAchievements(achievementsData || [])
        } catch (error) {
            console.error('Error fetching dojo data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-zinc-400">Loading Dojo...</div>
            </div>
        )
    }

    const unlockedBadges = (currentUser?.badges as string[]) || []

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Trophy className="text-[var(--brand)]" size={40} />
                    The Dojo
                </h1>
                <p className="text-zinc-400">
                    Master your craft, earn XP, and unlock legendary achievements
                </p>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column A: Weekly Leaderboard */}
                <div>
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            📊 Weekly Leaderboard
                        </h2>

                        <div className="space-y-3">
                            {leaderboard.map((user, index) => (
                                <LeaderboardEntry
                                    key={user.id}
                                    rank={index + 1}
                                    user={user}
                                    isCurrentUser={user.id === currentUser?.id}
                                />
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-8 text-zinc-400">
                                    No users found. Start completing tasks to earn XP!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Column B: Trophy Room */}
                <div>
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="text-[var(--brand)]" size={24} />
                            Trophy Room
                        </h2>

                        {/* Achievement Stats */}
                        <div className="mb-6 p-4 bg-white/5 rounded-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-zinc-400">Unlocked</div>
                                    <div className="text-2xl font-bold text-white">
                                        {unlockedBadges.length} / {achievements.length}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-zinc-400">Progress</div>
                                    <div className="text-2xl font-bold text-[var(--brand)]">
                                        {achievements.length > 0
                                            ? Math.round((unlockedBadges.length / achievements.length) * 100)
                                            : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {achievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    isUnlocked={unlockedBadges.includes(achievement.id)}
                                />
                            ))}

                            {achievements.length === 0 && (
                                <div className="col-span-2 text-center py-8 text-zinc-400">
                                    No achievements available yet. Check back soon!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
