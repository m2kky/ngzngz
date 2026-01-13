"use client"

import { useState, useRef, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface MentionInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function MentionInput({ value, onChange, placeholder, className }: MentionInputProps) {
    const { currentWorkspace } = useWorkspace()
    const [isOpen, setIsOpen] = useState(false)
    const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 })
    const [query, setQuery] = useState("")
    const [mentionIndex, setMentionIndex] = useState(-1)

    // Data
    const [users, setUsers] = useState<any[]>([])

    // Refs
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchUsers()
        }
    }, [currentWorkspace?.id])

    const fetchUsers = async () => {
        const { data } = await supabase.from('users').select('id, full_name, nickname, email, avatar_url').limit(10)
        if (data) setUsers(data)
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const newSelectionStart = e.target.selectionStart
        onChange(newValue)

        // Check for trigger '@'
        const textBeforeCursor = newValue.slice(0, newSelectionStart)
        const lastAt = textBeforeCursor.lastIndexOf('@')

        if (lastAt !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAt + 1)
            // Allow spaces for full names, but stop if we hit a newline or too many chars
            if (!textAfterAt.includes('\n') && textAfterAt.length < 20) {
                setQuery(textAfterAt)
                setMentionIndex(lastAt)

                // Calculate Dropdown Position (Rough Approximation)
                // For a perfect solution we'd use a hidden div mirror, but for MVP:
                // We'll just position it relative to the textarea or similar. 
                // Actually, let's just center it or use a simpler fixed offset for now 
                // because calculating exact caret coordinates in a textarea is complex without a library.
                // We'll trust the Popover to handle basic positioning if we anchor it.
                // But we need to anchor to the caret...
                // Alternative: Use a standard position relative to the input box.
                setIsOpen(true)
                return
            }
        }

        setIsOpen(false)
    }

    const insertMention = (user: any) => {
        if (mentionIndex === -1) return

        const before = value.slice(0, mentionIndex)
        const after = value.slice(inputRef.current?.selectionStart || value.length)
        const mentionText = `{{user:${user.id}}}` // Storing as variable. Or just `@${user.full_name}`

        // Use user friendly name for display effectively? 
        // Typically for automation templates we want ID references or variables.
        // User asked for "@" to show people. If it's for a notification template, it might be text or variables.
        // Let's assume standard text mention for now: `{{user.${user.id}}}` ? 
        // Or simply the name if it's just a message body. 
        // Let's stick to the name for readability in UI, but maybe a special format.
        // "Hello @Sarah" -> "Hello Sarah"

        const newValue = before + `@${user.full_name} ` + after
        onChange(newValue)
        setIsOpen(false)

        // Reset cursor focus
        setTimeout(() => {
            inputRef.current?.focus()
        }, 0)
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        u.nickname?.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="relative" ref={containerRef}>
            <Textarea
                ref={inputRef}
                value={value}
                onChange={handleInput}
                placeholder={placeholder}
                className={cn("min-h-[100px] resize-none bg-zinc-950 border-white/10 focus-visible:ring-[#ccff00]/50", className)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />

            {/* 
               Naive implementation of caret follower:
               Just showing the list below the input when active.
               Improving typical "at mention" requires a library like `react-mentions` or `textarea-caret`.
               For this demo, we'll position it just below the textarea, but only show when 'isOpen'.
            */}

            {isOpen && filteredUsers.length > 0 && (
                <div className="absolute z-50 left-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-950/50">
                        Mention Team Member
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                        {filteredUsers.map(user => (
                            <button
                                key={user.id}
                                onMouseDown={(e) => {
                                    e.preventDefault() // Prevent blur
                                    insertMention(user)
                                }}
                                className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-[#ccff00]/10 hover:text-[#ccff00] transition-colors text-left"
                            >
                                <Avatar className="w-6 h-6 border border-white/10">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback className="text-[10px] bg-zinc-800">{user.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium leading-none">{user.full_name}</div>
                                    <div className="text-[10px] text-zinc-500 mt-0.5">{user.email}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
