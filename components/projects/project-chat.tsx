"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { SquadSidebar } from "@/components/chat/squad-sidebar"
import { AIMissionReport } from "@/components/chat/ai-mission-report"
import { analyzeChat } from "@/actions/analyze-chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, SendHorizontal, Menu, Phone, Video, Search, Bot } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@/types/database"

// Mock Data (To be replaced with real DB data later)
const INITIAL_MESSAGES = [
    {
        id: '1',
        sender: 'Sarah',
        avatar: 'https://i.pravatar.cc/150?u=1',
        text: 'System initialized. Ready to collaborate on this project.',
        timestamp: '10:30 AM',
        isMe: false
    }
]

const SQUAD_MEMBERS = [
    { id: '1', name: 'Sarah', role: 'Art Director', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online' as const },
    { id: '2', name: 'Mike', role: 'Copywriter', avatar: 'https://i.pravatar.cc/150?u=2', status: 'offline' as const },
    { id: '3', name: 'Me', role: 'Project Manager', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online' as const },
]

interface ProjectChatProps {
    project: Database["public"]["Tables"]["projects"]["Row"] & {
        clients?: { name: string; logo_url: string | null } | null
    } | null
}

export function ProjectChat({ project }: ProjectChatProps) {
    const params = useParams()
    const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const newMessage = {
            id: Date.now().toString(),
            sender: 'Me',
            avatar: 'https://i.pravatar.cc/150?u=3',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }

        setMessages([...messages, newMessage])
        setInputValue("")

        // Simulate AI Response if mentioned or just for demo
        if (inputValue.toLowerCase().includes('ai') || inputValue.toLowerCase().includes('plan')) {
            setTimeout(() => handleAnalyze(inputValue), 1000)
        }
    }

    const handleAnalyze = async (query: string) => {
        setIsAnalyzing(true)

        try {
            // Mock AI behavior for now, replace with actual call
            // const result = await analyzeChat(query)

            // Simulating AI thinking about the project context
            const aiMessage = {
                id: Date.now().toString(),
                sender: 'Gemini AI',
                type: 'ai',
                content: {
                    summary: `Based on the project "${project?.name}", I suggest focusing on the target audience engagement.`,
                    tasks: [
                        { title: "Research Competitor Campigns", assignee: "Mike" },
                        { title: "Draft Content Strategy", assignee: "Sarah" }
                    ]
                },
                timestamp: 'Now'
            }

            setMessages(prev => [...prev, aiMessage])
            // toast.success("AI Analysis Complete")

        } catch (error) {
            toast.error("Failed to analyze chat")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="flex h-full overflow-hidden bg-zinc-950/50 rounded-xl border border-white/5">
            {/* Sidebar */}
            <SquadSidebar
                projectName={project?.name || "Project"}
                members={SQUAD_MEMBERS}
                onAnalyze={() => handleAnalyze("Analyze all")}
                isAnalyzing={isAnalyzing}
            />

            {/* Main Chat */}
            <main className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden text-zinc-400"><Menu /></div>
                        <div>
                            <h1 className="font-bold text-white text-sm">War Room</h1>
                            <p className="text-[10px] text-green-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-purple-500/20">
                            <Bot className="w-3 h-3" />
                            AI Ready
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {messages.map((msg) => (
                        msg.type === 'ai' ? (
                            <AIMissionReport key={msg.id} summary={msg.content.summary} tasks={msg.content.tasks} workspaceId="00000000-0000-0000-0000-000000000000" />
                        ) : (
                            <ChatBubble key={msg.id} message={msg} />
                        )
                    ))}

                    {isAnalyzing && (
                        <div className="flex justify-center py-4">
                            <div className="bg-purple-500/10 text-purple-400 text-xs px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                                <Bot className="w-3 h-3" />
                                Analyzing strategy...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900/50 border-t border-white/5">
                    <div className="bg-zinc-950 border border-white/10 rounded-xl p-2 flex items-end gap-2 focus-within:border-[#ccff00]/50 transition-colors">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-lg h-10 w-10">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            placeholder={`Message ${project?.name} team...`}
                            className="flex-1 bg-transparent text-white text-sm p-2.5 max-h-32 border-none focus-visible:ring-0 resize-none placeholder-zinc-600"
                            rows={1}
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-[#ccff00] text-black rounded-lg hover:bg-[#b3e600] font-bold h-10 w-10 p-0"
                        >
                            <SendHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
