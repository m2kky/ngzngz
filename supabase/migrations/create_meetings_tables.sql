-- Create Meetings Tables Migration
-- Creates meetings and meeting_attendees tables with improved schema for Record Page Model

-- Create meeting status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE meeting_status AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create attendee status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE attendee_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    meeting_link TEXT,
    recording_link TEXT,
    status meeting_status DEFAULT 'SCHEDULED',
    body_doc JSONB DEFAULT '{}'::jsonb,
    custom_properties JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'ATTENDEE', -- e.g., 'SPEAKER', 'ORGANIZER', 'ATTENDEE'
    speaking_topic TEXT,
    status attendee_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Add meeting_property_definitions to workspaces if it doesn't exist
DO $$ BEGIN
    ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS meeting_property_definitions JSONB DEFAULT '[]'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_workspace ON meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_client ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user ON meeting_attendees(user_id);

-- Enable RLS on all tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
DROP POLICY IF EXISTS "Users can view meetings in their workspace" ON meetings;
CREATE POLICY "Users can view meetings in their workspace" ON meetings
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create meetings in their workspace" ON meetings;
CREATE POLICY "Users can create meetings in their workspace" ON meetings
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update meetings in their workspace" ON meetings;
CREATE POLICY "Users can update meetings in their workspace" ON meetings
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete meetings in their workspace" ON meetings;
CREATE POLICY "Users can delete meetings in their workspace" ON meetings
    FOR DELETE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for meeting_attendees
DROP POLICY IF EXISTS "Users can view attendees of meetings they can see" ON meeting_attendees;
CREATE POLICY "Users can view attendees of meetings they can see" ON meeting_attendees
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM meetings
        )
    );

DROP POLICY IF EXISTS "Users can manage attendees for meetings in their workspace" ON meeting_attendees;
CREATE POLICY "Users can manage attendees for meetings in their workspace" ON meeting_attendees
    FOR ALL USING (
        meeting_id IN (
            SELECT id FROM meetings
        )
    );

-- Comments for documentation
COMMENT ON TABLE meetings IS 'Stores scheduled and completed meetings with Record Page Model support';
COMMENT ON TABLE meeting_attendees IS 'Tracks meeting attendees, their roles, and RSVP status';
COMMENT ON COLUMN meetings.body_doc IS 'Notion-like content blocks for meeting notes and agenda';
COMMENT ON COLUMN meetings.custom_properties IS 'Key-value store for custom meeting properties';
COMMENT ON COLUMN meeting_attendees.role IS 'The role of the user in the meeting (e.g., SPEAKER, ORGANIZER)';
