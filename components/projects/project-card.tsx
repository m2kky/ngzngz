"use client"

import { useRouter } from "next/navigation"
import { format, isPast, differenceInDays } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, AlertCircle, Briefcase, CheckCircle2, Clock, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { ProjectWithStats } from "@/app/(dashboard)/projects/page"

interface ProjectCardProps {
    project: ProjectWithStats
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter()
    const { stats, team, clients } = project

    const handleClick = () => {
        router.push(`/projects/${project.id}`)
    }

    // Deadline Logic
    const daysLeft = project.end_date ? differenceInDays(new Date(project.end_date), new Date()) : null
    const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
    const isOverdue = project.end_date && isPast(new Date(project.end_date))

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            layout
        >
            <Card
                className="glass-card cursor-pointer group rounded-2xl border-white/5 hover:border-white/20 transition-all duration-300"
                onClick={handleClick}
            >
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                        {clients ? (
                            <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800 flex gap-1 items-center">
                                <Briefcase className="w-3 h-3" />
                                {clients.name}
                            </Badge>
                        ) : <div />}

                        {project.end_date && (
                            <Badge
                                variant={isOverdue ? "destructive" : isUrgent ? "default" : "secondary"}
                                className={isUrgent ? "bg-amber-500/20 text-amber-500 border-amber-500/20" : ""}
                            >
                                <Calendar className="w-3 h-3 mr-1" />
                                {isOverdue ? "Overdue" : daysLeft === 0 ? "Due Today" : `${daysLeft} days left`}
                            </Badge>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-[var(--brand)] transition-colors">
                        {project.name}
                    </h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 min-h-[40px]">
                        {project.description || "No description provided."}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Progress</span>
                            <span className="text-white font-medium">{stats.progress}%</span>
                        </div>
                        <Progress value={stats.progress} className="h-2 bg-zinc-800" indicatorClassName="bg-gradient-to-r from-[var(--brand)] to-emerald-400" />
                    </div>

                    {/* Task Counters Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                            <Clock className="w-4 h-4 text-zinc-500 mb-1" />
                            <span className="text-lg font-bold text-white">{stats.pending}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Pending</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                            <Eye className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-lg font-bold text-white">{stats.review}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Review</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                            <span className="text-lg font-bold text-white">{stats.done}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Done</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-5 border-t border-white/5 flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {team.length > 0 ? (
                            team.slice(0, 4).map((avatar, i) => (
                                <Avatar key={i} className="w-8 h-8 border-2 border-zinc-950">
                                    <AvatarImage src={avatar} />
                                    <AvatarFallback>TM</AvatarFallback>
                                </Avatar>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-600 italic">No team assigned</span>
                        )}
                        {team.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-400">
                                +{team.length - 4}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <TrendingUp className="w-3 h-3" />
                        Stats
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
