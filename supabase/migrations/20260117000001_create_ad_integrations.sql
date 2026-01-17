-- Create ad_integrations table
CREATE TABLE IF NOT EXISTS public.ad_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'meta',
  credentials JSONB NOT NULL,
  settings JSONB DEFAULT '{"visibleMetrics": ["spend", "impressions", "results", "cost_per_result", "cpr", "ctr", "cpc", "cpm"]}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ad_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view ad integrations for their workspace"
  ON public.ad_integrations
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ad integrations for their workspace"
  ON public.ad_integrations
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ad integrations for their workspace"
  ON public.ad_integrations
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ad integrations for their workspace"
  ON public.ad_integrations
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );
