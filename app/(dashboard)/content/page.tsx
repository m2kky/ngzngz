"use client"

import { useState, useEffect } from "react"
import { Plus, LayoutGrid } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/content/kanban-board"
import { TaskModal } from "@/components/content/task-modal"
import { ViewSelector, UserView } from "@/components/content/view-selector"
import { TaskTable } from "@/components/content/task-table"
import { CalendarView } from "@/components/content/calendar-view"
import { ListView } from "@/components/content/list-view"
import { TimelineView } from "@/components/content/timeline-view"
import { FeedView } from "@/components/content/feed-view"
import { GalleryView } from "@/components/content/gallery-view"
import { ChartView } from "@/components/content/chart-view"
import { PropertyDefinition } from "@/components/content/property-field"
import type { Database } from "@/types/database"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"
import { SortControl, SortConfig } from "@/components/content/sort-control"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

export default function ContentStudioPage() {
    const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
    const [tasks, setTasks] = useState<Task[]>([])
    const [currentView, setCurrentView] = useState<UserView | null>(null)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created_at", direction: "desc" })

    // Fallback to "board" if no view selected
    const activeViewType = currentView?.view_type || "KANBAN"

    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isNewTask, setIsNewTask] = useState(false)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient() as any

    useEffect(() => {
        if (currentWorkspace) {
            fetchTasks()
        }
    }, [currentWorkspace])

    async function fetchTasks() {
        if (!currentWorkspace) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from("tasks")
            .select("*, projects(name, id)")
            .eq("workspace_id", currentWorkspace.id)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch tasks.")
            console.error("Error fetching tasks:", error)
        } else if (data) {
            setTasks(data)
        }
        setIsLoading(false)
    }

    // Subscribe to Realtime Changes
    useEffect(() => {
        if (!currentWorkspace) return

        const channel = supabase
            .channel('realtime-tasks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `workspace_id=eq.${currentWorkspace.id}`
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setTasks((prev) => [payload.new as Task, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks((prev) => prev.map((task) => (task.id === payload.new.id ? (payload.new as Task) : task)))
                    } else if (payload.eventType === 'DELETE') {
                        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentWorkspace?.id])

    const handleViewChange = (view: UserView | null) => {
        setCurrentView(view)
    }

    const handleNewTask = () => {
        if (!currentWorkspace) {
            toast.error("Please select a workspace first")
            return
        }
        setIsNewTask(true)
        setSelectedTask(null)
        setIsTaskModalOpen(true)
    }

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
        setIsNewTask(false)
        setIsTaskModalOpen(true)
    }

    const handleSaveTask = async (taskData: Partial<Task>) => {
        if (!currentWorkspace) return

        if (isNewTask) {
            const { data, error } = await supabase
                .from("tasks")
                .insert([{ ...taskData, workspace_id: currentWorkspace.id } as any])
                .select()
                .single()

            if (error) {
                toast.error("Failed to create task.")
                console.error("Error creating task:", error)
            } else if (data) {
                setTasks([data, ...tasks])
                toast.success("Task created successfully!")
            }
        } else if (selectedTask) {
            const { data, error } = await supabase
                .from("tasks")
                .update(taskData as any)
                .eq("id", selectedTask.id)
                .select()
                .single()

            if (error) {
                toast.error("Failed to update task.")
                console.error("Error updating task:", error)
            } else if (data) {
                setTasks(tasks.map((t) => (t.id === data.id ? data : t)))
                toast.success("Task updated successfully!")
            }
        }

        setSelectedTask(null)
        setIsNewTask(false)
        setIsTaskModalOpen(false)
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        const { data, error } = await supabase
            .from("tasks")
            .update({ status: newStatus as any })
            .eq("id", taskId)
            .select()
            .single()

        if (error) {
            toast.error("Failed to update task status.")
            console.error("Error updating task status:", error)
        } else if (data) {
            setTasks(tasks.map((t) => (t.id === data.id ? data : t)))
            toast.success("Task status updated!")
        }
    }

    const handleTaskDateChange = async (taskId: string, newDate: Date) => {
        const { data, error } = await supabase
            .from("tasks")
            .update({ due_date: newDate.toISOString() } as any)
            .eq("id", taskId)
            .select()
            .single()

        if (error) {
            toast.error("Failed to update task date.")
            console.error("Error updating task date:", error)
        } else if (data) {
            setTasks(tasks.map((t) => (t.id === data.id ? data : t)))
            toast.success("Task rescheduled!")
        }
    }

    const propertyDefinitions = (currentWorkspace as any)?.task_property_definitions || []

    const handleAddProperty = async (definition: Omit<PropertyDefinition, "id">) => {
        if (!currentWorkspace) return

        const newDef = { ...definition, id: crypto.randomUUID() }
        const newDefs = [...propertyDefinitions, newDef]

        const { error } = await supabase
            .from("workspaces")
            .update({ task_property_definitions: newDefs } as any)
            .eq("id", currentWorkspace.id)

        if (error) {
            toast.error("Failed to add property")
        } else {
            setCurrentWorkspace({ ...currentWorkspace, task_property_definitions: newDefs } as any)
            toast.success("Property added")
        }
    }

    const handleUpdateProperty = async (id: string, updates: Partial<PropertyDefinition>) => {
        if (!currentWorkspace) return

        const newDefs = propertyDefinitions.map((def: PropertyDefinition) =>
            def.id === id ? { ...def, ...updates } : def
        )

        const { error } = await supabase
            .from("workspaces")
            .update({ task_property_definitions: newDefs } as any)
            .eq("id", currentWorkspace.id)

        if (error) {
            toast.error("Failed to update property")
        } else {
            setCurrentWorkspace({ ...currentWorkspace, task_property_definitions: newDefs } as any)
            toast.success("Property updated")
        }
    }

    const handleDeleteProperty = async (id: string) => {
        if (!currentWorkspace) return

        const newDefs = propertyDefinitions.filter((def: PropertyDefinition) => def.id !== id)

        const { error } = await supabase
            .from("workspaces")
            .update({ task_property_definitions: newDefs } as any)
            .eq("id", currentWorkspace.id)

        if (error) {
            toast.error("Failed to delete property")
        } else {
            setCurrentWorkspace({ ...currentWorkspace, task_property_definitions: newDefs } as any)
            toast.success("Property deleted")
        }
    }

    // Sorting Logic
    const sortTasks = (tasksToSort: Task[]) => {
        return [...tasksToSort].sort((a, b) => {
            const field = sortConfig.field
            const direction = sortConfig.direction === "asc" ? 1 : -1

            let valA = a[field as keyof Task]
            let valB = b[field as keyof Task]

            // Handle nulls
            if (valA === null) return 1
            if (valB === null) return -1

            // Handle dates
            if (field === "due_date" || field === "created_at") {
                valA = new Date(valA as string).getTime()
                valB = new Date(valB as string).getTime()
            }

            // Handle priority (Urgent > High > Medium > Low)
            if (field === "priority") {
                const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
                valA = priorityWeight[(valA as string) as keyof typeof priorityWeight] || 0
                valB = priorityWeight[(valB as string) as keyof typeof priorityWeight] || 0
            }

            if (valA === undefined || valB === undefined) return 0
            if (valA < valB) return -1 * direction
            if (valA > valB) return 1 * direction
            return 0
        })
    }

    const sortedTasks = sortTasks(tasks)

    return (
        <div className="h-full flex flex-col text-white font-sans selection:bg-[#ccff00] selection:text-black">
            {/* Floating Content Controls */}
            <header className="mx-6 mt-6 mb-2 rounded-3xl glass-panel liquid-gloss flex items-center justify-between px-6 py-3 sticky top-6 z-40 transition-all shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <span className="text-[#ccff00]">NINJA</span>
                        <span className="text-white">CONTENT</span>
                    </h1>
                    <div className="h-6 w-px bg-white/10" />
                    <ViewSelector
                        currentView={currentView}
                        onViewChange={handleViewChange}
                        defaultViewType="KANBAN"
                    />
                    <SortControl sortConfig={sortConfig} onSortChange={setSortConfig} />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleNewTask}
                        className="bg-[#ccff00] text-black hover:bg-[#b3ff00] font-bold rounded-full px-6 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                    >
                        <Plus size={18} className="mr-2" />
                        NEW DROP
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col p-6 relative">
                {/* Background Grid */}


                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ccff00]" />
                    </div>
                ) : (
                    <>
                        {activeViewType === "KANBAN" && (
                            <KanbanBoard
                                tasks={sortedTasks}
                                onTaskClick={handleTaskClick}
                                onStatusChange={handleStatusChange}
                                config={currentView?.view_config}
                            />
                        )}
                        {activeViewType === "TABLE" && (
                            <div className="flex-1 overflow-auto">
                                <TaskTable
                                    tasks={sortedTasks}
                                    propertyDefinitions={propertyDefinitions}
                                    onTaskClick={handleTaskClick}
                                    onAddProperty={handleAddProperty}
                                    onUpdateProperty={handleUpdateProperty}
                                    onDeleteProperty={handleDeleteProperty}
                                />
                            </div>
                        )}
                        {activeViewType === "CALENDAR" && (
                            <div className="flex-1 overflow-hidden">
                                <CalendarView
                                    tasks={sortedTasks}
                                    onTaskClick={handleTaskClick}
                                    onTaskDateChange={handleTaskDateChange}
                                />
                            </div>
                        )}
                        {activeViewType === "LIST" && (
                            <div className="flex-1 overflow-auto">
                                <ListView tasks={sortedTasks} onTaskClick={handleTaskClick} />
                            </div>
                        )}
                        {activeViewType === "TIMELINE" && (
                            <div className="flex-1 overflow-hidden">
                                <TimelineView tasks={sortedTasks} onTaskClick={handleTaskClick} />
                            </div>
                        )}
                        {activeViewType === "FEED" && (
                            <div className="flex-1 overflow-auto bg-zinc-950">
                                <FeedView tasks={sortedTasks} onTaskClick={handleTaskClick} />
                            </div>
                        )}
                        {activeViewType === "GALLERY" && (
                            <div className="flex-1 overflow-hidden">
                                <GalleryView tasks={sortedTasks} onTaskClick={handleTaskClick} />
                            </div>
                        )}
                        {activeViewType === "CHART" && (
                            <div className="flex-1 overflow-hidden">
                                <ChartView tasks={sortedTasks} />
                            </div>
                        )}
                        {(activeViewType === "MAP" || activeViewType === "ACTIVITY") && (
                            <div className="flex-1 flex items-center justify-center text-zinc-500 flex-col gap-4">
                                <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800">
                                    <LayoutGrid size={32} />
                                </div>
                                <p>This view is coming soon!</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Task Modal */}
            {isTaskModalOpen && (
                <TaskModal
                    task={selectedTask}
                    isNew={isNewTask}
                    onClose={() => {
                        setSelectedTask(null)
                        setIsNewTask(false)
                        setIsTaskModalOpen(false)
                    }}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    )
}
