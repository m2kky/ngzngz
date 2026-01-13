-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    public_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    slides_config JSONB DEFAULT '[]'::jsonb,
    ai_summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_public_token ON reports(public_token);
CREATE INDEX idx_reports_status ON reports(status);

-- Create report_feedback table for client ratings
CREATE TABLE IF NOT EXISTS report_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    rating TEXT CHECK (rating IN ('GREAT', 'GOOD', 'NEUTRAL', 'BAD')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_feedback_report_id ON report_feedback(report_id);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_feedback ENABLE ROW LEVEL SECURITY;

-- Reports: Users can view reports in their workspace
CREATE POLICY "Users can view reports in their workspace"
    ON reports FOR SELECT
    USING (workspace_id IN (
        SELECT workspace_id FROM squads WHERE user_id = auth.uid()
    ));

-- Reports: Users can create reports in their workspace
CREATE POLICY "Users can create reports in their workspace"
    ON reports FOR INSERT
    WITH CHECK (workspace_id IN (
        SELECT workspace_id FROM squads WHERE user_id = auth.uid()
    ));

-- Reports: Users can update reports in their workspace
CREATE POLICY "Users can update reports in their workspace"
    ON reports FOR UPDATE
    USING (workspace_id IN (
        SELECT workspace_id FROM squads WHERE user_id = auth.uid()
    ));

-- Reports: Users can delete reports in their workspace
CREATE POLICY "Users can delete reports in their workspace"
    ON reports FOR DELETE
    USING (workspace_id IN (
        SELECT workspace_id FROM squads WHERE user_id = auth.uid()
    ));

-- Report Feedback: Anyone can insert feedback (public access)
CREATE POLICY "Anyone can submit feedback"
    ON report_feedback FOR INSERT
    WITH CHECK (true);

-- Report Feedback: Users can view feedback for their workspace reports
CREATE POLICY "Users can view feedback for their reports"
    ON report_feedback FOR SELECT
    USING (report_id IN (
        SELECT id FROM reports WHERE workspace_id IN (
            SELECT workspace_id FROM squads WHERE user_id = auth.uid()
        )
    ));

-- Update trigger
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();
