"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronRight, ChevronDown, MoreHorizontal, Calendar, User } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface ListViewProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
}

export function ListView({ tasks, onTaskClick }: ListViewProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "DRAFTING": true,
        "IN_PROGRESS": true,
        "AI_CHECK": true,
        "INTERNAL_REVIEW": true,
        "CLIENT_REVIEW": true,
        "APPROVED": true,
        "PUBLISHED": true,
        "ADS_HANDOFF": true
    })

    const toggleGroup = (status: string) => {
        setExpandedGroups(prev => ({ ...prev, [status]: !prev[status] }))
    }

    const groupedTasks = tasks.reduce((acc, task) => {
        const status = task.status || "DRAFTING"
        if (!acc[status]) acc[status] = []
        acc[status].push(task)
        return acc
    }, {} as Record<string, Task[]>)

    const STATUS_ORDER = [
        "DRAFTING", "IN_PROGRESS", "AI_CHECK", "INTERNAL_REVIEW",
        "CLIENT_REVIEW", "APPROVED", "PUBLISHED", "ADS_HANDOFF"
    ]

    return (
        <div className="space-y-4 p-4">
            {STATUS_ORDER.map(status => {
                const groupTasks = groupedTasks[status] || []
                if (groupTasks.length === 0) return null

                const isExpanded = expandedGroups[status]

                return (
                    <div key={status} className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                        <div
                            className="flex items-center gap-2 p-3 bg-zinc-900/50 cursor-pointer hover:bg-zinc-900 transition-colors"
                            onClick={() => toggleGroup(status)}
                        >
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </Button>
                            <StatusBadge status={status} />
                            <span className="text-zinc-500 text-xs font-medium ml-2">{groupTasks.length} tasks</span>
                        </div>

                        {isExpanded && (
                            <div className="divide-y divide-zinc-800/50">
                                {groupTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className="flex items-center gap-4 p-3 hover:bg-zinc-900/50 cursor-pointer group transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-medium text-zinc-200 truncate">{task.title}</span>
                                                <PriorityBadge priority={task.priority || "MEDIUM"} size="xs" />
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {task.due_date ? format(new Date(task.due_date), "MMM d") : "No date"}
                                                </div>
                                                {task.assignee_id && (
                                                    <div className="flex items-center gap-1">
                                                        <User size={12} />
                                                        <span>Assignee</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
