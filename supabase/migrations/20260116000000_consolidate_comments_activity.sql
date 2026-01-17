CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentioned_user_ids uuid[] DEFAULT '{}'::uuid[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  archived_at timestamp with time zone,
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  action_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id)
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments in their workspace" ON public.comments;
CREATE POLICY "Users can view comments in their workspace"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    OR workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid()
      )
      OR workspace_id IN (
        SELECT id FROM public.workspaces
        WHERE created_by = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can soft delete their own comments" ON public.comments;
CREATE POLICY "Users can soft delete their own comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view activity logs in their workspace" ON public.activity_logs;
CREATE POLICY "Users can view activity logs in their workspace"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    OR workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;
CREATE POLICY "Users can create activity logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid()
      )
      OR workspace_id IN (
        SELECT id FROM public.workspaces
        WHERE created_by = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.activity_logs TO anon, authenticated;
GRANT INSERT, UPDATE ON public.comments TO authenticated;
GRANT INSERT ON public.activity_logs TO authenticated;

CREATE INDEX IF NOT EXISTS idx_comments_record ON public.comments(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_comments_workspace ON public.comments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_record ON public.activity_logs(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace ON public.activity_logs(workspace_id);

DO $$
BEGIN
  IF to_regclass('public.task_comments') IS NOT NULL THEN
    INSERT INTO public.comments (
      id,
      workspace_id,
      record_type,
      record_id,
      user_id,
      content,
      created_at,
      updated_at,
      archived_at
    )
    SELECT
      id,
      workspace_id,
      record_type,
      record_id,
      user_id,
      content,
      created_at,
      updated_at,
      archived_at
    FROM public.task_comments
    WHERE workspace_id IS NOT NULL
      AND user_id IS NOT NULL
      AND content IS NOT NULL
    ON CONFLICT (id) DO NOTHING;

    EXECUTE 'DROP TABLE public.task_comments';
  END IF;

  IF to_regclass('public.activity_log') IS NOT NULL THEN
    INSERT INTO public.activity_logs (
      id,
      workspace_id,
      user_id,
      record_type,
      record_id,
      action_type,
      metadata,
      created_at
    )
    SELECT
      id,
      workspace_id,
      user_id,
      record_type,
      record_id,
      action_type,
      metadata,
      created_at
    FROM public.activity_log
    WHERE workspace_id IS NOT NULL
    ON CONFLICT (id) DO NOTHING;

    EXECUTE 'DROP TABLE public.activity_log';
  END IF;
END
$$;
