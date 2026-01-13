-- Create Integrations Table Migration
-- Stores API credentials for external ad platforms (Meta, TikTok, Google)

-- Create platform enum
CREATE TYPE integration_platform AS ENUM ('META', 'TIKTOK', 'GOOGLE');

-- Create status enum
CREATE TYPE integration_status AS ENUM ('ACTIVE', 'ERROR', 'DISCONNECTED');

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    platform integration_platform NOT NULL,
    access_token TEXT NOT NULL,
    ad_account_id TEXT NOT NULL,
    status integration_status DEFAULT 'ACTIVE',
    last_synced_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, platform, ad_account_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view integrations in their workspace" ON integrations;
CREATE POLICY "Users can view integrations in their workspace" ON integrations
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create integrations in their workspace" ON integrations;
CREATE POLICY "Users can create integrations in their workspace" ON integrations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update integrations in their workspace" ON integrations;
CREATE POLICY "Users can update integrations in their workspace" ON integrations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete integrations in their workspace" ON integrations;
CREATE POLICY "Users can delete integrations in their workspace" ON integrations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comments
COMMENT ON TABLE integrations IS 'Stores API credentials for external ad platform integrations';
COMMENT ON COLUMN integrations.access_token IS 'Platform API access token (consider encryption for production)';
COMMENT ON COLUMN integrations.ad_account_id IS 'Platform-specific ad account identifier';
COMMENT ON COLUMN integrations.status IS 'Connection status: ACTIVE, ERROR, or DISCONNECTED';
COMMENT ON COLUMN integrations.last_synced_at IS 'Timestamp of last successful data sync';
