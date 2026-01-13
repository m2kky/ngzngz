"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, Info, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Notification {
    id: string
    type: "success" | "info" | "warning"
    title: string
    message: string
    timestamp: Date
    read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "success",
        title: "Task Approved",
        message: "Your task 'TikTok: Viral Dance Challenge' has been approved by the client! 🎉",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
    },
    {
        id: "2",
        type: "info",
        title: "New Task Assigned",
        message: "You've been assigned to 'IG Reel: Behind the Scenes'",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
    },
    {
        id: "3",
        type: "warning",
        title: "Deadline Approaching",
        message: "Task 'LinkedIn: Thought Leadership' is due in 2 days",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: true,
    },
    {
        id: "4",
        type: "success",
        title: "XP Earned",
        message: "You earned 50 XP for completing a task! Level up soon! ⚡",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
    },
]

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
    const [filter, setFilter] = useState<"all" | "unread">("all")

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((n) => n.id !== id))
    }

    const filteredNotifications =
        filter === "unread" ? notifications.filter((n) => !n.read) : notifications

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle size={20} className="text-[#ccff00]" />
            case "info":
                return <Info size={20} className="text-blue-400" />
            case "warning":
                return <AlertCircle size={20} className="text-orange-400" />
        }
    }

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

        if (seconds < 60) return "Just now"
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        return `${Math.floor(seconds / 86400)}d ago`
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
                    <p className="text-zinc-400">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter("all")}
                            className={filter === "all" ? "bg-zinc-800" : ""}
                        >
                            All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter("unread")}
                            className={filter === "unread" ? "bg-zinc-800" : ""}
                        >
                            Unread
                        </Button>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            className="bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                        <Bell size={48} className="mx-auto mb-4 text-zinc-600" />
                        <h3 className="text-lg font-bold text-white mb-2">No notifications</h3>
                        <p className="text-zinc-500">You're all caught up! 🎉</p>
                    </Card>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <div key={notification.id}>
                            <Card
                                className={`bg-zinc-900 border-zinc-800 p-4 cursor-pointer transition-all hover:bg-zinc-800 ${!notification.read ? "border-l-4 border-l-[#ccff00]" : ""
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(notification.type)}</div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white">{notification.title}</h3>
                                            <span className="text-xs text-zinc-500">{getTimeAgo(notification.timestamp)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400">{notification.message}</p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                        }}
                                        className="text-zinc-500 hover:text-red-400 h-8 w-8"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            </Card>
                            {index < filteredNotifications.length - 1 && <Separator className="my-2 bg-zinc-900" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
