"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar" // Assuming we have this
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReportGeneratorModalProps {
    workspaceId: string
    userId: string
    trigger?: React.ReactNode
}

export function ReportGeneratorModal({ workspaceId, userId, trigger }: ReportGeneratorModalProps) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [projects, setProjects] = useState<any[]>([])

    // Form State
    const [selectedProject, setSelectedProject] = useState<string>("")
    const [dateRange, setDateRange] = useState<"7days" | "30days" | "month">("30days")

    useEffect(() => {
        if (open && workspaceId) {
            fetchProjects()
        }
    }, [open, workspaceId])

    const fetchProjects = async () => {
        const { data } = await supabase
            .from("projects")
            .select("id, name, client:clients(name)")
            .eq("workspace_id", workspaceId)
            .eq("status", "ACTIVE")
            .order("updated_at", { ascending: false })

        if (data) setProjects(data)
    }

    const handleGenerate = async () => {
        if (!selectedProject) return

        setIsLoading(true)
        try {
            // 1. Fetch Project Data
            const project = projects.find(p => p.id === selectedProject)

            // 2. Create Report Record
            const { data: report, error } = await supabase
                .from("reports")
                .insert({
                    workspace_id: workspaceId,
                    created_by: userId,
                    title: `Flash Report: ${project.name}`,
                    status: 'DRAFT',
                    project_id: selectedProject, // Assuming we added this column or store in config
                    period_start: subDays(new Date(), dateRange === '7days' ? 7 : 30).toISOString(),
                    period_end: new Date().toISOString()
                } as any)
                .select()
                .single()

            if (error) throw error

            toast.success("Report Generated!", { description: "Redirecting to editor..." })
            window.location.href = `/reports/${report.id}`

        } catch (error: any) {
            console.error(error)
            toast.error("Failed to generate report")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2 bg-[var(--brand)] text-black hover:bg-[var(--brand)]/90">
                        <Sparkles size={16} />
                        Generate from Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-[var(--brand)]" />
                        Generate Flash Report
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Select Project</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} <span className="text-zinc-500 text-xs ml-2">({p.client?.name})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Time Period</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { id: '7days', label: 'Last 7 Days' },
                                { id: '30days', label: 'Last 30 Days' },
                                { id: 'month', label: 'This Month' }
                            ] as const).map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => setDateRange(opt.id)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-center text-sm cursor-pointer transition-all",
                                        dateRange === opt.id
                                            ? "bg-[var(--brand)] border-[var(--brand)] text-black font-bold"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                    )}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={!selectedProject || isLoading}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Magic...
                        </>
                    ) : (
                        "Create Report"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
