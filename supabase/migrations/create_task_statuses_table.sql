-- Create task_statuses table
CREATE TABLE task_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL, -- Unique identifier for code references if needed
    color TEXT DEFAULT 'bg-zinc-500',
    icon TEXT, -- Emoji or Lucide icon name
    position INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

-- Add RLS policies
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task statuses in their workspace"
    ON task_statuses FOR SELECT
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins/Managers can manage task statuses"
    ON task_statuses FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() 
        AND role IN ('SYSTEM_ADMIN', 'ACCOUNT_MANAGER', 'SQUAD_MEMBER')
    ));

-- Seed default statuses for existing workspaces (Optional, but good for migration)
-- This part is tricky in pure SQL without a function, so we'll handle seeding in the app logic if no statuses exist.
