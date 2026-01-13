-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Core Strategy Data
  situation JSONB DEFAULT '{}'::jsonb, -- SWOT, UVP, Competitors
  strategy JSONB DEFAULT '{}'::jsonb, -- Core Messaging, Channels
  tactics JSONB DEFAULT '[]'::jsonb, -- Action Plan
  
  status TEXT DEFAULT 'DRAFT', -- DRAFT, ACTIVE, ARCHIVED
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Policy for workspace members
DROP POLICY IF EXISTS "Workspace members can manage strategies" ON strategies;
CREATE POLICY "Workspace members can manage strategies" ON strategies 
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_strategies_workspace_id ON strategies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_strategies_client_id ON strategies(client_id);
