"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, FileText, Settings, User, LayoutDashboard, Plus, Calendar, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SenseiChatModal } from "@/components/ai/sensei-chat-modal"

export function CommandMenu() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [tasks, setTasks] = useState<any[]>([])
    const [showSenseiChat, setShowSenseiChat] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        if (open) {
            // Fetch recent tasks when menu opens
            const fetchTasks = async () => {
                const { data } = await supabase
                    .from("tasks")
                    .select("id, title, status")
                    .order("updated_at", { ascending: false })
                    .limit(5)

                if (data) setTasks(data)
            }
            fetchTasks()
        }
    }, [open, supabase])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <SenseiChatModal isOpen={showSenseiChat} onClose={() => setShowSenseiChat(false)} />

            {open && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-fade-in">
                    <Command className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center border-b border-zinc-800 px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Command.Input
                                placeholder="Type a command or search..."
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto p-2">
                            <Command.Empty className="py-6 text-center text-sm text-zinc-500">No results found.</Command.Empty>

                            <Command.Group heading="Navigation" className="text-zinc-500 px-2 py-1.5 text-xs font-medium">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/dashboard"))}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/content"))}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Content Studio</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/settings"))}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Group heading="Actions" className="text-zinc-500 px-2 py-1.5 text-xs font-medium mt-2">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/content?new=true"))}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create New Task</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => setShowSenseiChat(true))}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                >
                                    <Zap className="h-4 w-4 text-[#a855f7]" />
                                    <span>Ask Sensei</span>
                                </Command.Item>
                            </Command.Group>

                            {tasks.length > 0 && (
                                <Command.Group heading="Recent Tasks" className="text-zinc-500 px-2 py-1.5 text-xs font-medium mt-2">
                                    {tasks.map(task => (
                                        <Command.Item
                                            key={task.id}
                                            onSelect={() => runCommand(() => router.push(`/content?taskId=${task.id}`))}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer aria-selected:bg-zinc-900 aria-selected:text-[#ccff00]"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>{task.title}</span>
                                            <span className="ml-auto text-xs text-zinc-600">{task.status}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            )}
                        </Command.List>
                    </Command>
                </div>
            )}
        </>
    )
}
