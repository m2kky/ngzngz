"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Plus, Trash2, GripVertical, Check, Palette } from "lucide-react"
import { toast } from "sonner"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskStatus {
    id: string
    name: string
    slug: string
    color: string
    icon: string
    position: number
}

const PRESET_COLORS = [
    "bg-zinc-500", "bg-slate-500", "bg-stone-500", "bg-red-500",
    "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
    "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500",
    "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500",
    "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500",
    "bg-[#ccff00]", "bg-[#00ff99]", "bg-[#00ccff]", "bg-[#ff00ff]"
]

function SortableStatusItem({ status, onDelete, onUpdate }: { status: TaskStatus, onDelete: (id: string) => void, onUpdate: (status: TaskStatus) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: status.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 mb-2">
            <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-zinc-500">
                <GripVertical size={16} />
            </div>

            <div className="flex-1 grid grid-cols-[1fr,auto,auto] gap-3 items-center">
                <Input
                    value={status.name}
                    onChange={(e) => onUpdate({ ...status, name: e.target.value })}
                    className="h-8 bg-transparent border-transparent hover:border-white/10 focus:border-[var(--brand)] transition-colors"
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <button className={`w-6 h-6 rounded-full ${status.color} ring-2 ring-white/20 hover:ring-white transition-all`} />
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 glass-panel border-zinc-800">
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => onUpdate({ ...status, color })}
                                    className={`w-6 h-6 rounded-full ${color} ${status.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'} transition-all`}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => onDelete(status.id)}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    )
}

export function BoardSettings({ onUpdate }: { onUpdate: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [statuses, setStatuses] = useState<TaskStatus[]>([])
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        if (isOpen && currentWorkspace) {
            fetchStatuses()
        }
    }, [isOpen, currentWorkspace])

    const fetchStatuses = async () => {
        if (!currentWorkspace) return
        const { data } = await supabase
            .from("task_statuses")
            .select("*")
            .eq("workspace_id", currentWorkspace.id)
            .order("position")

        if (data && data.length > 0) {
            setStatuses(data as any)
        } else {
            // Seed default columns if none exist
            const defaultStatuses = [
                { workspace_id: currentWorkspace.id, name: 'Drafting', slug: 'DRAFTING', color: '#71717a', position: 0, icon: 'circle' },
                { workspace_id: currentWorkspace.id, name: 'In Progress', slug: 'IN_PROGRESS', color: '#3b82f6', position: 1, icon: 'arrow-right' },
                { workspace_id: currentWorkspace.id, name: 'AI Check', slug: 'AI_CHECK', color: '#a855f7', position: 2, icon: 'sparkles' },
                { workspace_id: currentWorkspace.id, name: 'Internal Review', slug: 'INTERNAL_REVIEW', color: '#f59e0b', position: 3, icon: 'eye' },
                { workspace_id: currentWorkspace.id, name: 'Client Review', slug: 'CLIENT_REVIEW', color: '#f97316', position: 4, icon: 'user-check' },
                { workspace_id: currentWorkspace.id, name: 'Approved', slug: 'APPROVED', color: '#22c55e', position: 5, icon: 'check-circle' },
                { workspace_id: currentWorkspace.id, name: 'Published', slug: 'PUBLISHED', color: '#ec4899', position: 6, icon: 'globe' },
                { workspace_id: currentWorkspace.id, name: 'Ads Handoff', slug: 'ADS_HANDOFF', color: '#14b8a6', position: 7, icon: 'megaphone' }
            ]

            const { data: newCols, error } = await supabase
                .from("task_statuses")
                .insert(defaultStatuses)
                .select()

            if (newCols) setStatuses(newCols as any)
        }
    }

    const handleAddStatus = async () => {
        if (!currentWorkspace) return

        const newStatus = {
            workspace_id: currentWorkspace.id,
            name: "New Column",
            slug: `new-column-${Date.now()}`,
            color: "bg-zinc-500",
            position: statuses.length,
            icon: "circle"
        }

        const { data, error } = await supabase.from("task_statuses").insert(newStatus).select().single()

        if (error) {
            toast.error("Failed to add column")
        } else {
            setStatuses([...statuses, data as any])
            onUpdate()
        }
    }

    const handleUpdateStatus = async (updatedStatus: TaskStatus) => {
        const newStatuses = statuses.map(s => s.id === updatedStatus.id ? updatedStatus : s)
        setStatuses(newStatuses)

        // Debounce update to DB could be added here, for now direct update
        await supabase.from("task_statuses").update(updatedStatus).eq("id", updatedStatus.id)
        onUpdate()
    }

    const handleDeleteStatus = async (id: string) => {
        const { error } = await supabase.from("task_statuses").delete().eq("id", id)
        if (error) {
            toast.error("Failed to delete column")
        } else {
            setStatuses(statuses.filter(s => s.id !== id))
            onUpdate()
        }
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event

        if (active.id !== over.id) {
            const oldIndex = statuses.findIndex(s => s.id === active.id)
            const newIndex = statuses.findIndex(s => s.id === over.id)

            const newStatuses = arrayMove(statuses, oldIndex, newIndex)
            setStatuses(newStatuses)

            // Update positions in DB
            const updates = newStatuses.map((s, index) => ({
                ...s,
                position: index,
                workspace_id: currentWorkspace?.id,
            }))

            await supabase.from("task_statuses").upsert(updates as any)
            onUpdate()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="glass-card border-dashed hover:bg-white/5 gap-2">
                    <Settings size={14} />
                    Edit Board
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-zinc-800 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Board Columns</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={statuses.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {statuses.map(status => (
                                    <SortableStatusItem
                                        key={status.id}
                                        status={status}
                                        onDelete={handleDeleteStatus}
                                        onUpdate={handleUpdateStatus}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <Button onClick={handleAddStatus} className="w-full border-dashed border-zinc-700 hover:bg-white/5" variant="outline">
                        <Plus size={14} className="mr-2" />
                        Add Column
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
