"use client"

import { useState, useEffect, useRef } from "react"
import { Ghost, X, Send, Minimize2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from '@ai-sdk/react'

interface SenseiWidgetProps {
    toastMessage?: string | null
    onClearToast?: () => void
}

export function SenseiWidget({ toastMessage, onClearToast }: SenseiWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const supabase = createClient()
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Fetch User ID
    useEffect(() => {
        // E2E Test Bypass
        if (typeof window !== 'undefined' && window.localStorage.getItem('e2e-user-id')) {
            setUserId('test-user-id')
            return
        }

        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getUser()
    }, [supabase.auth])

    // Vercel AI SDK useChat Hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { messages, isLoading } = useChat({
        api: '/api/chat',
        body: { userId },
        initialMessages: [
            { id: 'welcome', role: 'assistant', content: "Yo! I'm Sensei. Ask me anything about this tool or marketing. 👻" }
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            console.error("Chat Error:", error)
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isOpen])

    useEffect(() => {
        if (toastMessage && onClearToast) {
            const timer = setTimeout(() => onClearToast(), 5000)
            return () => clearTimeout(timer)
        }
    }, [toastMessage, onClearToast])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input?.trim() || !userId) return

        const userMessage = input
        setInput('')

        // Send message to API
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    userId
                })
            })

            if (!response.ok) {
                const errorData = await response.text()
                console.error('API Error:', response.status, errorData)
                throw new Error(`API error: ${response.status}`)
            }

            // Handle streaming response
            const reader = response.body?.getReader()
            if (!reader) return

            const decoder = new TextDecoder()
            let fullText = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                fullText += decoder.decode(value)
            }
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {!isOpen && toastMessage && (
                <div className="mb-4 bg-zinc-900 border border-[#a855f7] p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] max-w-sm animate-bounce-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]" />
                    <div className="flex items-start gap-3">
                        <div className="bg-[#a855f7] p-1.5 rounded-lg">
                            <Ghost size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[#a855f7] text-xs font-bold uppercase mb-1">Sensei Notification</p>
                            <p className="text-zinc-200 text-sm">{toastMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && (
                <div data-testid="sensei-window" className="mb-4 w-80 h-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#a855f7] p-1 rounded-md">
                                <Ghost size={14} className="text-white" />
                            </div>
                            <span className="font-bold text-white text-sm">Sensei Chat</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-6 w-6 text-zinc-500 hover:text-white"
                        >
                            <Minimize2 size={16} />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4 bg-zinc-950/50">
                        <div className="space-y-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {messages.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "user"
                                            ? "bg-zinc-800 text-white rounded-br-none"
                                            : "bg-[#a855f7]/10 text-zinc-200 border border-[#a855f7]/20 rounded-bl-none"
                                            }`}
                                        data-testid={msg.role === "user" ? "chat-message-user" : undefined}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#a855f7]/10 text-[#a855f7] px-3 py-2 rounded-xl rounded-bl-none text-xs flex gap-1">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>

                    <form onSubmit={onSubmit} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                        <Input
                            value={input ?? ""}
                            onChange={handleInputChange}
                            placeholder="Ask Sensei..."
                            className="flex-1 bg-zinc-950 border-zinc-800 text-xs text-white"
                            data-testid="sensei-input"
                        />
                        <Button type="submit" size="icon" className="bg-[#a855f7] hover:bg-[#9333ea]" disabled={isLoading} data-testid="sensei-send">
                            <Send size={14} />
                        </Button>
                    </form>
                </div>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                data-testid="sensei-trigger"
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${isOpen ? "bg-zinc-800 text-white" : "bg-[#a855f7] text-white"
                    }`}
            >
                {isOpen ? <X size={24} /> : <Ghost className="w-7 h-7" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                    </span>
                )}
            </Button>
        </div>
    )
}
