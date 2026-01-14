-- Add visibility and created_by columns to workspaces
ALTER TABLE workspaces 
  ADD COLUMN IF NOT EXISTS visibility TEXT 
  CHECK (visibility IN ('private', 'public')) 
  DEFAULT 'private';

ALTER TABLE workspaces 
  ADD COLUMN IF NOT EXISTS created_by UUID 
  REFERENCES users(id) ON DELETE SET NULL;

-- Create workspace_join_requests table for private workspaces
CREATE TABLE IF NOT EXISTS workspace_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE workspace_join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for join requests
DROP POLICY IF EXISTS "Users can view their own join requests" ON workspace_join_requests;
CREATE POLICY "Users can view their own join requests"
  ON workspace_join_requests FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace admins can view join requests" ON workspace_join_requests;
CREATE POLICY "Workspace admins can view join requests"
  ON workspace_join_requests FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can create join requests" ON workspace_join_requests;
CREATE POLICY "Users can create join requests"
  ON workspace_join_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace admins can update join requests" ON workspace_join_requests;
CREATE POLICY "Workspace admins can update join requests"
  ON workspace_join_requests FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workspace_join_requests_workspace_id ON workspace_join_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_join_requests_user_id ON workspace_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_join_requests_status ON workspace_join_requests(status);
