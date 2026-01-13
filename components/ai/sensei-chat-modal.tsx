"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Zap, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
    role: "user" | "assistant"
    content: string
}

interface SenseiChatModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SenseiChatModal({ isOpen, onClose }: SenseiChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Yo! Sensei here. What's the move? 🥋" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [isOpen, messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { role: "user" as const, content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            })
            const data = await response.json()

            if (data.response) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }])
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "My bad, I spaced out. Try again?" }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Connection error. WiFi acting sus." }])
        }
        setIsLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-zinc-950 w-full max-w-md h-[600px] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 flex items-center justify-center">
                            <Zap size={16} className="text-[#a855f7]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">Sensei Chat</h3>
                            <p className="text-[10px] text-zinc-400">AI Marketing Assistant</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X size={18} />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                msg.role === "user"
                                    ? "bg-zinc-800 border-zinc-700"
                                    : "bg-[#a855f7]/10 border-[#a855f7]/20"
                            )}>
                                {msg.role === "user" ? <User size={14} /> : <Bot size={14} className="text-[#a855f7]" />}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm",
                                msg.role === "user"
                                    ? "bg-zinc-800 text-white rounded-tr-none"
                                    : "bg-zinc-900/50 text-zinc-200 border border-zinc-800 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0">
                                <Bot size={14} className="text-[#a855f7]" />
                            </div>
                            <div className="bg-zinc-900/50 p-3 rounded-2xl rounded-tl-none border border-zinc-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask Sensei anything..."
                            className="bg-zinc-950 border-zinc-800 focus-visible:ring-[#a855f7]/50"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="bg-[#a855f7] hover:bg-[#9333ea]"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
