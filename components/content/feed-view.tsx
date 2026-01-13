"use client"

import { formatDistanceToNow } from "date-fns"
import { Activity, CheckCircle2, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface FeedViewProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
}

export function FeedView({ tasks, onTaskClick }: FeedViewProps) {
    // Sort tasks by updated_at to simulate a feed
    const sortedTasks = [...tasks].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="text-[#ccff00]" />
                <h2 className="text-xl font-bold text-white">Activity Feed</h2>
            </div>

            <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-10">
                {sortedTasks.map((task, idx) => (
                    <div key={task.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 transition-colors",
                            idx === 0 ? "bg-[#ccff00]" : "bg-zinc-700 group-hover:bg-zinc-500"
                        )} />

                        <div
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:bg-zinc-900 transition-all hover:border-zinc-700"
                            onClick={() => onTaskClick(task)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                                        <FileText size={12} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-200">
                                        Task Updated
                                    </span>
                                </div>
                                <span className="text-xs text-zinc-500">
                                    {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ccff00] transition-colors">
                                {task.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-zinc-400 mt-3">
                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        task.status === "APPROVED" ? "bg-green-500" :
                                            task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-zinc-500"
                                    )} />
                                    {task.status}
                                </div>
                                {task.assignee_id && (
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} />
                                        Assignee
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
