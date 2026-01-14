-- Fix RLS policy to allow creators to view their workspaces immediately after creation
-- This is necessary because the initial insert(...).select() happens before the user is added to workspace_members

DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;

CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid() -- Allow creators to view their own workspaces
    OR visibility = 'public'
  );
