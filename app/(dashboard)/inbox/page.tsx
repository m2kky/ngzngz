"use client"

import { useState } from "react"
import { Bell, CheckCircle2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InboxPage() {
    // Placeholder state for notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "New Task Assigned",
            message: "Alex assigned you to 'Design Homepage Hero'",
            time: "2 mins ago",
            read: false,
            type: "assignment"
        },
        {
            id: 2,
            title: "Project Update",
            message: "Project 'Alpha' status changed to 'In Progress'",
            time: "1 hour ago",
            read: false,
            type: "update"
        },
        {
            id: 3,
            title: "Mentioned in Comment",
            message: "Sarah mentioned you: '@kai check this out'",
            time: "3 hours ago",
            read: true,
            type: "mention"
        }
    ])

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    return (
        <div className="min-h-screen flex flex-col font-sans text-zinc-200">
            {/* Header */}
            <header className="mx-6 mt-6 mb-8 rounded-3xl glass-panel liquid-gloss flex items-center justify-between px-6 py-4 sticky top-6 z-40">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <span className="text-[#ccff00]">INBOX</span>
                        <span className="text-white">ZERO</span>
                    </h1>
                    <div className="h-6 w-px bg-white/10" />
                    <span className="text-sm text-zinc-400 font-medium">
                        {notifications.filter(n => !n.read).length} Unread
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={markAllRead}
                        className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark all read
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 pb-6 max-w-4xl mx-auto w-full">
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                             <Inbox className="w-16 h-16 mb-4 opacity-20" />
                             <p className="text-lg font-medium">All caught up!</p>
                             <p className="text-sm">No new notifications.</p>
                         </div>
                    ) : (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`
                                    relative p-6 rounded-2xl border transition-all duration-300 group
                                    ${notification.read 
                                        ? 'bg-black/20 border-white/5' 
                                        : 'glass-card border-[var(--brand)]/30 bg-[var(--brand)]/5'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`
                                            p-3 rounded-full flex items-center justify-center shrink-0
                                            ${notification.read ? 'bg-zinc-800/50 text-zinc-500' : 'bg-[var(--brand)]/10 text-[var(--brand)]'}
                                        `}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold mb-1 ${notification.read ? 'text-zinc-400' : 'text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm">{notification.message}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-600 font-mono mt-1">{notification.time}</span>
                                </div>
                                {!notification.read && (
                                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
