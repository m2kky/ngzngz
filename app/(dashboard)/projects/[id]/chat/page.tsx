"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { SquadSidebar } from "@/components/chat/squad-sidebar"
import { AIMissionReport } from "@/components/chat/ai-mission-report"
import { analyzeChat } from "@/actions/analyze-chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, SendHorizontal, Menu, Phone, Video, Search } from "lucide-react"
import { toast } from "sonner"

// Mock Data
const INITIAL_MESSAGES = [
    {
        id: '1',
        sender: 'Sarah',
        avatar: 'https://i.pravatar.cc/150?u=1',
        text: 'يا شباب، العميل لسه باعت فيدباك على الفيديو الأخير. بيقولوا الألوان "كئيبة" ومحتاجين نغير الـ Intro بالكامل. 😤',
        timestamp: '10:30 AM',
        isMe: false
    },
    {
        id: '2',
        sender: 'Mike',
        avatar: 'https://i.pravatar.cc/150?u=2',
        text: 'تاني؟! إحنا لسه مغيرينها امبارح. طيب هما بعتوا أي ريفرانس (Reference) للشكل اللي عايزينه؟',
        timestamp: '10:32 AM',
        isMe: false
    },
    {
        id: '3',
        sender: 'Me',
        avatar: 'https://i.pravatar.cc/150?u=3',
        text: 'مش مشكلة، خلينا ننجز. يا سارة، ابعتيلي ملفات الـ After Effects وأنا هعدل الألوان. ومايك، جهزلي سكريبت جديد للـ Intro يكون "مبهج" أكتر خلال ساعة.',
        timestamp: '10:35 AM',
        isMe: true
    },
    {
        id: '4',
        sender: 'Sarah',
        avatar: 'https://i.pravatar.cc/150?u=1',
        text: 'تمام، هرفع الملفات حالاً على الدرايف. 👍',
        timestamp: '10:36 AM',
        isMe: false
    }
]

const SQUAD_MEMBERS = [
    { id: '1', name: 'Sarah', role: 'Art Director', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online' as const },
    { id: '2', name: 'Mike', role: 'Copywriter', avatar: 'https://i.pravatar.cc/150?u=2', status: 'offline' as const },
    { id: '3', name: 'Me', role: 'Project Manager', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online' as const },
]

export default function WarRoomPage() {
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
    }

    const handleAnalyze = async () => {
        setIsAnalyzing(true)

        // Construct chat history string
        const history = messages
            .filter(m => m.type !== 'ai')
            .map(m => `${m.sender}: ${m.text}`)
            .join('\n')

        try {
            const result = await analyzeChat(history)

            // Add AI response to chat
            const aiMessage = {
                id: Date.now().toString(),
                sender: 'Gemini AI',
                type: 'ai',
                content: result, // { summary, tasks }
                timestamp: 'Now'
            }

            setMessages(prev => [...prev, aiMessage])
            toast.success("Analysis Complete")

        } catch (error) {
            toast.error("Failed to analyze chat")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
            {/* Sidebar */}
            <SquadSidebar
                projectName="Pepsi Campaign"
                members={SQUAD_MEMBERS}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
            />

            {/* Main Chat */}
            <main className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden text-zinc-400"><Menu /></div>
                        <div>
                            <h1 className="font-bold text-white">General Chat</h1>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Encrypted & Secure
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><Search className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><Phone className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white"><Video className="w-4 h-4" /></Button>
                    </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    <div className="flex justify-center">
                        <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-zinc-500">Today, 10:30 AM</span>
                    </div>

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
                                <BotIcon className="w-3 h-3" />
                                Gemini is analyzing the battlefield...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-zinc-900 border-t border-white/5">
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-[#ccff00]/50 transition-colors">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-xl">
                            <Paperclip className="w-5 h-5" />
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
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent text-white text-sm p-3 max-h-32 border-none focus-visible:ring-0 resize-none placeholder-zinc-600"
                            rows={1}
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-[#ccff00] text-black rounded-xl hover:bg-[#b3e600] font-bold shadow-[0_0_10px_rgba(204,255,0,0.2)] transition-all hover:scale-105"
                        >
                            <SendHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}

function BotIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
        </svg>
    )
}
