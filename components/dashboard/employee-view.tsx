"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { NinjaStatusWidget } from "@/components/dashboard/ninja-status-widget"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Calendar, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export function EmployeeView({ user }: { user: any }) {
    const supabase = createClient() as any
    const [tasks, setTasks] = useState<any[]>([])
    const [stats, setStats] = useState({
        completed: 0,
        pending: 0,
        streak: 7 // Mock streak for now
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return

            // 1. My Due Tasks
            const { data: myTasks } = await supabase
                .from('tasks')
                .select('*, projects(name)')
                .eq('assignee_id', user.id)
                .neq('status', 'APPROVED')
                .neq('status', 'PUBLISHED')
                .order('due_date', { ascending: true })
                .limit(5)

            if (myTasks) setTasks(myTasks)

            // 2. Stats
            const { count: completedCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('assignee_id', user.id)
                .in('status', ['APPROVED', 'PUBLISHED'])

            const { count: pendingCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('assignee_id', user.id)
                .neq('status', 'APPROVED')
                .neq('status', 'PUBLISHED')

            setStats(prev => ({ ...prev, completed: completedCount || 0, pending: pendingCount || 0 }))
        }

        fetchData()
    }, [user])

    return (
        <div className="space-y-8 animate-in fly-in-bottom duration-500">
            {/* 1. Gamification Hero */}
            <NinjaStatusWidget />

            {/* 2. My Mission Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <img src="https://em-content.zobj.net/source/apple/354/shinto-shrine_26e9.png" className="w-8 h-8" />
                            My Missions
                        </h2>
                        <Link href="/content">
                            <Button variant="ghost" className="text-[var(--brand)]">View Kanban <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    </div>

                    <div className="grid gap-4">
                        {tasks.length === 0 ? (
                            <Card className="p-8 flex flex-col items-center justify-center bg-zinc-900 border-zinc-800 text-center">
                                <CheckCircle2 className="w-12 h-12 text-zinc-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                                <p className="text-zinc-500">You have zero pending missions. Great work, Ninja.</p>
                            </Card>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[var(--brand)]/50 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {task.priority || 'NORMAL'}
                                            </span>
                                            {task.projects && (
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    in {task.projects.name}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-[var(--brand)] transition-colors">{task.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                                            </span>
                                            <span>•</span>
                                            <span className="uppercase">{task.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="bg-white text-black hover:bg-[var(--brand)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Engage
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Quick Stats Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 glass-card border-white/5 bg-gradient-to-br from-zinc-900 to-black">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Performance</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white">Missions Completed</span>
                                    <span className="text-[var(--brand)] font-bold">{stats.completed}</span>
                                </div>
                                <Progress value={stats.completed + stats.pending > 0 ? (stats.completed / (stats.completed + stats.pending)) * 100 : 0} className="h-2" />
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white">{stats.streak}</div>
                                    <div className="text-xs text-zinc-500 uppercase">Day Streak</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 glass-card border-white/5">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Training Dojo</h3>
                        <p className="text-sm text-zinc-400 mb-4">Complete daily challenges to earn extra XP and badges.</p>
                        <Button className="w-full" variant="outline">Enter Dojo</Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
