"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

export default function CalendarPage() {
    const { currentWorkspace } = useWorkspace()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline")
    const supabase = createClient() as any

    useEffect(() => {
        if (currentWorkspace) {
            fetchTasks()
        }
    }, [currentWorkspace])

    async function fetchTasks() {
        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("workspace_id", currentWorkspace!.id)
                .not("publish_date", "is", null)
                .order("publish_date", { ascending: true })

            if (error) throw error
            setTasks(data || [])
        } catch (error) {
            console.error("Error fetching tasks:", error)
            toast.error("Failed to load calendar")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Publishing Calendar</h1>
                    <p className="text-zinc-400 mt-2">
                        Visualize and manage your content publishing schedule.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                    <Button
                        variant={viewMode === "timeline" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("timeline")}
                        className={viewMode === "timeline" ? "bg-zinc-800" : ""}
                    >
                        <List size={16} className="mr-2" />
                        Timeline
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-zinc-800" : ""}
                    >
                        <LayoutGrid size={16} className="mr-2" />
                        Social Grid
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ccff00]" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-xl">
                    <h3 className="text-lg font-medium text-white">No scheduled content</h3>
                    <p className="text-zinc-400 mt-2">
                        Add publish dates to your tasks to see them here.
                    </p>
                </div>
            ) : viewMode === "timeline" ? (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="glass-card p-4 rounded-xl flex items-center gap-4 hover:border-white/20 transition-colors cursor-pointer"
                        >
                            <div className="flex-shrink-0 w-24 text-center">
                                <div className="text-sm text-zinc-400">
                                    {task.publish_date ? new Date(task.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {task.publish_date ? new Date(task.publish_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">{task.title}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-1">{task.description}</p>
                            </div>
                            {task.platform && (
                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                                    {task.platform}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="aspect-square bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-white/20 transition-colors cursor-pointer overflow-hidden group relative"
                        >
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                                <LayoutGrid size={48} />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white font-medium line-clamp-2">{task.title}</p>
                                {task.platform && (
                                    <span className="text-xs text-zinc-400">{task.platform}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
