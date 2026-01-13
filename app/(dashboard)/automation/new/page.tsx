"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Zap, Plus, Trash2, Clock, Mail, Database, UserPlus, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getAvailableVariables } from "@/lib/automation/variable-parser"
import { FilterBuilder, FilterGroup } from "@/components/automation/filter-builder"
import { AssignUserConfig } from "@/components/automation/action-config/assign-user"
import { MentionInput } from "@/components/automation/mention-input"

// Types
type Action = { step: number; type: string; config: any }

const TRIGGER_EVENTS = [
    { id: 'task.created', label: 'Task Created', description: 'Triggered when a new task is added.' },
    { id: 'task.updated', label: 'Task Updated', description: 'Triggered when any property of a task changes.' },
    { id: 'task.status_changed', label: 'Status Changed', description: 'Specially optimized for status moves.' },
    { id: 'task.completed', label: 'Task Completed', description: 'When a task is marked as Done.' },
]

const ACTION_TYPES = [
    { id: 'send_notification', label: 'Send Notification', icon: Mail },
    { id: 'delay', label: 'Wait / Delay', icon: Clock },
    { id: 'update_record', label: 'Update Record', icon: Database },
    { id: 'assign_user', label: 'Assign User', icon: UserPlus },
]

function AutomationContent() {
    const router = useRouter()
    const { currentWorkspace } = useWorkspace()
    const searchParams = useSearchParams()
    const preselectedProjectId = searchParams.get("projectId")

    const [name, setName] = useState("Untitled Flow")
    const [trigger, setTrigger] = useState("")
    const [filters, setFilters] = useState<FilterGroup[]>([])
    const [actions, setActions] = useState<Action[]>([])
    const [loading, setLoading] = useState(false)
    const [statusOptions, setStatusOptions] = useState<any[]>([])

    // Scope State
    const [scopeType, setScopeType] = useState<"GLOBAL" | "PROJECT">(preselectedProjectId ? "PROJECT" : "GLOBAL")
    const [selectedProjectId, setSelectedProjectId] = useState<string>(preselectedProjectId || "")
    const [projects, setProjects] = useState<any[]>([])

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!currentWorkspace?.id) return

            // Fetch Statuses
            const { data: statuses } = await supabase
                .from("task_statuses")
                .select("*")
                .eq("workspace_id", currentWorkspace.id)
                .order("position", { ascending: true })

            if (statuses) setStatusOptions(statuses)

            // Fetch Projects for Selector
            const { data: projectsData } = await supabase
                .from("projects")
                .select("id, name")
                .eq("workspace_id", currentWorkspace.id)
                .order("created_at", { ascending: false })

            if (projectsData) setProjects(projectsData)
        }
        fetchMetadata()
    }, [currentWorkspace?.id, supabase])

    const addAction = (type: string) => {
        const newAction: Action = {
            step: actions.length + 1,
            type,
            config: type === 'delay' ? { duration: '1h' }
                : type === 'send_notification' ? { template: '' }
                    : type === 'assign_user' ? { assignee_id: '' }
                        : {}
        }
        setActions([...actions, newAction])
    }

    const removeAction = (index: number) => {
        const newActions = [...actions]
        newActions.splice(index, 1)
        // Re-index steps
        newActions.forEach((a, i) => a.step = i + 1)
        setActions(newActions)
    }

    const updateActionConfig = (index: number, key: string, value: any) => {
        const newActions = [...actions]
        newActions[index].config = { ...newActions[index].config, [key]: value }
        setActions(newActions)
    }

    const handleSave = async () => {
        if (!name) return toast.error("Please name your flow")
        if (!trigger) return toast.error("Please select a trigger")
        if (actions.length === 0) return toast.error("Add at least one action")
        if (!currentWorkspace?.id) return toast.error("No workspace selected")
        if (scopeType === 'PROJECT' && !selectedProjectId) return toast.error("Please select a project")

        setLoading(true)
        try {
            const { error } = await supabase
                .from('automation_rules')
                .insert({
                    workspace_id: currentWorkspace.id,
                    name,
                    trigger_event: trigger,
                    project_id: scopeType === 'PROJECT' ? selectedProjectId : null, // Scope
                    filters: filters, // Now supports JSONB structure
                    actions_chain: actions,
                    is_active: true
                } as any)

            if (error) throw error

            toast.success("Ninja Flow activated! 🥷")
            router.push('/automation')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Variable Picker Component
    const VariablePicker = ({ onSelect }: { onSelect: (tag: string) => void }) => {
        const vars = getAvailableVariables(trigger || 'task.')
        return (
            <div className="grid gap-2 p-2">
                <div className="text-xs font-semibold text-zinc-500 mb-1">Magic Variables</div>
                {vars.map(v => (
                    <button
                        key={v.id}
                        onClick={() => onSelect(`{{${v.id}}}`)}
                        className="text-left text-xs px-2 py-1 rounded hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
            {/* Header */}
            <header className="flex items-center justify-between sticky top-0 z-30 bg-black/50 backdrop-blur-xl -mx-8 px-8 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-2xl font-black bg-transparent border-none px-0 h-auto focus-visible:ring-0 placeholder:text-zinc-600 w-[400px]"
                            placeholder="Name your flow..."
                        />
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {scopeType === 'GLOBAL' ? 'Global Automation' : `Project: ${projects.find(p => p.id === selectedProjectId)?.name || 'Loading...'}`}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-zinc-400 border-zinc-800 hover:text-white">Run Test</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-[#ccff00] text-black hover:bg-[#b3ff00] font-bold">
                        {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                        {loading ? 'Sealing...' : 'Activate Flow'}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Scope, Trigger & Logic */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Scope Card */}
                    <div className="glass-card rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                <Database className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Scope</h3>
                                <p className="text-xs text-zinc-400">Where does this run?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex rounded-lg bg-zinc-950 p-1 border border-white/10">
                                <button
                                    onClick={() => setScopeType('GLOBAL')}
                                    className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${scopeType === 'GLOBAL' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Global (All Projects)
                                </button>
                                <button
                                    onClick={() => setScopeType('PROJECT')}
                                    className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${scopeType === 'PROJECT' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Specific Project
                                </button>
                            </div>

                            {scopeType === 'PROJECT' && (
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger className="bg-zinc-950/50 border-white/10">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-[34px] -top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-yellow-500/50 to-transparent -z-10" />
                        {/* Trigger Card */}
                        <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-24 h-24 text-yellow-500" />
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-white">Trigger</h3>
                                    <p className="text-xs text-zinc-400">What starts this automation?</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Event</Label>
                                    <Select value={trigger} onValueChange={setTrigger}>
                                        <SelectTrigger className="h-12 bg-zinc-950/50 border-white/10">
                                            <SelectValue placeholder="Select Event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TRIGGER_EVENTS.map(e => (
                                                <SelectItem key={e.id} value={e.id}>
                                                    <div>
                                                        <div className="font-medium">{e.label}</div>
                                                        <div className="text-xs text-zinc-500">{e.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logic / Filters */}
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[34px] -top-8 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/50 via-purple-500/50 to-transparent -z-10" />

                        <div className="glass-card rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <GitBranch className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Conditions</h3>
                                    <p className="text-xs text-zinc-400">Only continue if...</p>
                                </div>
                            </div>

                            <FilterBuilder
                                value={filters}
                                onChange={setFilters}
                                triggerType={trigger}
                                statusOptions={statusOptions}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Action Chain */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-zinc-300">Action Flow</h2>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Execution Order</div>
                    </div>

                    <div className="relative pl-8 space-y-6">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                        <AnimatePresence>
                            {actions.map((action, index) => {
                                const Icon = ACTION_TYPES.find(t => t.id === action.type)?.icon || Zap
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="relative bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 group hover:border-zinc-700 transition-colors shadow-lg"
                                    >
                                        {/* Connector Dot */}
                                        <div className="absolute -left-[29px] top-8 w-6 h-6 rounded-full bg-zinc-950 border-4 border-zinc-800 z-10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-[#ccff00]" />
                                        </div>

                                        <div className="absolute -left-[20px] top-[42px] w-6 h-0.5 bg-zinc-800" />

                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00]">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg text-white">{ACTION_TYPES.find(t => t.id === action.type)?.label}</span>
                                                    <div className="text-xs text-zinc-500">Step {index + 1}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeAction(index)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 hover:bg-red-400/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Action Config UI */}
                                        <div className="pl-[56px] space-y-4">
                                            {action.type === 'send_notification' && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="text-xs font-medium text-zinc-400">Message Template</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="text-xs text-[#ccff00] hover:underline flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" /> Insert Variable
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-64 p-0 bg-zinc-900 border-zinc-800" align="end">
                                                                <VariablePicker onSelect={(tag) => {
                                                                    const current = action.config.template || ''
                                                                    updateActionConfig(index, 'template', current + tag)
                                                                }} />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <MentionInput
                                                        value={action.config.template || ''}
                                                        onChange={(v) => updateActionConfig(index, 'template', v)}
                                                        placeholder="Hello @Sarah, task updated!"
                                                    />
                                                </div>
                                            )}

                                            {action.type === 'delay' && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-zinc-400">Duration</Label>
                                                    <Select
                                                        value={action.config.duration || '1h'}
                                                        onValueChange={(v) => updateActionConfig(index, 'duration', v)}
                                                    >
                                                        <SelectTrigger className="bg-zinc-950 border-white/10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                                            <SelectItem value="15m">15 Minutes</SelectItem>
                                                            <SelectItem value="1h">1 Hour</SelectItem>
                                                            <SelectItem value="24h">24 Hours</SelectItem>
                                                            <SelectItem value="48h">48 Hours</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {action.type === 'assign_user' && (
                                                <AssignUserConfig
                                                    value={action.config.assignee_id || ''}
                                                    onChange={(v) => updateActionConfig(index, 'assignee_id', v)}
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Add Step Button */}
                        <div className="relative pt-4 pl-0">
                            <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center -ml-[12px] z-10">
                                <Plus className="w-3 h-3 text-zinc-400" />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full border-dashed border-zinc-800 hover:border-[#ccff00]/50 hover:bg-[#ccff00]/5 h-20 rounded-2xl gap-2 text-zinc-400 hover:text-[#ccff00] transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-[#ccff00]/20 transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        Add Action Step
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-2 bg-zinc-900 border-zinc-800" align="start" sideOffset={10}>
                                    <div className="grid gap-1">
                                        <div className="text-xs font-bold text-zinc-500 px-3 py-2 uppercase tracking-wider">Choose Action</div>
                                        {ACTION_TYPES.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => addAction(type.id)}
                                                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/5 text-sm text-left transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-[#ccff00] group-hover:text-black transition-colors text-zinc-400">
                                                    <type.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{type.label}</div>
                                                    <div className="text-[10px] text-zinc-500">Perform this action</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black -z-50 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[100px] -z-50 pointer-events-none" />
        </div>
    )
}

function Loader2({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
}

function GitBranch({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
}

export default function NewAutomationPage() {
    return (
        <Suspense fallback={<div className="p-8 text-zinc-500">Loading editor...</div>}>
            <AutomationContent />
        </Suspense>
    )
}
