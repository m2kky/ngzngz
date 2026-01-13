import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatBubbleProps {
    message: {
        id: string
        sender: string
        avatar?: string
        text: string
        timestamp: string
        isMe?: boolean
        type?: 'text' | 'ai'
    }
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isMe = message.isMe

    if (message.type === 'ai') {
        return null // AI messages are handled by AIMissionReport
    }

    return (
        <div className={cn("flex gap-4 group", isMe && "flex-row-reverse")}>
            <Avatar className="w-10 h-10 border border-white/10 mt-1">
                <AvatarImage src={message.avatar} />
                <AvatarFallback>{message.sender[0]}</AvatarFallback>
            </Avatar>

            <div className={cn("max-w-[70%]", isMe && "items-end")}>
                <div className={cn("flex items-baseline gap-2 mb-1", isMe && "flex-row-reverse")}>
                    <span className={cn("text-sm font-bold", isMe ? "text-[#ccff00]" : "text-white")}>
                        {message.sender}
                    </span>
                    <span className="text-xs text-zinc-500">{message.timestamp}</span>
                </div>

                <div className={cn(
                    "p-4 text-sm leading-relaxed shadow-sm",
                    isMe
                        ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#eeffcc] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                        : "bg-white/5 border border-white/5 text-zinc-300 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl"
                )}>
                    {message.text}
                </div>
            </div>
        </div>
    )
}
