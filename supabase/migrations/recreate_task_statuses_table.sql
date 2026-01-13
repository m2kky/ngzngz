    -- Recreate task_statuses table to ensure correct schema and policies
    DROP TABLE IF EXISTS task_statuses;

    CREATE TABLE task_statuses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        color TEXT DEFAULT 'bg-zinc-500',
        icon TEXT,
        position INTEGER DEFAULT 0,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(workspace_id, slug)
    );

    -- Enable RLS
    ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;

    -- Policy: Users can view statuses in their workspace
    CREATE POLICY "Users can view task statuses"
        ON task_statuses FOR SELECT
        USING (
            workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
            )
            OR
            workspace_id IN (
                SELECT id FROM workspaces WHERE created_by = auth.uid()
            )
        );

    -- Policy: Admins/Managers/Owners can manage statuses
    CREATE POLICY "Admins and Owners can manage task statuses"
        ON task_statuses FOR ALL
        USING (
            workspace_id IN (
                SELECT workspace_id FROM workspace_members 
                WHERE user_id = auth.uid() 
                AND role IN ('SYSTEM_ADMIN', 'ACCOUNT_MANAGER', 'SQUAD_MEMBER')
            )
            OR
            workspace_id IN (
                SELECT id FROM workspaces WHERE created_by = auth.uid()
            )
        );
