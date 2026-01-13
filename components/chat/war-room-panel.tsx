"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { AIMissionReport } from "@/components/chat/ai-mission-report"
import { analyzeChat } from "@/actions/analyze-chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, SendHorizontal, MessageSquare, X, Users, Sparkles, Minimize2, Maximize2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspace } from "@/components/providers/workspace-provider"

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

export function WarRoomPanel() {
    const { currentWorkspace } = useWorkspace()
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

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

        const history = messages
            .filter(m => m.type !== 'ai')
            .map(m => `${m.sender}: ${m.text}`)
            .join('\n')

        try {
            const result = await analyzeChat(history)

            const aiMessage = {
                id: Date.now().toString(),
                sender: 'Gemini AI',
                type: 'ai',
                content: result,
                timestamp: 'Now'
            }

            setMessages(prev => [...prev, aiMessage])
            toast.success("Mission Report Generated")

        } catch (error) {
            toast.error("Failed to analyze chat")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <>
            {/* Trigger Button (Floating) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-24 z-50"
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setIsOpen(true)}
                                        className="w-14 h-14 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center transition-transform hover:scale-110"
                                    >
                                        <MessageSquare className="w-6 h-6 fill-black" />
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-zinc-950" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Open War Room</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Side Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed right-0 top-0 h-screen bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl",
                            isExpanded ? "w-[600px]" : "w-[400px]"
                        )}
                    >
                        {/* Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <div>
                                    <h2 className="font-bold text-white text-sm">Pepsi Campaign</h2>
                                    <p className="text-[10px] text-zinc-400">War Room Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className={cn("text-purple-400 hover:text-purple-300 hover:bg-purple-500/10", isAnalyzing && "animate-pulse")}
                                    title="Analyze with Gemini"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                    <Users className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Squad Avatars (Mini Header) */}
                        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {SQUAD_MEMBERS.map(member => (
                                <TooltipProvider key={member.id}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="relative">
                                                <img src={member.avatar} className="w-8 h-8 rounded-full border border-white/10 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                                                {member.status === 'online' && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-zinc-900" />}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{member.name} ({member.role})</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((msg) => (
                                msg.type === 'ai' ? (
                                    <AIMissionReport
                                        key={msg.id}
                                        summary={msg.content.summary}
                                        tasks={msg.content.tasks as any}
                                        workspaceId={currentWorkspace?.id || '00000000-0000-0000-0000-000000000000'}
                                    />
                                ) : (
                                    // @ts-expect-error - Build implies props mismatch despite interface matching
                                    <ChatBubble key={msg.id} message={msg} />
                                )
                            ))}
                            {isAnalyzing && (
                                <div className="flex justify-center py-4">
                                    <div className="bg-purple-500/10 text-purple-400 text-[10px] px-3 py-1 rounded-full flex items-center gap-2 animate-pulse border border-purple-500/20">
                                        <Sparkles className="w-3 h-3" />
                                        Gemini is analyzing...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-zinc-900 border-t border-white/10">
                            <div className="bg-zinc-950 border border-white/10 rounded-xl p-2 flex items-end gap-2 focus-within:border-[#ccff00]/50 transition-colors">
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-8 w-8">
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
                                    placeholder="Type message..."
                                    className="flex-1 bg-transparent text-white text-sm p-1.5 max-h-24 border-none focus-visible:ring-0 resize-none placeholder-zinc-600 min-h-[40px]"
                                    rows={1}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    size="icon"
                                    className="bg-[#ccff00] text-black hover:bg-[#b3e600] h-8 w-8 rounded-lg"
                                >
                                    <SendHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
