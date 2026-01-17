"use client"

import { useState, useEffect } from "react"
import {
    Layout,
    List,
    Calendar,
    StretchHorizontal,
    Activity,
    Image as ImageIcon,
    BarChart3,
    Map,
    Plus,
    Check,
    X
} from "lucide-react"
import { Button } from "@/../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/../components/ui/dialog"
import { Input } from "@/../components/ui/input"
import { createClient } from "@/../lib/supabase/client"
import { useWorkspace } from "@/hooks/useWorkspace"
import { toast } from "sonner"
import { cn } from "@/../lib/utils"

export interface ViewConfig {
    groupBy?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    filterBy?: Record<string, any>
    columns?: string[]
}

export interface UserView {
    id: string
    view_name: string
    view_type: "KANBAN" | "TABLE" | "CALENDAR" | "LIST" | "TIMELINE" | "FEED" | "GALLERY" | "CHART" | "MAP" | "ACTIVITY"
    view_config: ViewConfig
}

interface ViewSelectorProps {
    currentView: UserView | null
    onViewChange: (view: UserView | null) => void
    defaultViewType: string
    entityType?: string
}

const VIEW_ICONS: Record<string, any> = {
    KANBAN: Layout,
    TABLE: List,
    CALENDAR: Calendar,
    LIST: List,
    TIMELINE: StretchHorizontal,
    FEED: Activity,
    GALLERY: ImageIcon,
    CHART: BarChart3,
    MAP: Map,
    ACTIVITY: Activity
}

export function ViewSelector({ currentView, onViewChange, defaultViewType, entityType }: ViewSelectorProps) {
    const [views, setViews] = useState<UserView[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedType, setSelectedType] = useState<UserView["view_type"]>("KANBAN")
    const [newViewName, setNewViewName] = useState("")
    const { workspace: currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        async function fetchViews() {
            if (!currentWorkspace) return
            const { data } = await supabase
                .from("saved_views")
                .select("*")
                .eq("workspace_id", currentWorkspace.id)
                .eq("entity_type", entityType || "TASK")
                .order("created_at", { ascending: true })

            if (data) {
                const formattedViews: UserView[] = data.map(v => ({
                    id: v.id,
                    view_name: v.name,
                    view_type: v.type as any,
                    view_config: v.config as any
                }))
                setViews(formattedViews)
            }
        }
        fetchViews()
    }, [currentWorkspace, entityType])

    const handleCreateView = async () => {
        if (!newViewName.trim() || !currentWorkspace) return

        const newView = {
            workspace_id: currentWorkspace.id,
            name: newViewName,
            type: selectedType,
            entity_type: entityType || "TASK",
            config: { groupBy: "status" }, // Default config
        }

        const { data, error } = await supabase
            .from("saved_views")
            .insert(newView as any)
            .select()
            .single()

        if (error) {
            toast.error("Failed to create view")
            return
        }

        const formattedView: UserView = {
            id: data.id,
            view_name: data.name,
            view_type: data.type as any,
            view_config: data.config as any
        }

        setViews([...views, formattedView])
        setNewViewName("")
        setIsCreateOpen(false)
        onViewChange(formattedView)
        toast.success("View created successfully")
    }

    const handleDeleteView = async (viewId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!currentWorkspace) return

        const { error } = await supabase
            .from("saved_views")
            .delete()
            .eq("id", viewId)

        if (error) {
            toast.error("Failed to delete view")
            return
        }

        const newViews = views.filter(v => v.id !== viewId)
        setViews(newViews)

        // If deleted view was active, switch to default or first available
        if (currentView?.id === viewId) {
            onViewChange(newViews[0] || null)
        }
        toast.success("View deleted")
    }

    const handleTypeSelect = (type: UserView["view_type"], label: string) => {
        setSelectedType(type)
        // Auto-name if empty or if it matches another default type name
        const defaultNames = ["Board", "Table", "Gallery", "Calendar", "Timeline", "Chart", "Map"]
        if (!newViewName || defaultNames.includes(newViewName)) {
            setNewViewName(label)
        }
    }

    return (
        <>
            <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                {views.map((view) => {
                    const Icon = VIEW_ICONS[view.view_type] || Layout
                    const isActive = currentView?.id === view.id
                    return (
                        <div
                            key={view.id}
                            onClick={() => onViewChange(view)}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer select-none",
                                isActive
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                            )}
                        >
                            <Icon size={14} />
                            {view.view_name}
                            <div
                                role="button"
                                onClick={(e) => handleDeleteView(view.id, e)}
                                className={cn(
                                    "ml-1 p-0.5 rounded-sm hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100",
                                    isActive && "opacity-100" // Always show on active tab
                                )}
                            >
                                <X size={12} />
                            </div>
                        </div>
                    )
                })}
                <div className="w-px h-4 bg-zinc-800 mx-1" />
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
                >
                    <Plus size={14} />
                </button>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="glass-card sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New View</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">View Name</label>
                            <Input
                                placeholder="e.g., Marketing Tasks"
                                value={newViewName}
                                onChange={(e) => setNewViewName(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">View Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { type: "KANBAN", label: "Board", icon: Layout },
                                    { type: "TABLE", label: "Table", icon: List },
                                    { type: "GALLERY", label: "Gallery", icon: ImageIcon },
                                    { type: "CALENDAR", label: "Calendar", icon: Calendar },
                                    { type: "TIMELINE", label: "Timeline", icon: StretchHorizontal },
                                    { type: "CHART", label: "Chart", icon: BarChart3 },
                                ].map((option) => {
                                    const Icon = option.icon
                                    const isSelected = selectedType === option.type
                                    return (
                                        <button
                                            key={option.type}
                                            onClick={() => handleTypeSelect(option.type as any, option.label)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                                                isSelected
                                                    ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]"
                                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                                            )}
                                        >
                                            <Icon size={24} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateView} className="bg-[#ccff00] text-black hover:bg-[#b3ff00]">Create View</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
