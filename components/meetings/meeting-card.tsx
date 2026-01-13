"use client"

import { format } from "date-fns"
import { Calendar, Clock, Users, ExternalLink, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MeetingCardProps {
    meeting: any
    onUpdate: () => void
}

export function MeetingCard({ meeting, onUpdate }: MeetingCardProps) {
    const attendees = meeting.attendees || []
    const maxAvatars = 5
    const visibleAttendees = attendees.slice(0, maxAvatars)
    const remainingCount = Math.max(0, attendees.length - maxAvatars)

    const isLive = meeting.status === 'LIVE'
    const isCompleted = meeting.status === 'COMPLETED'

    const getStatusColor = () => {
        switch (meeting.status) {
            case 'LIVE':
                return 'bg-green-500'
            case 'COMPLETED':
                return 'bg-zinc-600'
            default:
                return 'bg-blue-500'
        }
    }

    return (
        <Link href={`/meetings/${meeting.id}`}>
            <div className={`glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all cursor-pointer ${isLive ? 'border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border border-white/10'
                }`}>
                {/* Date/Time Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand)]/20 border border-[var(--brand)]/30">
                        <Calendar size={14} className="text-[var(--brand)]" />
                        <span className="text-xs font-bold text-[var(--brand)]">
                            {format(new Date(meeting.start_time), 'MMM dd, yyyy')}
                        </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isLive ? 'animate-pulse' : ''}`} />
                </div>

                {/* Title & Project */}
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {meeting.title}
                </h3>
                {meeting.project && (
                    <div className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        {meeting.project.name}
                    </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <Clock size={14} />
                    <span>
                        {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                    </span>
                </div>

                {/* Attendees */}
                <div className="flex items-center gap-3 mb-4">
                    <Users size={16} className="text-zinc-400" />
                    <div className="flex items-center">
                        {visibleAttendees.map((attendee: any, index: number) => (
                            <img
                                key={attendee.user.id}
                                src={attendee.user.avatar_url || `https://i.pravatar.cc/150?u=${attendee.user.full_name}`}
                                alt={attendee.user.full_name}
                                className="w-8 h-8 rounded-full border-2 border-zinc-900 -ml-2 first:ml-0 object-cover"
                                title={attendee.user.full_name}
                            />
                        ))}
                        {remainingCount > 0 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 -ml-2 flex items-center justify-center text-xs text-white font-bold">
                                +{remainingCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                {!isCompleted && meeting.meeting_link && (
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            window.open(meeting.meeting_link, '_blank')
                        }}
                        className={`w-full ${isLive
                            ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                            : 'bg-[var(--brand)] text-black hover:opacity-90'
                            }`}
                    >
                        <Video size={16} className="mr-2" />
                        {isLive ? 'Join Live Meeting' : 'Join Room'}
                        <ExternalLink size={14} className="ml-2" />
                    </Button>
                )}

                {isCompleted && (
                    <div className="text-center text-sm text-zinc-500">
                        Meeting Completed
                    </div>
                )}
            </div>
        </Link>
    )
}
