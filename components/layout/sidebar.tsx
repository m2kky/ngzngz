"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Layout,
    FileText,
    Target,
    BarChart3,
    Users,
    UserPlus,
    Binoculars,
    Archive,
    LogOut,
    Calendar,
    CheckCircle,
    Settings as SettingsIcon,
    Bell,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    Palette,
    Trophy,
    Video,
    Sparkles,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { InviteModal } from "@/components/invites/invite-modal"

interface SidebarProps {
    workspaceName: string
    workspaceLogo?: string | null
    workspaceId?: string
    userRole: string
}

// ... imports and constant definitions remain same ...

// Remove the broken block here

const ADMIN_ROLES = ["SYSTEM_ADMIN", "ACCOUNT_MANAGER"]
const MEMBER_ROLES = ["SQUAD_MEMBER", "FREELANCER", "MEDIA_BUYER", "SYSTEM_ADMIN", "ACCOUNT_MANAGER"] // Everyone

type NavGroup = {
    title: string
    items: {
        name: string
        icon: any
        path: string
        tourId: string
        hidden?: boolean
        adminOnly?: boolean
    }[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: "FOCUS",
        items: [
            { name: "Dashboard", icon: Layout, path: "/dashboard", tourId: "dashboard-xp" },
            { name: "My Tasks", icon: CheckCircle, path: "/tasks", tourId: "my-tasks" },
            { name: "Inbox", icon: Bell, path: "/inbox", tourId: "inbox" },
        ]
    },
    {
        title: "WORK",
        items: [
            { name: "Projects", icon: FolderKanban, path: "/projects", tourId: "projects" },
        ]
    },
    {
        title: "ASSETS",
        items: [
            { name: "Brand Kit", icon: Palette, path: "/brand", tourId: "brand-kit" },
            { name: "Strategy Hub", icon: Target, path: "/strategy", tourId: "strategy-hub" },
            { name: "Dojo", icon: Trophy, path: "/dojo", tourId: "dojo" },
        ]
    },
    {
        title: "MANAGEMENT",
        items: [
            { name: "Ad Center", icon: BarChart3, path: "/ads", tourId: "ad-center", adminOnly: true }, // Logic can be refined for Media Buyer
            { name: "Flash Reports", icon: Sparkles, path: "/reports", tourId: "reports", adminOnly: true },
            { name: "Ninja Flows", icon: Zap, path: "/automation", tourId: "automation", adminOnly: true },
            { name: "Squad", icon: Users, path: "/squad", tourId: "squad", adminOnly: true },
        ]
    }
]

export function Sidebar({ workspaceName, workspaceLogo, workspaceId, userRole }: SidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const isAdmin = ADMIN_ROLES.includes(userRole)
    const isMediaBuyer = userRole === 'MEDIA_BUYER'

    const handleLogout = async () => {
        window.location.href = "/login"
    }

    const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
        const Icon = item.icon
        return (
            <Link href={item.path} className="block mb-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative group">
                            {isActive && (
                                <div className="absolute inset-0 bg-[var(--brand)]/20 blur-xl rounded-lg -z-10 animate-pulse" />
                            )}
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                data-tour={item.tourId}
                                className={cn(
                                    "w-full justify-start gap-3 transition-all duration-300 relative z-10 font-medium",
                                    isActive
                                        ? "bg-[var(--brand)] text-black hover:opacity-90 shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <Icon size={18} className={isActive ? "drop-shadow-lg" : ""} />
                                {!isCollapsed && <span className="liquid-text">{item.name}</span>}
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" className="glass-panel border-white/20">
                            {item.name}
                        </TooltipContent>
                    )}
                </Tooltip>
            </Link>
        )
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "flex-shrink-0 glass-panel glass-panel-hover liquid-gloss flex flex-col transition-all duration-300 ease-in-out rounded-3xl my-4 ml-4 border-white/10",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                {/* Workspace Name */}
                <div
                    className={cn(
                        "h-16 flex items-center border-b border-white/10 transition-all",
                        isCollapsed ? "justify-center px-2" : "justify-between px-4"
                    )}
                >
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 flex-1 mr-2 overflow-hidden">
                            <div className="w-8 h-8 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden backdrop-blur-sm">
                                {workspaceLogo ? (
                                    <img src={workspaceLogo} alt={workspaceName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-zinc-200">{workspaceName?.[0]}</span>
                                )}
                            </div>
                            <h1 className="font-bold text-sm truncate text-zinc-100 liquid-text">
                                {workspaceName}
                            </h1>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </Button>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 py-6 px-2 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {NAV_GROUPS.map((group) => {
                        // Filter items based on role
                        const visibleItems = group.items.filter(item => {
                            if (item.hidden) return false
                            if (item.adminOnly && !isAdmin) {
                                // Special case: Media Buyer sees Ad Center
                                if (item.path === "/ads" && isMediaBuyer) return true
                                return false
                            }
                            return true
                        })

                        if (visibleItems.length === 0) return null

                        return (
                            <div key={group.title}>
                                {!isCollapsed && (
                                    <h3 className="text-[10px] font-black tracking-widest text-zinc-600 mb-2 px-3">{group.title}</h3>
                                )}
                                {visibleItems.map(item => (
                                    <NavItem
                                        key={item.path}
                                        item={item}
                                        isActive={pathname === item.path}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-white/10 space-y-1">
                    {/* Invite Button - Admin Only */}
                    {isAdmin && (
                        <InviteModal workspaceId={workspaceId}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <UserPlus size={18} />
                                {!isCollapsed && <span>Invite Ninja</span>}
                            </Button>
                        </InviteModal>
                    )}


                    {isAdmin && (
                        <NavItem
                            item={{ name: "Settings", icon: SettingsIcon, path: "/settings" }}
                            isActive={pathname === "/settings"}
                        />
                    )}

                    <NavItem
                        item={{ name: "Notifications", icon: Bell, path: "/notifications" }} // Moved to Focus group but keeping generic access here if needed, or remove? User said "Inbox" in Focus. I'll keep generic bell here? No, duplicate.
                        isActive={pathname === "/notifications"}
                    />
                    {/* Actually, user put "Inbox/Notifications" in Group 1. I put it there. Removing from footer or checking redundancy. */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className={cn(
                                    "w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <LogOut size={18} />
                                {!isCollapsed && <span>Logout</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right" className="glass-panel text-red-400 border-red-500/20">
                                Logout
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
