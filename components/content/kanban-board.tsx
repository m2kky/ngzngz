"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
    useDndContext,
    DndContext,
    DragOverlay,
    closestCorners,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    PointerSensor
} from "@dnd-kit/core"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { Clock } from "lucide-react"
import type { Database } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { BoardSettings } from "./board-settings"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface KanbanBoardProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onStatusChange: (taskId: string, newStatus: string) => void
    config?: { groupBy?: string }
}

const DEFAULT_COLUMNS = [
    { id: "DRAFTING", title: "Drafting", color: "bg-zinc-500" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-[#a855f7]" },
    { id: "REVIEW", title: "Review", color: "bg-blue-500" },
    { id: "APPROVED", title: "Approved", color: "bg-[#ccff00]" },
]

function DraggableTask({ task, onClick }: { task: Task; onClick: (task: Task) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    // Helper to render property value
    const renderProperty = (key: string, value: any) => {
        if (!value) return null
        if (Array.isArray(value)) {
            return (
                <div key={key} className="flex flex-wrap gap-1 mt-1">
                    {value.map((v: string) => (
                        <span key={v} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                            {v}
                        </span>
                    ))}
                </div>
            )
        }
        return (
            <div key={key} className="text-xs text-zinc-500 mt-1 truncate">
                {String(value)}
            </div>
        )
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => {
                if (!isDragging) onClick(task)
            }}
            className={`glass-card liquid-gloss p-4 rounded-3xl shadow-lg cursor-pointer group ${isDragging ? "opacity-50 z-50 ring-2 ring-[#ccff00] scale-105" : ""}`}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            layout
        >
            <div className="flex justify-between mb-3">
                <PriorityBadge priority={task.priority} />
            </div>

            <h4 className="text-zinc-100 text-sm font-bold leading-snug mb-3 group-hover:text-[#ccff00] liquid-text transition-colors">
                {task.title}
            </h4>

            {/* Dynamic Properties */}
            {task.properties && Object.keys(task.properties as object).length > 0 && (
                <div className="mb-3 space-y-1">
                    {Object.entries(task.properties as object).map(([key, value]) => renderProperty(key, value))}
                </div>
            )}

            <div className="flex justify-between pt-3 border-t border-white/10 items-center">
                <div className="flex items-center gap-2">
                    {task.assignee_id && (
                        <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600" />
                    )}
                    {/* Project Badge */}
                    {(task as any).projects && (task as any).projects.name && (
                        <div className="flex items-center text-[10px] text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded-full border border-zinc-800">
                            {/* Briefcase icon literal or import if available, assuming import exists or using className workaround */}
                            <span className="mr-1">📁</span>
                            {(task as any).projects.name}
                        </div>
                    )}
                </div>
                {task.due_date && (
                    <div className="flex items-center text-[10px] text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-full">
                        <Clock size={10} className="mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function DroppableColumn({ id, title, color, isHex, tasks, onTaskClick }: { id: string, title: string, color: string, isHex?: boolean, tasks: Task[], onTaskClick: (task: Task) => void }) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div ref={setNodeRef} className="flex flex-col h-full w-[300px] min-w-[300px] bg-white/5 rounded-3xl p-4 border border-white/5 liquid-gloss backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${!isHex ? color : ''}`}
                        style={isHex ? { backgroundColor: color } : {}}
                    />
                    <h3 className="font-bold text-zinc-300 text-sm tracking-wide uppercase">{title}</h3>
                </div>
                <span className="bg-black/20 text-zinc-400 text-xs px-2 py-1 rounded-full font-mono">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {tasks.map((task) => (
                    <DraggableTask key={task.id} task={task} onClick={onTaskClick} />
                ))}
            </div>
        </div>
    )
}

export function KanbanBoard({ tasks, onTaskClick, onStatusChange, config }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [columns, setColumns] = useState<any[]>(DEFAULT_COLUMNS)
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    useEffect(() => {
        if (currentWorkspace) {
            fetchColumns()
        }
    }, [currentWorkspace])

    const fetchColumns = async () => {
        if (!currentWorkspace) return
        const { data } = await supabase
            .from("task_statuses")
            .select("*")
            .eq("workspace_id", currentWorkspace.id)
            .order("position")

        if (data && data.length > 0) {
            setColumns(data.map(col => ({
                id: col.slug,
                title: col.name,
                // Check if color is hex or tailwind class
                color: col.color?.startsWith('#') ? col.color : (col.color || "bg-zinc-500"),
                isHex: col.color?.startsWith('#')
            })))
        } else {
            // Fallback to default if no custom columns - MATCHING TASK MODAL DEFAULTS
            setColumns([
                { id: "DRAFTING", title: "Drafting", color: "#71717a", isHex: true },
                { id: "IN_PROGRESS", title: "In Progress", color: "#3b82f6", isHex: true },
                { id: "AI_CHECK", title: "AI Check", color: "#a855f7", isHex: true },
                { id: "INTERNAL_REVIEW", title: "Internal Review", color: "#f59e0b", isHex: true },
                { id: "CLIENT_REVIEW", title: "Client Review", color: "#f97316", isHex: true },
                { id: "APPROVED", title: "Approved", color: "#22c55e", isHex: true },
                { id: "PUBLISHED", title: "Published", color: "#ec4899", isHex: true },
                { id: "ADS_HANDOFF", title: "Ads Handoff", color: "#14b8a6", isHex: true },
            ])
        }
    }

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const taskId = active.id
            // If dropping over a column container, use its ID. If dropping over a task, find its column.
            let newStatus = over.id

            // Check if dropped on a task instead of a column
            const isOverTask = tasks.find(t => t.id === over.id)
            if (isOverTask) {
                newStatus = isOverTask.status
            }

            // Only update if status actually changed
            const currentTask = tasks.find(t => t.id === taskId)
            if (currentTask && currentTask.status !== newStatus) {
                onStatusChange(taskId, newStatus)
            }
        }

        setActiveId(null)
    }

    const activeTask = useMemo(() =>
        tasks.find((task) => task.id === activeId),
        [activeId, tasks])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-end px-6 pb-2 shrink-0">
                <BoardSettings onUpdate={fetchColumns} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Scrollable Container for Columns (Horizontal) */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full gap-6 px-6 pb-6 min-w-max">
                        {columns.map((col) => (
                            <DroppableColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                isHex={col.isHex}
                                tasks={tasks.filter((task) => {
                                    return task.status === col.id
                                })}
                                onTaskClick={onTaskClick}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? <DraggableTask task={activeTask} onClick={() => { }} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
