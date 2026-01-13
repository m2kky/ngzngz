-- Create Meetings Tables Migration
-- Creates meetings, meeting_attendees, and meeting_notes tables

-- Create meeting status enum
CREATE TYPE meeting_status AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED');

-- Create attendee status enum
CREATE TYPE attendee_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    recording_link TEXT,
    status meeting_status DEFAULT 'SCHEDULED',
    summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status attendee_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Create meeting_notes table
CREATE TABLE IF NOT EXISTS meeting_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_workspace ON meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting ON meeting_notes(meeting_id);

-- Enable RLS on all tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
DROP POLICY IF EXISTS "Users can view meetings in their workspace" ON meetings;
CREATE POLICY "Users can view meetings in their workspace" ON meetings
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create meetings in their workspace" ON meetings;
CREATE POLICY "Users can create meetings in their workspace" ON meetings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update meetings they created" ON meetings;
CREATE POLICY "Users can update meetings they created" ON meetings
    FOR UPDATE USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- RLS Policies for meeting_attendees
DROP POLICY IF EXISTS "Users can view attendees of meetings they can see" ON meeting_attendees;
CREATE POLICY "Users can view attendees of meetings they can see" ON meeting_attendees
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage attendees for meetings they created" ON meeting_attendees;
CREATE POLICY "Users can manage attendees for meetings they created" ON meeting_attendees
    FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for meeting_notes
DROP POLICY IF EXISTS "Users can view notes of meetings they can see" ON meeting_notes;
CREATE POLICY "Users can view notes of meetings they can see" ON meeting_notes
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create notes in meetings they attend" ON meeting_notes;
CREATE POLICY "Users can create notes in meetings they attend" ON meeting_notes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own notes" ON meeting_notes;
CREATE POLICY "Users can update their own notes" ON meeting_notes
    FOR UPDATE USING (author_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE meetings IS 'Stores scheduled and completed meetings';
COMMENT ON TABLE meeting_attendees IS 'Tracks meeting attendees and their RSVP status';
COMMENT ON TABLE meeting_notes IS 'Collaborative notes taken during meetings';
COMMENT ON COLUMN meetings.status IS 'Current status: SCHEDULED, LIVE, or COMPLETED';
COMMENT ON COLUMN meeting_attendees.status IS 'Attendee RSVP: PENDING, ACCEPTED, or DECLINED';
