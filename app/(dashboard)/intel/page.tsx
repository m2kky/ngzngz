"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Flame, ArrowRight, Copy, Video, Camera, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { TaskModal } from "@/components/content/task-modal"

interface Trend {
    id: string
    title: string
    platform: string
    description: string
    virality_score: number
    difficulty: string
    format: string
}

export default function IntelPage() {
    const [trends, setTrends] = useState<Trend[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const supabase = createClient() as any

    useEffect(() => {
        const fetchTrends = async () => {
            const { data, error } = await supabase
                .from("trends")
                .select("*")
                .order("virality_score", { ascending: false })

            if (data) setTrends(data)
            setLoading(false)
        }
        fetchTrends()
    }, [])

    const getIcon = (format: string) => {
        if (format.includes("Video") || format.includes("Template")) return <Video size={16} />
        if (format.includes("Audio") || format.includes("Interview")) return <Mic size={16} />
        return <Camera size={16} />
    }

    const getDifficultyColor = (diff: string) => {
        if (diff === 'EASY') return 'text-green-400 border-green-400/20 bg-green-400/10'
        if (diff === 'MEDIUM') return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
        return 'text-red-400 border-red-400/20 bg-red-400/10'
    }

    const handleStealTrend = (trend: Trend) => {
        setSelectedTrend(trend)
        setShowTaskModal(true)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Flame className="text-orange-500 fill-orange-500" size={32} />
                        Trend Radar
                    </h1>
                    <p className="text-zinc-400 mt-2">Viral formats you should jump on right now.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trends.map((trend, idx) => (
                        <motion.div
                            key={trend.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all hover:-translate-y-1"
                        >
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                <div className="text-2xl font-black text-white">{trend.virality_score}%</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Virality</div>
                            </div>

                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${getDifficultyColor(trend.difficulty)}`}>
                                {trend.difficulty}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 pr-16">{trend.title}</h3>

                            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                                {getIcon(trend.format)}
                                <span>{trend.platform} • {trend.format}</span>
                            </div>

                            <p className="text-zinc-400 text-sm mb-6 line-clamp-2">
                                {trend.description}
                            </p>

                            <Button
                                onClick={() => handleStealTrend(trend)}
                                className="w-full bg-zinc-800 hover:bg-[var(--brand)] hover:text-black text-white transition-colors group-hover:bg-zinc-800"
                            >
                                <Copy size={16} className="mr-2" />
                                Steal this Trend
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}

            {showTaskModal && selectedTrend && (
                <TaskModal
                    task={{
                        title: `Trend: ${selectedTrend.title}`,
                        content_blocks: [
                            {
                                id: "1",
                                type: "paragraph",
                                content: `**Trend Description:** ${selectedTrend.description}\n\n**Platform:** ${selectedTrend.platform}\n**Format:** ${selectedTrend.format}`
                            }
                        ],
                        status: "DRAFTING",
                        priority: "HIGH"
                    } as any}
                    isNew={true}
                    onClose={() => setShowTaskModal(false)}
                    onSave={async (task) => {
                        const { error } = await supabase.from("tasks").insert([task])
                        if (!error) {
                            toast.success("Trend added to your tasks! 🚀")
                            setShowTaskModal(false)
                        }
                    }}
                />
            )}
        </div>
    )
}
