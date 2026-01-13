-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER', -- 'ADMIN', 'MEMBER'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Users can view members of workspaces they belong to
-- 1. Users can view members of workspaces they belong to
-- Simplified policy to avoid recursion. Users can only see their own membership rows for now.
-- This breaks the loop: workspaces -> function -> workspace_members -> policy -> function...
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
CREATE POLICY "Users can view members of their workspaces" ON workspace_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- 2. Users can join workspaces (for demo purposes, open join or specific logic)
-- For now, let's allow authenticated users to insert themselves (auto-join)
DROP POLICY IF EXISTS "Users can join workspaces" ON workspace_members;
CREATE POLICY "Users can join workspaces" ON workspace_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- 3. Admins can manage members (simplified for now)
DROP POLICY IF EXISTS "Users can update members of their workspaces" ON workspace_members;
CREATE POLICY "Users can update members of their workspaces" ON workspace_members
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove members from their workspaces" ON workspace_members;
CREATE POLICY "Users can remove members from their workspaces" ON workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Insert current user into the first workspace if it exists (Bootstrap)
-- This is a helper block to ensure the current user has access if they created the workspace
DO $$
DECLARE
  v_workspace_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the first workspace
  SELECT id INTO v_workspace_id FROM workspaces LIMIT 1;
  
  -- Get the current user ID (this might not work in SQL Editor if not run as user, 
  -- but useful if run from app. For SQL Editor, user needs to manually insert if needed, 
  -- or we rely on the app's join logic)
  -- v_user_id := auth.uid();
  
  -- IF v_workspace_id IS NOT NULL AND v_user_id IS NOT NULL THEN
  --   INSERT INTO workspace_members (workspace_id, user_id, role)
  --   VALUES (v_workspace_id, v_user_id, 'ADMIN')
  --   ON CONFLICT DO NOTHING;
  -- END IF;
END $$;
