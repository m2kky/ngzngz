"use client"

import { useState, useEffect, useRef } from "react"
import { X, Sparkles, Zap, Loader2, LayoutTemplate, Copy, Briefcase } from "lucide-react"
import { Button } from "@/../components/ui/button"
import { Input } from "@/../components/ui/input"
import { StatusBadge } from "@/../components/shared/status-badge"
import { BlockEditor } from "@/../components/content/block-editor"
import type { Database } from "@/types/database.types"
import { toast } from "sonner"
import { useWorkspace } from "@/hooks/useWorkspace"
import { createClient } from "@/../lib/supabase/client"
import { PropertyField, PropertyDefinition, PROPERTY_ICONS } from "@/../components/content/property-field"
import { PropertyManager } from "@/../components/content/property-manager"
import { TASK_TEMPLATES } from "@/../config/templates"
import { usePresence } from "@/../hooks/use-presence"
import { useRealtimeTask } from "@/../hooks/use-realtime-task"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/../components/ui/select"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface TaskModalProps {
    task: Task | null
    isNew: boolean
    onClose: () => void
    onSave: (task: Partial<Task>) => void
    defaultProjectId?: string // Added prop for context-aware creation
    defaultClientId?: string // Added prop for context-aware creation
}

export function TaskModal({ task, isNew, onClose, onSave, defaultProjectId, defaultClientId }: TaskModalProps) {
    const [title, setTitle] = useState(task?.title || "")
    const [status, setStatus] = useState(task?.status || "DRAFTING")
    const [priority, setPriority] = useState(task?.priority || "MEDIUM")
    const [projectId, setProjectId] = useState<string | null>(task?.project_id || defaultProjectId || null)
    const [clientId, setClientId] = useState<string | null>(task?.client_id || defaultClientId || null)

    const [content, setContent] = useState<any>(task?.content_blocks || [])
    const [properties, setProperties] = useState<Record<string, any>>((task as any)?.properties || {})
    const [aiScore, setAiScore] = useState<number | null>(task?.ai_score || null)
    const [aiFeedback, setAiFeedback] = useState(task?.ai_feedback || "Click 'Check Vibe' to analyze.")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const prevTaskIdRef = useRef<string | null>(null)

    const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
    const supabase = createClient()
    const presence = usePresence()

    const [personas, setPersonas] = useState<any[]>([])
    const [selectedPersona, setSelectedPersona] = useState<string>("")
    const [statusOptions, setStatusOptions] = useState<any[]>([])
    const [projectOptions, setProjectOptions] = useState<any[]>([])

    // Fetch dynamic statuses & projects
    useEffect(() => {
        const fetchData = async () => {
            if (!currentWorkspace?.id) return

            // Statuses
            const { data: statuses } = await supabase
                .from("task_statuses")
                .select("*")
                .eq("workspace_id", currentWorkspace.id)
                .order("position", { ascending: true })

            if (statuses && statuses.length > 0) {
                setStatusOptions(statuses)
            } else {
                setStatusOptions([
                    { name: 'Drafting', slug: 'DRAFTING', color: '#71717a' },
                    { name: 'In Progress', slug: 'IN_PROGRESS', color: '#3b82f6' },
                    { name: 'AI Check', slug: 'AI_CHECK', color: '#a855f7' },
                    { name: 'Internal Review', slug: 'INTERNAL_REVIEW', color: '#f59e0b' },
                    { name: 'Client Review', slug: 'CLIENT_REVIEW', color: '#f97316' },
                    { name: 'Approved', slug: 'APPROVED', color: '#22c55e' },
                    { name: 'Published', slug: 'PUBLISHED', color: '#ec4899' },
                    { name: 'Ads Handoff', slug: 'ADS_HANDOFF', color: '#14b8a6' }
                ])
            }

            // Projects
            const { data: projects } = await supabase
                .from("projects")
                .select("id, name")
                .eq("workspace_id", currentWorkspace.id)
                .order("created_at", { ascending: false })

            if (projects) setProjectOptions(projects)
        }
        fetchData()
    }, [currentWorkspace?.id])

    useEffect(() => {
        const fetchPersonas = async () => {
            const { data } = await supabase.from("personas").select("*")
            if (data) setPersonas(data)
        }
        fetchPersonas()
    }, [])

    const handleGenerate = async () => {
        if (!selectedPersona) return
        setIsGenerating(true)
        try {
            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    context: JSON.stringify(content),
                    personaId: selectedPersona
                }),
            })
            const data = await response.json()
            if (data.content) {
                const newBlock = {
                    id: crypto.randomUUID(),
                    type: "paragraph",
                    content: data.content
                }
                setContent([...content, newBlock])
                toast.success("Sensei generated content! 🥋")
            }
        } catch (error) {
            toast.error("Failed to generate content")
        }
        setIsGenerating(false)
    }

    // Sync state with props when task changes (only if ID changes)
    useEffect(() => {
        const currentTaskId = task?.id || "new"

        // Only update if we switched to a different task
        if (currentTaskId !== prevTaskIdRef.current) {
            prevTaskIdRef.current = currentTaskId

            if (task) {
                setTitle(task.title)
                setStatus(task.status || "DRAFTING")
                setPriority(task.priority || "MEDIUM")
                setProjectId(task.project_id || null)
                setClientId(task.client_id || null)
                setContent(task.content_blocks || [])
                setProperties((task as any).properties || {})
                setAiScore(task.ai_score || null)
                setAiFeedback(task.ai_feedback || "Click 'Check Vibe' to analyze.")
            } else {
                setTitle("") // Start with empty title for new tasks
                setStatus("DRAFTING")
                setPriority("MEDIUM")
                setProjectId(defaultProjectId || null)
                setClientId(defaultClientId || null)
                setContent([])
                setProperties({})
                setAiScore(null)
                setAiFeedback("Click 'Check Vibe' to analyze.")
            }
        }
    }, [task, defaultProjectId])

    const handleAddProperty = async (definition: PropertyDefinition) => {
        if (!currentWorkspace) return
        const currentDefinitions = (currentWorkspace as any).task_property_definitions || []
        const newDefinitions = [...currentDefinitions, definition]
        const { error } = await supabase
            .from("workspaces")
            .update({ task_property_definitions: newDefinitions } as any)
            .eq("id", currentWorkspace.id)
        if (error) { toast.error("Failed to add property"); return }
        setCurrentWorkspace({ ...currentWorkspace, task_property_definitions: newDefinitions } as any)
        toast.success("Property added!")
    }

    const handleUpdateDefinition = async (updatedDefinition: PropertyDefinition) => {
        if (!currentWorkspace) return
        const currentDefinitions = (currentWorkspace as any).task_property_definitions || []
        const newDefinitions = currentDefinitions.map((def: PropertyDefinition) =>
            def.id === updatedDefinition.id ? updatedDefinition : def
        )
        const { error } = await supabase
            .from("workspaces")
            .update({ task_property_definitions: newDefinitions } as any)
            .eq("id", currentWorkspace.id)
        if (error) { toast.error("Failed to update property options"); return }
        setCurrentWorkspace({ ...currentWorkspace, task_property_definitions: newDefinitions } as any)
    }

    const handleVibeCheck = async () => {
        setIsAnalyzing(true)
        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content: JSON.stringify(content),
                }),
            })
            const data = await response.json()
            setAiScore(data.score)
            setAiFeedback(data.feedback)
            toast.success(`Vibe Check: ${data.score}/100 🎯`)
        } catch (error) {
            toast.error("AI vibe check failed")
        }
        setIsGenerating(false)
    }

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Please enter a task title")
            return
        }

        const taskData: Partial<Task> = {
            title,
            status: status as any,
            content_blocks: content,
            properties: properties as any,
            ai_score: aiScore,
            ai_feedback: aiFeedback,
            priority: priority as any,
            workspace_id: task?.workspace_id || currentWorkspace?.id || "",
            project_id: projectId,
            client_id: clientId
        }

        onSave(taskData)
        toast.success(isNew ? "Task Created! 🚀" : "Changes Saved! 💾")
    }

    const handleTemplateSelect = (templateId: string) => {
        const template = TASK_TEMPLATES.find((t) => t.id === templateId)
        if (template) {
            setTitle(template.title)
            setContent(template.content)
            toast.success(`Applied template: ${template.name}`)
        }
    }

    const propertyDefinitions: PropertyDefinition[] = (currentWorkspace as any)?.task_property_definitions || []
    const activeUsers = Object.values(presence).flat().map((p: any) => p.email)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass">
                    <div className="flex items-center gap-4 flex-1">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="bg-transparent text-white font-bold text-lg border-none focus-visible:ring-0 w-full max-w-md placeholder:text-zinc-500"
                        />

                        <Select value={projectId || "unassigned"} onValueChange={(val) => setProjectId(val === "unassigned" ? null : val)}>
                            <SelectTrigger className="w-[160px] h-8 border-white/10 bg-white/5 text-xs font-medium text-zinc-300">
                                <Briefcase className="w-3 h-3 mr-2" />
                                <SelectValue placeholder="No Project" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                <SelectItem value="unassigned">No Project</SelectItem>
                                {projectOptions.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as any)}
                        >
                            <SelectTrigger className="w-[140px] h-8 border-white/10 bg-white/5 text-xs font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.slug} value={opt.slug}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: opt.color || '#71717a' }}
                                            />
                                            {opt.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                            <SelectTrigger className="w-[100px] h-8 bg-white/5 border-white/10 text-xs text-zinc-300">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10">
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>

                        {isNew && (
                            <Select onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="w-[140px] h-8 border-white/10 bg-white/5 text-xs font-medium text-zinc-400">
                                    <span className="flex items-center gap-2">
                                        <LayoutTemplate size={14} />
                                        <span>Templates</span>
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    {TASK_TEMPLATES.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            <span className="flex items-center gap-2">
                                                <span>{template.icon}</span>
                                                <span>{template.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Presence Indicators */}
                        <div className="flex items-center -space-x-2 ml-4">
                            {activeUsers.map((email: any, idx: number) => (
                                <div key={idx} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-400" title={email}>
                                    {email?.[0]?.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={24} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 overflow-y-auto p-12 bg-transparent">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Untitled Task"
                                className="text-4xl font-black text-white bg-transparent border-none focus-visible:ring-0 px-0 placeholder:text-zinc-700 h-auto"
                            />

                            <BlockEditor content={content} onChange={setContent} />

                            <div className="flex items-center gap-4 mt-4">
                                <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white/5 border-white/10 text-xs">
                                        <SelectValue placeholder="Select Persona" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        {personas.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !selectedPersona}
                                    variant="outline"
                                    className="gap-2 bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20"
                                >
                                    {isGenerating ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {isGenerating ? "Sensei is writing..." : "Auto-Generate"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 glass border-l border-white/10 flex flex-col p-4 overflow-y-auto">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[#a855f7] font-bold text-sm flex gap-2">
                                    <Zap size={16} />
                                    AI Score
                                </span>
                                <Button
                                    onClick={handleVibeCheck}
                                    disabled={isAnalyzing}
                                    size="sm"
                                    className="h-6 text-xs bg-[#a855f7] hover:bg-[#9333ea]"
                                >
                                    {isAnalyzing ? "..." : "Check"}
                                </Button>
                            </div>
                            {aiScore !== null && (
                                <div className="text-2xl font-bold text-[#a855f7] mb-2">{aiScore}/100</div>
                            )}
                            <div className="text-zinc-300 text-xs italic">"{aiFeedback}"</div>
                        </div>

                        {/* Properties Section */}
                        <div className="space-y-4 mb-6">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Properties</h3>

                            <div className="space-y-3">
                                {propertyDefinitions.map((def: PropertyDefinition) => (
                                    <div key={def.id} className="space-y-1">
                                        <label className="text-xs text-zinc-400 flex items-center gap-2">
                                            {PROPERTY_ICONS[def.type] && (() => {
                                                const Icon = PROPERTY_ICONS[def.type]
                                                return <Icon size={12} />
                                            })()}
                                            {def.name}
                                        </label>
                                        <PropertyField
                                            definition={def}
                                            value={properties[def.id]}
                                            onChange={(val) => setProperties({ ...properties, [def.id]: val })}
                                            onDefinitionUpdate={handleUpdateDefinition}
                                        />
                                    </div>
                                ))}
                            </div>

                            <PropertyManager onAddProperty={handleAddProperty} />
                        </div>

                        <div className="mt-auto flex gap-2">
                            <Button variant="outline" onClick={onClose} className="flex-1">
                                Close
                            </Button>
                            {!isNew && (
                                <Button
                                    onClick={async () => {
                                        if (!task?.id) return
                                        try {
                                            const res = await fetch(`/api/tasks/${task.id}/clone`, {
                                                method: "POST",
                                            })
                                            if (res.ok) {
                                                toast.success("Shadow Clone Jutsu Complete! 🥷")
                                                onClose()
                                            } else {
                                                toast.error("Clone failed")
                                            }
                                        } catch (e) {
                                            toast.error("Clone failed")
                                        }
                                    }}
                                    className="flex-1 bg-zinc-800 text-[#ccff00] border border-[#ccff00]/20 hover:bg-[#ccff00]/10 hover:border-[#ccff00]/50"
                                >
                                    <Copy size={16} className="mr-2" />
                                    Clone
                                </Button>
                            )}
                            <Button onClick={handleSave} className="flex-1 bg-[#ccff00] text-black hover:bg-[#b3ff00]">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
