-- Fix missing tables and RLS policies (task_comments, activity_log)
-- Migration ID: 20250125000000_fix_missing_tables_and_rls

-- 1. Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 2. Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
-- users table is already RLS enabled

-- 4. RLS Policies for users table (Hardening)
-- Remove permissive policy if it exists
DROP POLICY IF EXISTS "Public access for users" ON public.users;

-- Apply strict policies
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;
CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. RLS Policies for task_comments table
DROP POLICY IF EXISTS "Users can view comments in their workspace" ON public.task_comments;
CREATE POLICY "Users can view comments in their workspace"
  ON public.task_comments
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    AND archived_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.task_comments;
CREATE POLICY "Users can create comments"
  ON public.task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
CREATE POLICY "Users can update their own comments"
  ON public.task_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.task_comments;
CREATE POLICY "Users can delete their own comments"
  ON public.task_comments
  FOR UPDATE -- Soft delete via update to archived_at
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. RLS Policies for activity_log table
DROP POLICY IF EXISTS "Users can view activity logs in their workspace" ON public.activity_log;
CREATE POLICY "Users can view activity logs in their workspace"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_log;
CREATE POLICY "Users can create activity logs"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- 7. Grant explicit permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.task_comments TO anon, authenticated;
GRANT SELECT ON public.activity_log TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT INSERT ON public.activity_log TO authenticated;

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_comments_record ON public.task_comments(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_workspace ON public.task_comments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_record ON public.activity_log(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_workspace ON public.activity_log(workspace_id);
