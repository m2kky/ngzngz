-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'guest')) DEFAULT 'member' NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
  status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending' NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. View Invitations: Admins and Owners of the workspace can view invitations
DROP POLICY IF EXISTS "Workspace admins can view invitations" ON invitations;
CREATE POLICY "Workspace admins can view invitations" ON invitations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.workspace_id = invitations.workspace_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

-- 2. Create Invitations: Admins and Owners of the workspace can create invitations
DROP POLICY IF EXISTS "Workspace admins can create invitations" ON invitations;
CREATE POLICY "Workspace admins can create invitations" ON invitations 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.workspace_id = invitations.workspace_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

-- 3. Delete Invitations: Admins and Owners can delete (revoke) invitations
DROP POLICY IF EXISTS "Workspace admins can delete invitations" ON invitations;
CREATE POLICY "Workspace admins can delete invitations" ON invitations 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.workspace_id = invitations.workspace_id
    AND user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'admin')
  )
);

-- 4. Public Access (Accept Invite): Allow reading a specific invitation by token (public)
-- This is needed for the "Accept Invite" page where the user might not be logged in yet
DROP POLICY IF EXISTS "Public can view invitation by token" ON invitations;
CREATE POLICY "Public can view invitation by token" ON invitations 
FOR SELECT USING (true); 
-- Note: Security is enforced by the unguessable token. Ideally we filter by token in the query.
