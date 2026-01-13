"use client"

import { useState, useMemo } from "react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface TimelineViewProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const days = useMemo(() => {
        const start = startOfWeek(currentDate)
        const end = endOfWeek(addDays(start, 13)) // Show 2 weeks
        return eachDayOfInterval({ start, end })
    }, [currentDate])

    const handlePrev = () => setCurrentDate(prev => addDays(prev, -7))
    const handleNext = () => setCurrentDate(prev => addDays(prev, 7))

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev}>
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="font-bold text-zinc-200 w-32 text-center">
                        {format(days[0], "MMM d")} - {format(days[days.length - 1], "MMM d")}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNext}>
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-[1000px]">
                    {/* Header Row */}
                    <div className="flex border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
                        <div className="w-64 shrink-0 p-3 border-r border-zinc-800 font-medium text-zinc-400 text-sm bg-zinc-950 sticky left-0 z-20">
                            Task
                        </div>
                        {days.map(day => (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "flex-1 min-w-[50px] p-2 text-center border-r border-zinc-800/50 text-xs",
                                    isSameDay(day, new Date()) ? "bg-[#ccff00]/10 text-[#ccff00] font-bold" : "text-zinc-500"
                                )}
                            >
                                <div>{format(day, "EEE")}</div>
                                <div>{format(day, "d")}</div>
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-zinc-800/50">
                        {tasks.map(task => (
                            <div key={task.id} className="flex group hover:bg-zinc-900/30">
                                <div className="w-64 shrink-0 p-3 border-r border-zinc-800 text-sm font-medium text-zinc-300 truncate sticky left-0 bg-zinc-950 z-10 group-hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => onTaskClick(task)}>
                                    {task.title}
                                </div>
                                {days.map(day => {
                                    const isDue = task.due_date && isSameDay(new Date(task.due_date), day)
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className="flex-1 min-w-[50px] border-r border-zinc-800/50 relative p-1"
                                        >
                                            {isDue && (
                                                <div
                                                    className="absolute inset-1 bg-[#ccff00]/20 border border-[#ccff00]/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#ccff00]/30 transition-colors"
                                                    onClick={() => onTaskClick(task)}
                                                    title={`Due: ${task.title}`}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[#ccff00]" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
