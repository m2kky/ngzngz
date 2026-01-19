-- ============================================
-- ONBOARDING WIZARD FIX
-- Created: 2026-01-18
-- Purpose: Fix 404 errors during workspace creation
-- ============================================

-- ============================================
-- STEP 1: Create workspace_roles table (MISSING!)
-- ============================================
CREATE TABLE IF NOT EXISTS workspace_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Role Identity
  name TEXT NOT NULL,           -- e.g., "Graphic Designer", "Media Buyer"
  slug TEXT NOT NULL,           -- e.g., "graphic-designer", "media-buyer"
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- For UI display (badge color)
  
  -- Permissions (JSONB)
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- System Flags
  is_system BOOLEAN DEFAULT FALSE, -- Protected roles (owner, admin)
  is_default BOOLEAN DEFAULT FALSE, -- Default role for new members
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(workspace_id, slug)
);

-- Enable RLS on workspace_roles
ALTER TABLE workspace_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: FIX THE SELECT POLICY (CRITICAL!)
-- ============================================
-- The core issue: When a user creates a workspace, they immediately get 
-- a 404 because the SELECT policy requires them to be in workspace_members,
-- but workspace_members entry is created AFTER the workspace INSERT.

DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;

CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    -- ★ FIX: Creator can always see their workspace (fixes 404 on create)
    created_by = auth.uid()
    -- OR user is a member of the workspace
    OR id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    -- OR workspace is public
    OR visibility = 'public'
  );

-- ============================================
-- STEP 3: Ensure INSERT policy is correct
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- STEP 4: RLS Policies for workspace_roles
-- ============================================

-- Everyone in workspace can VIEW roles (needed for UI dropdowns)
DROP POLICY IF EXISTS "Workspace members can view roles" ON workspace_roles;
CREATE POLICY "Workspace members can view roles"
  ON workspace_roles FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    -- Also allow creator to see roles immediately
    OR workspace_id IN (
      SELECT id FROM workspaces WHERE created_by = auth.uid()
    )
  );

-- Only admins/owners can INSERT new roles
DROP POLICY IF EXISTS "Admins can create roles" ON workspace_roles;
CREATE POLICY "Admins can create roles"
  ON workspace_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow system to insert OR workspace admin/owner
    (is_system = FALSE OR is_system IS NULL)
    AND (
      workspace_id IN (
        SELECT workspace_id FROM user_roles
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
      -- Also allow creator
      OR workspace_id IN (
        SELECT id FROM workspaces WHERE created_by = auth.uid()
      )
    )
  );

-- Only admins/owners can UPDATE roles (but not system roles)
DROP POLICY IF EXISTS "Admins can update roles" ON workspace_roles;
CREATE POLICY "Admins can update roles"
  ON workspace_roles FOR UPDATE
  TO authenticated
  USING (
    is_system = FALSE
    AND workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    is_system = FALSE
    AND workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Only admins/owners can DELETE roles (but not system roles)
DROP POLICY IF EXISTS "Admins can delete roles" ON workspace_roles;
CREATE POLICY "Admins can delete roles"
  ON workspace_roles FOR DELETE
  TO authenticated
  USING (
    is_system = FALSE
    AND workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- STEP 5: Create trigger to seed roles (MISSING!)
-- ============================================
CREATE OR REPLACE FUNCTION seed_workspace_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_roles (workspace_id, name, slug, is_system, permissions, color, created_by) VALUES
    (NEW.id, 'Owner', 'owner', TRUE, '{"*": ["*"]}'::jsonb, '#22c55e', NEW.created_by),
    (NEW.id, 'Admin', 'admin', TRUE, '{"*": ["*"]}'::jsonb, '#3b82f6', NEW.created_by),
    (NEW.id, 'Member', 'member', TRUE, '{"tasks": ["view", "create", "edit"], "clients": ["view"], "projects": ["view"], "meetings": ["view"]}'::jsonb, '#6366f1', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created_seed_roles ON workspaces;
CREATE TRIGGER on_workspace_created_seed_roles
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION seed_workspace_roles();

-- ============================================
-- STEP 6: Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workspace_roles_workspace ON workspace_roles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_roles_slug ON workspace_roles(workspace_id, slug);

-- ============================================
-- VERIFICATION: Run this to confirm fixes applied
-- ============================================
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'workspaces' AND schemaname = 'public';
--
-- Expected: SELECT policy should now include "created_by = auth.uid()"
