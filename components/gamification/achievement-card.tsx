"use client"

import { Lock, Sparkles } from "lucide-react"

interface AchievementCardProps {
    achievement: {
        id: string
        title: string
        description: string | null
        xp_reward: number
        icon_url: string | null
        category: string
    }
    isUnlocked: boolean
}

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
    return (
        <div className={`relative group ${isUnlocked ? 'glass-panel' : 'bg-white/5 backdrop-blur-sm'} p-6 rounded-xl border-2 transition-all hover:scale-105 ${isUnlocked ? 'border-[var(--brand)]/30 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)]' : 'border-white/10'
            }`}>
            {/* Locked Overlay */}
            {!isUnlocked && (
                <div className="absolute inset-0 backdrop-blur-sm bg-black/50 rounded-xl flex items-center justify-center z-10">
                    <Lock size={32} className="text-zinc-600" />
                </div>
            )}

            {/* Achievement Icon */}
            <div className="flex justify-center mb-4">
                {achievement.icon_url ? (
                    <img
                        src={achievement.icon_url}
                        alt={achievement.title}
                        className={`w-16 h-16 ${!isUnlocked ? 'grayscale opacity-30' : 'drop-shadow-[0_0_12px_var(--brand)]'}`}
                    />
                ) : (
                    <div className={`w-16 h-16 rounded-full ${isUnlocked ? 'bg-gradient-to-br from-[var(--brand)] to-purple-500' : 'bg-zinc-700'} flex items-center justify-center`}>
                        <Sparkles size={32} className={isUnlocked ? 'text-black' : 'text-zinc-500'} />
                    </div>
                )}
            </div>

            {/* Achievement Info */}
            <div className="text-center">
                <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {achievement.title}
                </h3>
                <p className={`text-xs mb-3 ${isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {achievement.description || 'Complete to unlock'}
                </p>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isUnlocked ? 'bg-[var(--brand)]/20 text-[var(--brand)]' : 'bg-zinc-800 text-zinc-600'
                    }`}>
                    +{achievement.xp_reward} XP
                </div>
            </div>

            {/* Unlocked Glow Effect */}
            {isUnlocked && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--brand)]/10 to-purple-500/10 pointer-events-none group-hover:from-[var(--brand)]/20 group-hover:to-purple-500/20 transition-all" />
            )}
        </div>
    )
}
