"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, TrendingUp, Users, Activity, Briefcase } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export function LeaderView({ user }: { user: any }) {
    const supabase = createClient() as any
    const [stats, setStats] = useState({
        activeProjects: 0,
        totalRevenue: 0,
        teamSize: 0,
        clientCount: 0
    })
    const [projects, setProjects] = useState<any[]>([])
    const [teamActivity, setTeamActivity] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            // 1. Stats
            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
            const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
            const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })

            // Mock Revenue for now (sum of project budgets)
            const { data: budgetData } = await supabase.from('projects').select('total_budget')
            const totalRevenue = budgetData?.reduce((acc: number, curr: any) => acc + (curr.total_budget || 0), 0) || 0

            setStats({
                activeProjects: projectCount || 0,
                totalRevenue,
                teamSize: userCount || 0,
                clientCount: clientCount || 0
            })

            // 2. Recent Projects Health
            const { data: recentProjects } = await supabase
                .from('projects')
                .select('*, clients(name, logo_url)')
                .order('updated_at', { ascending: false })
                .limit(5)

            if (recentProjects) setProjects(recentProjects)

            // 3. Team Pulse (Recent Tasks)
            const { data: recentTasks } = await supabase
                .from('tasks')
                .select('*, assignee:users(full_name, avatar_url)')
                .order('updated_at', { ascending: false })
                .limit(5)

            if (recentTasks) setTeamActivity(recentTasks)
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white">Agency Command Center 🚀</h1>
                <p className="text-zinc-400">Welcome back, {user.full_name}. Here is the bird's eye view.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 glass-card border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase font-medium">Pipeline</p>
                            <p className="text-2xl font-bold text-white font-mono">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 glass-card border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase font-medium">Active Projects</p>
                            <p className="text-2xl font-bold text-white font-mono">{stats.activeProjects}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 glass-card border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase font-medium">Team Size</p>
                            <p className="text-2xl font-bold text-white font-mono">{stats.teamSize}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 glass-card border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase font-medium">Clients</p>
                            <p className="text-2xl font-bold text-white font-mono">{stats.clientCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Health Table */}
                <Card className="glass-card border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-zinc-400" />
                            Project Health
                        </h3>
                        <Link href="/projects">
                            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">View All</Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <div className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            {project.clients?.logo_url ? <img src={project.clients.logo_url} className="w-6 h-6 object-contain" /> : project.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white group-hover:text-[var(--brand)] transition-colors">{project.name}</p>
                                            <p className="text-xs text-zinc-500">{project.clients?.name || 'Internal'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-2 py-1 rounded-full text-xs font-bold inline-block border ${project.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                project.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                            }`}>
                                            {project.status}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                {/* Team Pulse */}
                <Card className="glass-card border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-zinc-400" />
                            Live Pulse
                        </h3>
                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">Detailed Report</Button>
                    </div>
                    <div className="space-y-4">
                        {teamActivity.map((task) => (
                            <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {task.assignee?.avatar_url ? (
                                        <img src={task.assignee.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-zinc-400">{task.assignee?.full_name?.substring(0, 2) || 'NA'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-300">
                                        <span className="text-white font-medium">{task.assignee?.full_name || 'Someone'}</span> updated <span className="text-[var(--brand)]">{task.title}</span>
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(task.updated_at).toLocaleTimeString()} • {task.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
