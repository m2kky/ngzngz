-- Create workspace_invites table
CREATE TABLE IF NOT EXISTS workspace_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role TEXT DEFAULT 'SQUAD_MEMBER' CHECK (role IN ('ADMIN', 'ACCOUNT_MANAGER', 'SQUAD_MEMBER', 'MEDIA_BUYER', 'CLIENT')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED')),
  token TEXT NOT NULL UNIQUE, -- Unique token for the invite link
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Public access policy (for MVP simplicity, refine later)
DROP POLICY IF EXISTS "Public access for workspace_invites" ON workspace_invites;
CREATE POLICY "Public access for workspace_invites" ON workspace_invites FOR ALL USING (true) WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON workspace_invites(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON workspace_invites(token);
