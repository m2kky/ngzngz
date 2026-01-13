"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { ScheduleMeetingModal } from "@/components/meetings/schedule-meeting-modal"
import { MeetingCard } from "@/components/meetings/meeting-card"

import { useWorkspace } from "@/components/providers/workspace-provider"

export default function MeetingsPage() {
    const { currentWorkspace } = useWorkspace()
    const [meetings, setMeetings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const supabase = createClient() as any

    useEffect(() => {
        if (currentWorkspace) {
            fetchMeetings()
        }
    }, [currentWorkspace])

    const fetchMeetings = async () => {
        if (!currentWorkspace) return

        try {
            const { data, error } = await supabase
                .from('meetings')
                .select(`
                    *,
                    project:projects(id, name),
                    attendees:meeting_attendees(
                        user:users(id, full_name, avatar_url)
                    )
                `)
                .eq('workspace_id', currentWorkspace.id)
                .order('start_time', { ascending: true })

            if (error) throw error
            setMeetings(data || [])
        } catch (error) {
            console.error('Error fetching meetings:', error)
        } finally {
            setLoading(false)
        }
    }

    const upcomingMeetings = meetings.filter(m => m.status !== 'COMPLETED')
    const completedMeetings = meetings.filter(m => m.status === 'COMPLETED')

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div data-tour="meeting-dojo">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <CalendarIcon className="text-[var(--brand)]" size={40} />
                        The Meeting Dojo
                    </h1>
                    <p className="text-zinc-400">
                        Schedule, conduct, and document your team meetings
                    </p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-[var(--brand)] text-black hover:opacity-90 font-bold"
                >
                    <Plus size={20} className="mr-2" />
                    Schedule Meeting
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="glass-panel border-white/10 mb-6">
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-[var(--brand)]/20 data-[state=active]:text-[var(--brand)]">
                        Upcoming ({upcomingMeetings.length})
                    </TabsTrigger>
                    <TabsTrigger value="archives" className="data-[state=active]:bg-[var(--brand)]/20 data-[state=active]:text-[var(--brand)]">
                        Archives ({completedMeetings.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    {loading ? (
                        <div className="text-center py-12 text-zinc-400">Loading meetings...</div>
                    ) : upcomingMeetings.length === 0 ? (
                        <div className="glass-panel p-12 rounded-2xl text-center">
                            <CalendarIcon size={48} className="mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-xl font-bold text-white mb-2">No upcoming meetings</h3>
                            <p className="text-zinc-400 mb-6">Schedule your first meeting to get started</p>
                            <Button
                                onClick={() => setShowModal(true)}
                                className="bg-[var(--brand)] text-black hover:opacity-90"
                            >
                                <Plus size={18} className="mr-2" />
                                Schedule Meeting
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMeetings.map(meeting => (
                                <MeetingCard key={meeting.id} meeting={meeting} onUpdate={fetchMeetings} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="archives">
                    {completedMeetings.length === 0 ? (
                        <div className="glass-panel p-12 rounded-2xl text-center">
                            <h3 className="text-xl font-bold text-white mb-2">No archived meetings</h3>
                            <p className="text-zinc-400">Completed meetings will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedMeetings.map(meeting => (
                                <MeetingCard key={meeting.id} meeting={meeting} onUpdate={fetchMeetings} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Schedule Meeting Modal */}
            <ScheduleMeetingModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false)
                    fetchMeetings()
                }}
            />
        </div>
    )
}
