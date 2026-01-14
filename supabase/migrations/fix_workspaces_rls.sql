-- Enable RLS on workspaces (if not already enabled)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create workspaces
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can view workspaces they are members of
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    OR visibility = 'public'
  );

-- Policy: Workspace owners can update their workspaces
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;
CREATE POLICY "Workspace owners can update workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Policy: Workspace owners can delete their workspaces
DROP POLICY IF EXISTS "Workspace owners can delete workspaces" ON workspaces;
CREATE POLICY "Workspace owners can delete workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
