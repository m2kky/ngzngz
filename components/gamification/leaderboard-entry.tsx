"use client"

import { Trophy, Star, Medal } from "lucide-react"

interface LeaderboardEntryProps {
    rank: number
    user: {
        id: string
        full_name: string
        avatar_url: string | null
        weekly_xp: number
        ninja_level: number
    }
    isCurrentUser?: boolean
}

export function LeaderboardEntry({ rank, user, isCurrentUser }: LeaderboardEntryProps) {
    const getMedalIcon = () => {
        switch (rank) {
            case 1:
                return <Trophy size={20} className="text-yellow-400" />
            case 2:
                return <Star size={20} className="text-gray-400" />
            case 3:
                return <Medal size={20} className="text-orange-600" />
            default:
                return null
        }
    }

    const getBorderClass = () => {
        switch (rank) {
            case 1:
                return "border-2 border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            case 2:
                return "border-2 border-gray-400/30 shadow-[0_0_20px_rgba(156,163,175,0.3)]"
            case 3:
                return "border-2 border-orange-600/30 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
            default:
                return "border border-white/10"
        }
    }

    return (
        <div className={`glass-panel p-4 rounded-xl ${getBorderClass()} ${isCurrentUser ? 'ring-2 ring-[var(--brand)]/50' : ''} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center gap-4">
                {/* Rank Number and Medal */}
                <div className="flex items-center gap-2 w-12">
                    <div className={`text-lg font-bold ${rank <= 3 ? 'text-white' : 'text-zinc-400'}`}>
                        #{rank}
                    </div>
                    {getMedalIcon()}
                </div>

                {/* Avatar */}
                <img
                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.full_name}`}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                />

                {/* User Info */}
                <div className="flex-1">
                    <div className="font-semibold text-white">
                        {user.full_name}
                        {isCurrentUser && <span className="ml-2 text-xs text-[var(--brand)]">(You)</span>}
                    </div>
                    <div className="text-sm text-zinc-400">
                        Level {user.ninja_level}
                    </div>
                </div>

                {/* Weekly XP */}
                <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--brand)]">
                        {user.weekly_xp}
                    </div>
                    <div className="text-xs text-zinc-400">XP this week</div>
                </div>
            </div>
        </div>
    )
}
