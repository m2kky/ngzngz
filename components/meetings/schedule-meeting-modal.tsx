"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Calendar, Clock, Link as LinkIcon, Users } from "lucide-react"

interface ScheduleMeetingModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ScheduleMeetingModal({ open, onClose, onSuccess }: ScheduleMeetingModalProps) {
    const [title, setTitle] = useState("")
    const [startDate, setStartDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [duration, setDuration] = useState("60")
    const [meetingLink, setMeetingLink] = useState("")
    const [projectId, setProjectId] = useState<string>("")
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [workspaceId, setWorkspaceId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        // Get workspace
        const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1)
        if (workspaces && workspaces[0]) {
            setWorkspaceId(workspaces[0].id)
        }

        // Get users
        const { data: usersData } = await supabase.from('users').select('id, full_name, avatar_url')
        setUsers(usersData || [])

        // Get projects
        const { data: projectsData } = await supabase.from('projects').select('id, name')
        setProjects(projectsData || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !startDate || !startTime || !workspaceId) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            // Calculate end time
            const startDateTime = new Date(`${startDate}T${startTime}`)
            const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000)

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            // Create meeting
            const { data: meeting, error: meetingError } = await supabase
                .from('meetings')
                .insert({
                    workspace_id: workspaceId,
                    project_id: projectId || null,
                    title,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    meeting_link: meetingLink || null,
                    status: 'SCHEDULED',
                    created_by: user?.id
                })
                .select()
                .single()

            if (meetingError) throw meetingError

            // Add attendees
            if (selectedAttendees.length > 0 && meeting) {
                const attendeeRecords = selectedAttendees.map(userId => ({
                    meeting_id: meeting.id,
                    user_id: userId,
                    status: 'PENDING'
                }))

                const { error: attendeeError } = await supabase
                    .from('meeting_attendees')
                    .insert(attendeeRecords)

                if (attendeeError) console.error('Error adding attendees:', attendeeError)
            }

            toast.success("Meeting scheduled successfully!")
            resetForm()
            onSuccess()
        } catch (error: any) {
            console.error('Error scheduling meeting:', error)
            toast.error(`Failed to schedule meeting: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setTitle("")
        setStartDate("")
        setStartTime("")
        setDuration("60")
        setMeetingLink("")
        setProjectId("")
        setSelectedAttendees([])
    }

    const toggleAttendee = (userId: string) => {
        setSelectedAttendees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-panel border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Schedule Meeting</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-white">Meeting Title *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Weekly Team Sync"
                            className="bg-white/5 border-white/20 text-white"
                            required
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white flex items-center gap-2">
                                <Calendar size={16} />
                                Date *
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white/5 border-white/20 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white flex items-center gap-2">
                                <Clock size={16} />
                                Time *
                            </Label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-white/5 border-white/20 text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label className="text-white">Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-white/20">
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Meeting Link */}
                    <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                            <LinkIcon size={16} />
                            Meeting Link (Zoom, Meet, etc.)
                        </Label>
                        <Input
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://zoom.us/j/..."
                            className="bg-white/5 border-white/20 text-white"
                        />
                    </div>

                    {/* Project */}
                    <div className="space-y-2">
                        <Label className="text-white">Link to Project (Optional)</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-white/20">
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Attendees */}
                    <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                            <Users size={16} />
                            Attendees ({selectedAttendees.length} selected)
                        </Label>
                        <div className="glass-panel p-4 rounded-xl max-h-48 overflow-y-auto space-y-2">
                            {users.map(user => (
                                <label
                                    key={user.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAttendees.includes(user.id)}
                                        onChange={() => toggleAttendee(user.id)}
                                        className="w-4 h-4"
                                    />
                                    <img
                                        src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.full_name}`}
                                        alt={user.full_name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-white">{user.full_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[var(--brand)] text-black hover:opacity-90 font-bold"
                        >
                            {loading ? "Scheduling..." : "Schedule Meeting"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
