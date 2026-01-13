-- Create invitations table for the Gateway System
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('ADMIN', 'ACCOUNT_MANAGER', 'SQUAD_MEMBER', 'MEDIA_BUYER', 'CLIENT')) DEFAULT 'SQUAD_MEMBER',
  token TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED')) DEFAULT 'PENDING',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policy for workspace members to manage invitations
DROP POLICY IF EXISTS "Workspace members can manage invitations" ON invitations;
CREATE POLICY "Workspace members can manage invitations" ON invitations 
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Public policy for accepting invitations (by token)
DROP POLICY IF EXISTS "Public can view invitations by token" ON invitations;
CREATE POLICY "Public can view invitations by token" ON invitations 
FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Update workspace_members table to include the new roles
ALTER TABLE workspace_members DROP CONSTRAINT IF EXISTS workspace_members_role_check;
ALTER TABLE workspace_members ADD CONSTRAINT workspace_members_role_check 
CHECK (role IN ('ADMIN', 'ACCOUNT_MANAGER', 'SQUAD_MEMBER', 'MEDIA_BUYER', 'CLIENT'));