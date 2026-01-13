"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { Database } from "@/types/database"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    project: Project | null
}

export function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
    const { currentWorkspace } = useWorkspace()
    const [isLoading, setIsLoading] = useState(false)
    const [isAiPlanning, setIsAiPlanning] = useState(false)
    const supabase = createClient()

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("Planning")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)

    // New Fields
    const [clientId, setClientId] = useState<string>("")
    const [totalBudget, setTotalBudget] = useState<string>("")
    const [clients, setClients] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        if (isOpen && currentWorkspace) {
            fetchClients()
        }
    }, [isOpen, currentWorkspace])

    useEffect(() => {
        if (project) {
            setName(project.name)
            setDescription(project.description || "")
            setStatus(project.status)
            setStartDate(project.start_date ? new Date(project.start_date) : undefined)
            setEndDate(project.end_date ? new Date(project.end_date) : undefined)
            setClientId(project.client_id || "")
            setTotalBudget(project.total_budget?.toString() || "")
        } else {
            resetForm()
        }
    }, [project, isOpen])

    const fetchClients = async () => {
        if (!currentWorkspace) return
        const { data } = await supabase
            .from("clients")
            .select("id, name")
            .eq("workspace_id", currentWorkspace.id)
            .order("name")

        if (data) setClients(data)
    }

    const resetForm = () => {
        setName("")
        setDescription("")
        setStatus("Planning")
        setStartDate(undefined)
        setEndDate(undefined)
        setClientId("")
        setTotalBudget("")
    }

    const handleSave = async () => {
        if (!name || !currentWorkspace) return

        setIsLoading(true)
        try {
            const projectData = {
                workspace_id: currentWorkspace.id,
                name,
                description,
                status,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
                client_id: clientId || null,
                total_budget: totalBudget ? parseFloat(totalBudget) : null
            }

            if (project) {
                const { error } = await supabase
                    .from("projects")
                    .update(projectData)
                    .eq("id", project.id)
                if (error) throw error
                toast.success("Project updated successfully")
            } else {
                const { error } = await supabase
                    .from("projects")
                    .insert(projectData)
                if (error) throw error
                toast.success("Project created successfully")
            }

            onSave()
        } catch (error) {
            console.error("Error saving project:", error)
            toast.error("Failed to save project")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAiAutoPlan = async () => {
        if (!name || !description) {
            toast.error("Please provide a project name and description first.")
            return
        }

        setIsAiPlanning(true)
        try {
            // 1. Create the project first if it doesn't exist
            let projectId = project?.id

            if (!projectId) {
                const { data, error } = await supabase
                    .from("projects")
                    .insert({
                        workspace_id: currentWorkspace!.id,
                        name,
                        description,
                        status: "Planning",
                        start_date: startDate?.toISOString(),
                        end_date: endDate?.toISOString(),
                        client_id: clientId || null,
                        total_budget: totalBudget ? parseFloat(totalBudget) : null
                    })
                    .select()
                    .single()

                if (error) throw error
                projectId = data.id
                toast.success("Project created. Generating plan...")
            }

            // 2. Call AI API to generate tasks
            const response = await fetch("/api/ai/auto-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    name,
                    description,
                    workspaceId: currentWorkspace!.id,
                }),
            })

            if (!response.ok) throw new Error("Failed to generate plan")

            const result = await response.json()
            toast.success(`Generated ${result.taskCount} tasks for your project! 🚀`)
            onSave() // Close modal and refresh list
        } catch (error) {
            console.error("Error auto-planning:", error)
            toast.error("Failed to generate plan")
        } finally {
            setIsAiPlanning(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200 sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
                    <DialogDescription>
                        Define your campaign or project details.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Summer Viral Campaign"
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-[var(--brand)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Client</Label>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                    {clients.length === 0 && (
                                        <div className="p-2 text-xs text-zinc-500 text-center">No clients found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget">Total Budget</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(e.target.value)}
                                placeholder="e.g., 50000"
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-[var(--brand)]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description & Goals</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the goals, target audience, and key deliverables..."
                            className="bg-zinc-900 border-zinc-800 min-h-[100px] focus-visible:ring-[var(--brand)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    <SelectItem value="Planning">Planning</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Timeline</Label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "MMM d") : <span>Start</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "MMM d") : <span>End</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between items-center sm:justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAiAutoPlan}
                        disabled={isAiPlanning || isLoading}
                        className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                    >
                        {isAiPlanning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Planning...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI Auto-Plan
                            </>
                        )}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[var(--brand)] text-black hover:opacity-90"
                        >
                            {isLoading ? "Saving..." : "Save Project"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
