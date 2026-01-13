"use client"

import { useState } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    PointerSensor,
    closestCorners,
} from "@dnd-kit/core"

interface CalendarViewProps {
    tasks: any[]
    onTaskClick: (task: any) => void
    onTaskDateChange: (taskId: string, newDate: Date) => void
}

function DraggableCalendarTask({ task, onClick }: { task: any; onClick: (task: any) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    })

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => {
                if (!isDragging) onClick(task)
            }}
            className={cn(
                "text-left group flex flex-col gap-1 p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-[#ccff00]/50 hover:shadow-[0_0_10px_rgba(204,255,0,0.1)] transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 z-50 ring-2 ring-[#ccff00]"
            )}
        >
            <span className="text-xs font-medium text-zinc-200 truncate w-full block group-hover:text-[#ccff00]">
                {task.title}
            </span>
            <div className="flex items-center gap-1">
                <StatusBadge status={task.status} size="xs" />
                {task.priority && <PriorityBadge priority={task.priority} size="xs" />}
            </div>
        </div>
    )
}

function DroppableDay({
    day,
    tasks,
    isCurrentMonth,
    isToday,
    onTaskClick,
}: {
    day: Date
    tasks: any[]
    isCurrentMonth: boolean
    isToday: boolean
    onTaskClick: (task: any) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
        data: { day },
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[120px] border-b border-r border-zinc-800/50 p-2 flex flex-col gap-1 transition-colors",
                !isCurrentMonth && "bg-zinc-900/10 text-zinc-600",
                isToday && "bg-[#ccff00]/5",
                isOver && "bg-[#ccff00]/10 ring-2 ring-inset ring-[#ccff00]/50"
            )}
        >
            <div className="flex items-center justify-between mb-1">
                <span
                    className={cn(
                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                        isToday ? "bg-[#ccff00] text-black font-bold" : "text-zinc-400"
                    )}
                >
                    {format(day, "d")}
                </span>
                {tasks.length > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono">{tasks.length} tasks</span>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                {tasks.map((task) => (
                    <DraggableCalendarTask key={task.id} task={task} onClick={onTaskClick} />
                ))}
            </div>
        </div>
    )
}

export function CalendarView({ tasks, onTaskClick, onTaskDateChange }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activeId, setActiveId] = useState<string | null>(null)

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const today = () => setCurrentDate(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const getTasksForDay = (day: Date) => {
        return tasks.filter((task) => {
            if (!task.due_date) return false
            const taskDate = parseISO(task.due_date)
            return isSameDay(taskDate, day)
        })
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (!over) return

        const taskId = active.id
        const newDateString = over.id
        const newDate = parseISO(newDateString)

        // Find the task to check if the date actually changed
        const task = tasks.find((t) => t.id === taskId)
        if (task && task.due_date) {
            const oldDate = parseISO(task.due_date)
            if (!isSameDay(oldDate, newDate)) {
                onTaskDateChange(taskId, newDate)
            }
        } else {
            // If task has no due date, assign it
            onTaskDateChange(taskId, newDate)
        }

        setActiveId(null)
    }

    const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="text-[#ccff00]" />
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                                <ChevronLeft size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={today} className="h-7 text-xs px-2">
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/30">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-sm font-medium text-zinc-500 uppercase tracking-wider"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                    {calendarDays.map((day) => {
                        const dayTasks = getTasksForDay(day)
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <DroppableDay
                                key={day.toISOString()}
                                day={day}
                                tasks={dayTasks}
                                isCurrentMonth={isCurrentMonth}
                                isToday={isToday}
                                onTaskClick={onTaskClick}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="text-left flex flex-col gap-1 p-1.5 rounded bg-zinc-900 border border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.2)] w-[150px] opacity-90 cursor-grabbing">
                            <span className="text-xs font-medium text-zinc-200 truncate w-full block">
                                {activeTask.title}
                            </span>
                            <div className="flex items-center gap-1">
                                <StatusBadge status={activeTask.status} size="xs" />
                                {activeTask.priority && <PriorityBadge priority={activeTask.priority} size="xs" />}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
}
