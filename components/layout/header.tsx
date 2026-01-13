"use client"

import { Search, Bell, User, Settings, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { XPBar } from "@/components/shared/xp-bar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HeaderProps {
    user: {
        full_name: string
        nickname?: string | null
        xp_points: number
        ninja_level: number
        avatar_url: string | null
    } | null
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 bg-transparent pointer-events-none">
            {/* Search - Left Side */}
            <div className="relative w-96 pointer-events-auto" data-tour="command-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <Input
                    placeholder="Search tasks, personas... (Cmd+K)"
                    className="pl-10 bg-white/5 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[var(--brand)] backdrop-blur-sm rounded-full"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {user && <XPBar xp={user.xp_points} level={user.ninja_level} />}

                <button className="relative p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                    <Bell size={20} className="text-zinc-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--brand)] rounded-full animate-pulse shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
                </button>

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50">
                                <img
                                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.full_name}`}
                                    alt={user.full_name}
                                    className="w-7 h-7 rounded-full border-2 border-white/20"
                                />
                                <span className="text-sm text-zinc-100 liquid-text">{user.nickname || user.full_name}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 glass-panel border-white/20 backdrop-blur-xl"
                        >
                            {/* Header with User Info */}
                            <div className="px-3 py-2 border-b border-white/10">
                                <p className="text-sm font-semibold text-white">{user.full_name}</p>
                                <p className="text-xs text-zinc-400">Level {user.ninja_level} • {user.xp_points} XP</p>
                            </div>

                            {/* Menu Items */}
                            <Link href="/settings/profile">
                                <DropdownMenuItem className="cursor-pointer text-zinc-200 focus:text-white focus:bg-white/10">
                                    <User size={16} className="mr-2" />
                                    My Profile
                                </DropdownMenuItem>
                            </Link>

                            <Link href="/settings">
                                <DropdownMenuItem className="cursor-pointer text-zinc-200 focus:text-white focus:bg-white/10">
                                    <Settings size={16} className="mr-2" />
                                    Workspace Settings
                                </DropdownMenuItem>
                            </Link>

                            <DropdownMenuSeparator className="bg-white/10" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                            >
                                <LogOut size={16} className="mr-2" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}
