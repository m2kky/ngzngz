import { Bot, FileText, Plus, ThumbsUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createTask } from "@/actions/create-task"
import { useState } from "react"

interface Task {
    assignee: string
    task: string
    deadline: string
}

interface AIMissionReportProps {
    summary: string
    tasks: Task[]
    workspaceId: string
}

export function AIMissionReport({ summary, tasks, workspaceId }: AIMissionReportProps) {
    const [createdTasks, setCreatedTasks] = useState<Set<number>>(new Set())
    const [isCreating, setIsCreating] = useState<number | null>(null)

    const handleCreateTask = async (task: Task, index: number) => {
        setIsCreating(index)
        try {
            await createTask({
                title: task.task,
                assignee: task.assignee,
                deadline: task.deadline,
                workspace_id: workspaceId
            })

            setCreatedTasks(prev => new Set(prev).add(index))
            toast.success(`Task created for ${task.assignee}`, {
                description: "Added to the project board successfully."
            })
        } catch (error) {
            toast.error("Failed to create task", {
                description: "Please make sure you are in a valid workspace."
            })
        } finally {
            setIsCreating(null)
        }
    }

    return (
        <div className="flex gap-4 mt-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20 border border-white/10">
                <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="max-w-[85%] w-full">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Gemini AI</span>
                    <span className="text-xs text-zinc-500">Just now</span>
                </div>

                <div className="relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-white">
                        <FileText className="w-4 h-4 text-purple-400" />
                        Mission Report
                    </h3>

                    <p className="text-zinc-300 text-sm mb-4 border-b border-white/10 pb-4 leading-relaxed">
                        {summary}
                    </p>

                    <div className="space-y-3">
                        {tasks.map((task, i) => (
                            <div key={i} className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-[#ccff00]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                                        {task.assignee.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{task.task}</div>
                                        <div className="text-[10px] text-zinc-400">
                                            Assignee: {task.assignee} • Deadline: {task.deadline}
                                        </div>
                                    </div>
                                </div>
                                {createdTasks.has(i) ? (
                                    <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-500/10 h-7 text-xs font-bold gap-1 cursor-default">
                                        <CheckCircle2 className="w-3 h-3" /> Created
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handleCreateTask(task, i)}
                                        disabled={isCreating === i}
                                        className="bg-[#ccff00] text-black hover:bg-[#b3e600] h-7 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {isCreating === i ? "..." : <><Plus className="w-3 h-3" /> Create</>}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                        <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                            Is this accurate? <ThumbsUp className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
