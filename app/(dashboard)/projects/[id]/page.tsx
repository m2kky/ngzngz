"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { KanbanBoard } from "@/components/content/kanban-board"
import { TaskTable } from "@/components/content/task-table"
import { TaskModal } from "@/components/content/task-modal"
import { ProjectChat } from "@/components/projects/project-chat"
import { CalendarView } from "@/components/content/calendar-view"
import { InviteModal } from "@/components/invites/invite-modal"
import { ViewSelector, UserView } from "@/components/content/view-selector"
import { Plus, Calendar, Clock, MoreHorizontal, ArrowUpRight, TrendingUp, CheckCircle2, MessageSquare, Briefcase, DollarSign, Wallet, Users, Zap, LayoutGrid, Table as TableIcon, ArrowRight, Eye, Target, Palette } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
    clients?: { name: string; logo_url: string | null } | null
}
type Task = Database["public"]["Tables"]["tasks"]["Row"]

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewType, setViewType] = useState<"KANBAN" | "TABLE">("KANBAN")

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isNewTask, setIsNewTask] = useState(false)

    // Quick Task State
    const [quickTaskTitle, setQuickTaskTitle] = useState("")
    const [isCreatingQuickTask, setIsCreatingQuickTask] = useState(false)

    useEffect(() => {
        if (currentWorkspace && projectId) {
            fetchProjectData()
        }
    }, [currentWorkspace, projectId])

    async function fetchProjectData() {
        try {
            setIsLoading(true)

            // 1. Fetch Project Details
            const { data: projectData, error: projectError } = await supabase
                .from("projects")
                .select("*, clients(name, logo_url)")
                .eq("id", projectId)
                .single()

            if (projectError) throw projectError
            setProject(projectData)

            // 2. Fetch Project Tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from("tasks")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false })

            if (tasksError) throw tasksError
            setTasks(tasksData || [])

        } catch (error) {
            console.error("Error loading project:", error)
            toast.error("Failed to load project details")
        } finally {
            setIsLoading(false)
        }
    }

    // Task Logic (similar to ContentStudio)
    const handleNewTask = () => {
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

        try {
            if (isNewTask) {
                const { data, error } = await supabase
                    .from("tasks")
                    .insert([{ ...taskData, workspace_id: currentWorkspace.id, project_id: projectId } as any])
                    .select()
                    .single()
                if (error) throw error
                setTasks([data, ...tasks])
                toast.success("Task created in project")
            } else if (selectedTask) {
                const { data, error } = await supabase
                    .from("tasks")
                    .update(taskData as any)
                    .eq("id", selectedTask.id)
                    .select()
                    .single()
                if (error) throw error
                setTasks(tasks.map(t => t.id === data.id ? data : t))
                toast.success("Task updated")
            }
            setIsTaskModalOpen(false)
        } catch (error) {
            toast.error("Failed to save task")
        }
    }

    const handleQuickAddTask = async () => {
        if (!quickTaskTitle.trim() || !currentWorkspace) return

        setIsCreatingQuickTask(true)
        try {
            const { data, error } = await supabase
                .from("tasks")
                .insert([{
                    title: quickTaskTitle,
                    status: "DRAFTING",
                    workspace_id: currentWorkspace.id,
                    project_id: projectId
                } as any])
                .select()
                .single()

            if (error) throw error
            setTasks([data, ...tasks])
            setQuickTaskTitle("")
            toast.success("Task added to project")
        } catch (error) {
            console.error("Error quick adding task:", error)
            toast.error("Failed to add task")
        } finally {
            setIsCreatingQuickTask(false)
        }
    }

    // Date Update Logic from Calendar
    const handleTaskDateChange = async (taskId: string, newDate: Date) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ due_date: newDate.toISOString() } as any)
                .eq("id", taskId)

            if (error) throw error

            // Optimistic update
            setTasks(tasks.map(t => t.id === taskId ? { ...t, due_date: newDate.toISOString() } : t))
            toast.success("Task rescheduled")
        } catch (error) {
            toast.error("Failed to reschedule task")
        }
    }


    // Stats Calculation
    const totalTasks = tasks.length
    const doneTasks = tasks.filter(t => ["APPROVED", "PUBLISHED"].includes(t.status)).length
    const reviewTasks = tasks.filter(t => ["INTERNAL_REVIEW", "CLIENT_REVIEW", "AI_CHECK"].includes(t.status)).length
    const pendingTasks = totalTasks - doneTasks - reviewTasks
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const deadlineDays = project?.end_date ? differenceInDays(new Date(project.end_date), new Date()) : null

    // Mock Team (extract from tasks)
    const team = Array.from(new Set(tasks.map(t => t.assignee_id).filter(Boolean))) // Would need avatar URLs here, but using IDs for now or simple placeholders

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--brand)]" /></div>
    }

    if (!project) return <div>Project not found</div>

    return (
        <div className="h-full flex flex-col bg-black/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    {/* Background Gloss */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--brand)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {project.clients && (
                                    <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800 flex gap-1 px-3 py-1">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {project.clients.name}
                                    </Badge>
                                )}
                                {project.status && (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{project.status}</Badge>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">{project.name}</h1>
                                <p className="text-zinc-400 max-w-2xl text-sm">{project.description}</p>
                            </div>

                            <div className="flex items-center gap-6 mt-2">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Calendar className="w-4 h-4 text-zinc-500" />
                                    <span>
                                        {project.start_date ? format(new Date(project.start_date), "MMM d") : "TBD"}
                                        {" - "}
                                        {project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : "TBD"}
                                    </span>
                                </div>
                                {deadlineDays !== null && (
                                    <div className={`text-sm font-medium ${deadlineDays <= 3 ? "text-amber-500" : "text-emerald-500"}`}>
                                        {deadlineDays} days remaining
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side Stats */}
                        <div className="flex flex-col items-end gap-6 min-w-[300px]">
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>

                                <InviteModal>
                                    <Button variant="outline" className="text-zinc-400 hover:text-white border-zinc-800 rounded-full h-9 bg-black/40">
                                        <Users className="w-4 h-4 mr-2" />
                                        Invite Member
                                    </Button>
                                </InviteModal>

                                <Button onClick={() => router.push(`/automation/new?projectId=${projectId}`)} variant="outline" className="text-zinc-400 hover:text-white border-zinc-800 rounded-full h-9 bg-black/40">
                                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                                    Automate
                                </Button>
                                <Button onClick={handleNewTask} className="bg-[var(--brand)] text-black hover:bg-[#b3ff00] font-bold rounded-full px-4 h-9">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Task
                                </Button>
                            </div>

                            <div className="w-full space-y-2 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                    <span>Campaign Progress</span>
                                    <span className="text-white font-bold">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-[var(--brand)] to-emerald-400" />

                                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-white leading-none">{pendingTasks}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase mt-1">Pending</div>
                                    </div>
                                    <div className="text-center border-l border-white/5">
                                        <div className="text-lg font-bold text-blue-400 leading-none">{reviewTasks}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase mt-1">Review</div>
                                    </div>
                                    <div className="text-center border-l border-white/5">
                                        <div className="text-lg font-bold text-emerald-400 leading-none">{doneTasks}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase mt-1">Done</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 px-6 pb-2 min-h-0 overflow-hidden">
                <Tabs defaultValue="overview" className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-zinc-900/50 border border-white/5">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black">Overview</TabsTrigger>
                            <TabsTrigger value="tasks" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black">Tasks</TabsTrigger>
                            <TabsTrigger value="calendar" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black">Calendar</TabsTrigger>
                            <TabsTrigger value="assets" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black">Assets</TabsTrigger>
                            <TabsTrigger value="chat" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                War Room
                            </TabsTrigger>
                        </TabsList>

                        {/* View Switcher for Tasks (Only visible on Tasks tab technically, but kept here for layout simplicitly or can conditional render) */}
                        <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-2 ${viewType === 'KANBAN' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                onClick={() => setViewType('KANBAN')}
                            >
                                <LayoutGrid className="w-4 h-4 mr-1" />
                                Board
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-2 ${viewType === 'TABLE' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                onClick={() => setViewType('TABLE')}
                            >
                                <TableIcon className="w-4 h-4 mr-1" />
                                Table
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="overview" className="flex-1 overflow-y-auto mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Brief & Strategy */}
                            <div className="space-y-6">
                                <div className="glass-card p-6 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-[var(--brand)]" />
                                            Project Brief
                                        </h3>
                                    </div>
                                    <div className="text-zinc-400 space-y-4 text-sm leading-relaxed">
                                        <p>{project.description || "No description provided."}</p>
                                    </div>
                                </div>

                                {/* Quick Add Task */}
                                <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-lg font-bold text-white mb-4 relative z-10">Quick Actions</h3>
                                    <div className="flex gap-2 relative z-10">
                                        <Input
                                            placeholder="What needs to be done? e.g. 'Draft Instagram Caption'"
                                            className="bg-zinc-950/50 border-white/10 focus-visible:ring-[var(--brand)]"
                                            value={quickTaskTitle}
                                            onChange={(e) => setQuickTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleQuickAddTask()
                                            }}
                                        />
                                        <Button
                                            onClick={handleQuickAddTask}
                                            disabled={isCreatingQuickTask}
                                            className="bg-white text-black hover:bg-zinc-200"
                                        >
                                            {isCreatingQuickTask ? <Clock className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Budget & Client */}
                            <div className="space-y-6">
                                <div className="glass-card p-6 rounded-xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                        Budget & Resources
                                    </h3>
                                    {project.total_budget ? (
                                        <div className="space-y-6">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="text-sm text-zinc-500 mb-1">Total Budget</div>
                                                    <div className="text-2xl font-mono text-white font-bold">${project.total_budget.toLocaleString()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-zinc-500 mb-1">Remaining</div>
                                                    <div className="text-xl font-mono text-emerald-400 font-bold">
                                                        ${(project.total_budget - (project.spent_budget || 0)).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative pt-2">
                                                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                                                    <span>${(project.spent_budget || 0).toLocaleString()} Spent</span>
                                                    <span>{Math.min(((project.spent_budget || 0) / project.total_budget) * 100, 100).toFixed(0)}% Used</span>
                                                </div>
                                                <Progress value={Math.min(((project.spent_budget || 0) / project.total_budget) * 100, 100)} className="h-3 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-lg">
                                            <p className="text-zinc-500 italic">No budget set for this project.</p>
                                            <Button variant="link" className="text-[var(--brand)] mt-2">Set Budget</Button>
                                        </div>
                                    )}
                                </div>

                                {project.clients && (
                                    <div className="glass-card p-6 rounded-xl border border-white/10 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            {project.clients.logo_url ? (
                                                <img src={project.clients.logo_url} alt={project.clients.name} className="w-10 h-10 object-contain" />
                                            ) : (
                                                <Briefcase className="w-8 h-8 text-zinc-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Client</div>
                                            <div className="text-xl font-bold text-white">{project.clients.name}</div>
                                            <div className="text-sm text-zinc-400 mt-1">Marketing Partnership</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 rounded-xl border border-white/5 bg-zinc-900/20 relative h-full overflow-hidden">
                            {tasks.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No tasks in this project yet.</p>
                                    <Button variant="link" onClick={handleNewTask} className="text-[var(--brand)]">Create one</Button>
                                </div>
                            ) : viewType === "KANBAN" ? (
                                <KanbanBoard
                                    tasks={tasks}
                                    onTaskClick={handleTaskClick}
                                    onStatusChange={() => { }} // Could implement status change update
                                />
                            ) : (
                                <TaskTable
                                    tasks={tasks}
                                    propertyDefinitions={[]}
                                    onTaskClick={handleTaskClick}
                                    onAddProperty={() => { }}
                                    onUpdateProperty={() => { }}
                                    onDeleteProperty={() => { }}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="flex-1 overflow-hidden mt-0">
                        <CalendarView
                            tasks={tasks}
                            onTaskClick={handleTaskClick}
                            onTaskDateChange={handleTaskDateChange}
                        />
                    </TabsContent>

                    <TabsContent value="assets" className="flex-1 overflow-y-auto mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Placeholder for Assets Link */}
                            <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-[var(--brand)]/50 transition-colors cursor-pointer group" onClick={() => router.push('/brand')}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300">
                                        <Palette className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Brand Kit</h3>
                                        <p className="text-sm text-zinc-400">Logos, Colors, and Typography</p>
                                    </div>
                                </div>
                                <div className="text-zinc-500 text-sm">
                                    Access the official brand assets for {project.clients?.name || "this client"}.
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-[var(--brand)]/50 transition-colors cursor-pointer group" onClick={() => router.push('/strategy')}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Strategy Hub</h3>
                                        <p className="text-sm text-zinc-400">Personas, Goals, and KPIs</p>
                                    </div>
                                </div>
                                <div className="text-zinc-500 text-sm">
                                    Review the marketing strategy and personas for {project.clients?.name || "this client"}.
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
                        <ProjectChat project={project} />
                    </TabsContent>
                </Tabs>
            </div>

            {isTaskModalOpen && (
                <TaskModal
                    task={selectedTask}
                    isNew={isNewTask}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    defaultProjectId={projectId}
                />
            )}
        </div>
    )
}
