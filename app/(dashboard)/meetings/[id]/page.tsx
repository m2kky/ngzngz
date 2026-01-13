"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle, Upload, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { MeetingNotesEditor } from "@/components/meetings/meeting-notes-editor"

export default function MeetingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [meeting, setMeeting] = useState<any>(null)
    const [recordingLink, setRecordingLink] = useState("")
    const [summary, setSummary] = useState("")
    const [loading, setLoading] = useState(true)
    const supabase = createClient() as any

    useEffect(() => {
        if (params.id) {
            fetchMeeting()
        }
    }, [params.id])

    const fetchMeeting = async () => {
        try {
            const { data, error } = await supabase
                .from('meetings')
                .select(`
                    *,
                    project:projects(id, name),
                    attendees:meeting_attendees(
                        user:users(id, full_name, avatar_url)
                    ),
                    notes:meeting_notes(*)
                `)
                .eq('id', params.id)
                .single()

            if (error) throw error
            setMeeting(data)
            setRecordingLink(data.recording_link || "")
            setSummary(data.summary || "")
        } catch (error) {
            console.error('Error fetching meeting:', error)
            toast.error("Failed to load meeting")
        } finally {
            setLoading(false)
        }
    }

    const handleMarkCompleted = async () => {
        try {
            const { error } = await supabase
                .from('meetings')
                .update({ status: 'COMPLETED' })
                .eq('id', params.id)

            if (error) throw error
            toast.success("Meeting marked as completed")
            fetchMeeting()
        } catch (error: any) {
            toast.error(`Failed to update meeting: ${error.message}`)
        }
    }

    const handleSaveRecording = async () => {
        try {
            const { error } = await supabase
                .from('meetings')
                .update({ recording_link: recordingLink })
                .eq('id', params.id)

            if (error) throw error
            toast.success("Recording link saved")
        } catch (error: any) {
            toast.error(`Failed to save recording: ${error.message}`)
        }
    }

    const handleGenerateSummary = () => {
        // Mock AI summary generation
        const mockSummary = `**Meeting Summary**\n\nKey Discussion Points:\n• Project timeline and milestones reviewed\n• Team assigned action items\n• Next steps defined\n\nDecisions Made:\n• Approved new design direction\n• Set deadline for next deliverable\n\nAction Items:\n• Follow up on client feedback\n• Schedule follow-up meeting`

        setSummary(mockSummary)

        // Save to database
        supabase
            .from('meetings')
            .update({ summary: mockSummary })
            .eq('id', params.id)
            .then(() => toast.success("Summary generated!"))
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className=" text-zinc-400">Loading meeting...</div>
            </div>
        )
    }

    if (!meeting) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-zinc-400">Meeting not found</div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <Button
                    onClick={() => router.push('/meetings')}
                    variant="ghost"
                    className="text-zinc-400 hover:text-white mb-4"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Meetings
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{meeting.title}</h1>
                        <div className="flex items-center gap-4 text-zinc-400">
                            <span>{format(new Date(meeting.start_time), 'MMMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>
                                {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                            </span>
                            {meeting.project && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-400">{meeting.project.name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {meeting.status !== 'COMPLETED' && (
                        <Button
                            onClick={handleMarkCompleted}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            <CheckCircle size={16} className="mr-2" />
                            Mark as Completed
                        </Button>
                    )}
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel - Minutes */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Meeting Minutes</h2>
                        <MeetingNotesEditor meetingId={meeting.id as string} />
                    </div>
                </div>

                {/* Right Panel - Assets */}
                <div className="space-y-6">
                    {/* Recording Link */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Recording</h3>
                        <div className="space-y-3">
                            <Input
                                value={recordingLink}
                                onChange={(e) => setRecordingLink(e.target.value)}
                                placeholder="Paste Zoom/Loom/YouTube link..."
                                className="bg-white/5 border-white/20 text-white"
                            />
                            <Button
                                onClick={handleSaveRecording}
                                className="w-full bg-[var(--brand)] text-black hover:opacity-90"
                                size="sm"
                            >
                                Save Link
                            </Button>
                            {recordingLink && (
                                <a
                                    href={recordingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-[var(--brand)] hover:underline"
                                >
                                    Open Recording →
                                </a>
                            )}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Files</h3>
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[var(--brand)]/50 transition-colors cursor-pointer">
                            <Upload size={32} className="mx-auto mb-2 text-zinc-400" />
                            <p className="text-sm text-zinc-400">
                                Drag & drop files here
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                or click to browse
                            </p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                            Upload presentations, documents, or images used in the meeting
                        </p>
                    </div>

                    {/* AI Summary */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">AI Summary</h3>
                            <Button
                                onClick={handleGenerateSummary}
                                size="sm"
                                className="bg-purple-500 hover:bg-purple-600"
                            >
                                <Sparkles size={14} className="mr-1" />
                                Generate
                            </Button>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 min-h-[150px] text-sm text-zinc-300 whitespace-pre-wrap">
                            {summary || "Click 'Generate' to create an AI summary of meeting notes"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
