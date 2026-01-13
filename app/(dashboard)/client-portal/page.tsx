"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Check, X, MessageSquare, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useWorkspace } from "@/components/providers/workspace-provider"

export default function ClientPortalPage() {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient() as any

    useEffect(() => {
        if (!currentWorkspace) return

        const fetchClientTasks = async () => {
            const { data } = await supabase
                .from("tasks")
                .select("*")
                .eq("workspace_id", currentWorkspace.id)
                .eq("status", "CLIENT_REVIEW")
                .order("updated_at", { ascending: false })

            if (data) setTasks(data)
            setLoading(false)
        }

        fetchClientTasks()

        // Realtime subscription for client updates
        const channel = supabase
            .channel('client-portal')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
                fetchClientTasks()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [currentWorkspace])

    const handleApprove = async (taskId: string) => {
        const { error } = await supabase
            .from("tasks")
            .update({ status: "APPROVED" })
            .eq("id", taskId)

        if (error) toast.error("Failed to approve")
        else toast.success("Task Approved! 🎉")
    }

    const handleReject = async (taskId: string) => {
        // In a real app, we'd open a feedback modal here
        toast.info("Feedback request sent to agency! 📝")
    }

    if (!currentWorkspace) return <div className="p-8 text-zinc-500">Select a workspace...</div>

    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
                    <div className="flex items-center gap-4">
                        {currentWorkspace.logo_url ? (
                            <img src={currentWorkspace.logo_url} className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl font-bold text-zinc-500">
                                {currentWorkspace.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-white">{currentWorkspace.name}</h1>
                            <p className="text-zinc-400">Client Approval Portal</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Waiting for Approval ({tasks.length})
                    </h2>

                    {loading ? (
                        <div className="text-zinc-500">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                            <p className="text-zinc-400">No tasks currently waiting for your review.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row"
                                >
                                    {/* Preview Section (Left) */}
                                    <div className="flex-1 p-8 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-2xl font-bold text-white">{task.title}</h3>
                                            <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                Review Needed
                                            </span>
                                        </div>

                                        {/* Content Preview (Simplified) */}
                                        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 text-zinc-300 prose prose-invert max-w-none">
                                            {task.content_blocks?.[0]?.content || "No preview available."}
                                            {task.content_blocks?.length > 1 && (
                                                <div className="mt-4 text-xs text-zinc-500 italic">
                                                    + {task.content_blocks.length - 1} more blocks...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Section (Right) */}
                                    <div className="bg-zinc-950 border-l border-zinc-800 p-8 flex flex-col justify-center gap-4 min-w-[250px]">
                                        <Button
                                            onClick={() => handleApprove(task.id)}
                                            className="h-14 text-lg bg-green-500 hover:bg-green-600 text-black font-bold"
                                        >
                                            <Check className="mr-2" /> Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(task.id)}
                                            variant="outline"
                                            className="h-14 text-lg border-zinc-800 hover:bg-zinc-900"
                                        >
                                            <MessageSquare className="mr-2" /> Request Changes
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
