"use client"

import { LayoutGrid, Table, Calendar, List, Kanban, Map, Activity, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewType = "board" | "table" | "calendar" | "list" | "timeline" | "map" | "activity" | "feed"

interface ViewSwitcherProps {
    currentView: ViewType
    onViewChange: (view: ViewType) => void
}

const VIEWS = [
    { id: "board", label: "Board", icon: LayoutGrid },
    { id: "table", label: "Table", icon: Table },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "list", label: "List", icon: List },
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "map", label: "Map", icon: Map },
    { id: "feed", label: "Feed", icon: Rss },
] as const

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            {VIEWS.map((view) => (
                <Button
                    key={view.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewChange(view.id as ViewType)}
                    className={cn(
                        "h-7 px-2 text-xs gap-2 hover:bg-zinc-800 hover:text-zinc-200 transition-all",
                        currentView === view.id && "bg-zinc-800 text-[#ccff00] font-medium shadow-sm"
                    )}
                >
                    <view.icon size={14} />
                    {view.label}
                </Button>
            ))}
        </div>
    )
}
