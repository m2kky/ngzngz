"use client"

import { Database } from "@/types/database"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { format } from "date-fns"
import { ImageIcon } from "lucide-react"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface GalleryViewProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
}

export function GalleryView({ tasks, onTaskClick }: GalleryViewProps) {
    const getCoverImage = (task: Task) => {
        if (!task.content_blocks || !Array.isArray(task.content_blocks)) return null

        // Find first image block
        const imageBlock = task.content_blocks.find((block: any) =>
            block.type === "image" && block.props?.url
        )

        return imageBlock ? imageBlock.props.url : null
    }

    const getPriorityColor = (priority: string | null) => {
        switch (priority) {
            case "URGENT": return "bg-red-500/20 border-red-500/30"
            case "HIGH": return "bg-orange-500/20 border-orange-500/30"
            case "MEDIUM": return "bg-yellow-500/20 border-yellow-500/30"
            case "LOW": return "bg-blue-500/20 border-blue-500/30"
            default: return "bg-zinc-800 border-zinc-700"
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto p-1">
            {tasks.map((task) => {
                const coverImage = getCoverImage(task)
                const priorityColor = getPriorityColor(task.priority)

                return (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-[var(--brand)] hover:shadow-[0_0_30px_-10px_rgba(204,255,0,0.3)] transition-all cursor-pointer flex flex-col"
                    >
                        {/* Cover Image or Placeholder */}
                        <div className={`h-1/2 w-full relative overflow-hidden ${!coverImage ? priorityColor : ''}`}>
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt={task.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-500/50">
                                    <ImageIcon size={48} />
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                            <div className="absolute top-3 right-3">
                                <StatusBadge status={task.status || "DRAFTING"} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col justify-between bg-zinc-950/80 backdrop-blur-sm">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg text-white leading-tight line-clamp-3 group-hover:text-[var(--brand)] transition-colors">
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <PriorityBadge priority={task.priority || "MEDIUM"} />
                                    {task.due_date && (
                                        <span>• {format(new Date(task.due_date), "MMM d")}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center gap-2">
                                    {task.assignee_id ? (
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${task.assignee_id}`}
                                            className="w-6 h-6 rounded-full border border-zinc-700"
                                            alt="Assignee"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700" />
                                    )}
                                    <span className="text-xs text-zinc-500">
                                        {task.assignee_id ? "Assigned" : "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
