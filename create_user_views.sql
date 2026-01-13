-- Create user_views table
CREATE TABLE IF NOT EXISTS user_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_name VARCHAR(255) NOT NULL,
    view_type TEXT NOT NULL CHECK (view_type IN ('KANBAN', 'TABLE', 'CALENDAR', 'LIST', 'TIMELINE', 'FEED')),
    view_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view views in their workspace" ON user_views;
DROP POLICY IF EXISTS "Users can create views in their workspace" ON user_views;
DROP POLICY IF EXISTS "Users can update their own views" ON user_views;
DROP POLICY IF EXISTS "Users can delete their own views" ON user_views;

-- Policy: Users can view views in their workspace (Members OR Creators)
CREATE POLICY "Users can view views in their workspace" ON user_views
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
            UNION
            SELECT id FROM workspaces WHERE created_by = auth.uid()
        )
    );

-- Policy: Users can create views in their workspace (Members OR Creators)
CREATE POLICY "Users can create views in their workspace" ON user_views
    FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
            UNION
            SELECT id FROM workspaces WHERE created_by = auth.uid()
        )
    );

-- Policy: Users can update their own views
CREATE POLICY "Users can update their own views" ON user_views
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

-- Policy: Users can delete their own views
CREATE POLICY "Users can delete their own views" ON user_views
    FOR DELETE
    USING (
        user_id = auth.uid()
    );
