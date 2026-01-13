// Meeting types extension for database.ts
// Add these to the Tables section of Database interface

export interface MeetingRow {
    id: string
    workspace_id: string
    project_id: string | null
    title: string
    start_time: string
    end_time: string
    meeting_link: string | null
    recording_link: string | null
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED'
    summary: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface MeetingAttendeeRow {
    id: string
    meeting_id: string
    user_id: string
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
    created_at: string
}

export interface MeetingNoteRow {
    id: string
    meeting_id: string
    content: string
    author_id: string
    created_at: string
    updated_at: string
}
