-- ============================================
-- DYNAMIC RBAC SYSTEM MIGRATION
-- Created: 2026-01-18
-- Description: Adds custom workspace roles with granular JSONB permissions
-- ============================================

-- ============================================
-- 1. CREATE WORKSPACE_ROLES TABLE
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
  -- Example structure:
  -- {
  --   "tasks": ["view", "create", "edit", "delete"],
  --   "clients": ["view"],
  --   "projects": ["view", "edit"],
  --   "reports": ["view"],
  --   "settings": []
  -- }
  
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

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS update_workspace_roles_updated_at ON workspace_roles;
CREATE TRIGGER update_workspace_roles_updated_at 
  BEFORE UPDATE ON workspace_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. ENABLE RLS
-- ============================================
ALTER TABLE workspace_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES
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
  );

-- Only admins/owners can INSERT new roles
DROP POLICY IF EXISTS "Admins can create roles" ON workspace_roles;
CREATE POLICY "Admins can create roles"
  ON workspace_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Cannot create system roles via API
    (is_system = FALSE OR is_system IS NULL)
    AND workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
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
-- 4. MODIFY USER_ROLES TO SUPPORT CUSTOM ROLES
-- ============================================
ALTER TABLE user_roles 
  ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES workspace_roles(id) ON DELETE SET NULL;

-- ============================================
-- 5. MODIFY INVITATIONS TO SUPPORT CUSTOM ROLES
-- ============================================
ALTER TABLE invitations 
  ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES workspace_roles(id) ON DELETE SET NULL;

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_custom_role ON user_roles(custom_role_id);
CREATE INDEX IF NOT EXISTS idx_workspace_roles_workspace ON workspace_roles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_custom_role ON invitations(custom_role_id);

-- ============================================
-- 7. HELPER FUNCTION: GET USER PERMISSIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID, p_workspace_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_role app_role;
  v_custom_role_id UUID;
  v_permissions JSONB;
BEGIN
  -- Get user's role info
  SELECT role, custom_role_id INTO v_role, v_custom_role_id
  FROM user_roles
  WHERE user_id = p_user_id AND workspace_id = p_workspace_id;
  
  -- Owner/Admin have full permissions (wildcard)
  IF v_role IN ('owner', 'admin') THEN
    RETURN '{"*": ["*"]}'::jsonb;
  END IF;
  
  -- If custom role assigned, use its permissions
  IF v_custom_role_id IS NOT NULL THEN
    SELECT permissions INTO v_permissions
    FROM workspace_roles
    WHERE id = v_custom_role_id;
    RETURN COALESCE(v_permissions, '{}'::jsonb);
  END IF;
  
  -- Fallback: default permissions based on system role
  RETURN CASE v_role
    WHEN 'manager' THEN '{"tasks": ["view", "create", "edit", "delete"], "clients": ["view", "edit"], "projects": ["view", "edit", "create"], "meetings": ["view", "create", "edit"], "reports": ["view"]}'::jsonb
    WHEN 'member' THEN '{"tasks": ["view", "create", "edit"], "clients": ["view"], "projects": ["view"], "meetings": ["view"]}'::jsonb
    WHEN 'viewer' THEN '{"tasks": ["view"], "clients": ["view"], "projects": ["view"], "meetings": ["view"], "reports": ["view"]}'::jsonb
    WHEN 'guest' THEN '{"tasks": ["view"]}'::jsonb
    ELSE '{}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 8. TRIGGER: AUTO-SEED ROLES FOR NEW WORKSPACES
-- ============================================
CREATE OR REPLACE FUNCTION seed_workspace_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_roles (workspace_id, name, slug, is_system, permissions, color) VALUES
    (NEW.id, 'Owner', 'owner', TRUE, '{"*": ["*"]}'::jsonb, '#22c55e'),
    (NEW.id, 'Admin', 'admin', TRUE, '{"*": ["*"]}'::jsonb, '#3b82f6'),
    (NEW.id, 'Member', 'member', TRUE, '{"tasks": ["view", "create", "edit"], "clients": ["view"], "projects": ["view"], "meetings": ["view"]}'::jsonb, '#6366f1');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created_seed_roles ON workspaces;
CREATE TRIGGER on_workspace_created_seed_roles
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION seed_workspace_roles();

-- ============================================
-- 9. SEED SYSTEM ROLES FOR EXISTING WORKSPACES
-- ============================================
INSERT INTO workspace_roles (workspace_id, name, slug, is_system, permissions, color)
SELECT 
  id,
  'Owner',
  'owner',
  TRUE,
  '{"*": ["*"]}'::jsonb,
  '#22c55e'
FROM workspaces
ON CONFLICT (workspace_id, slug) DO NOTHING;

INSERT INTO workspace_roles (workspace_id, name, slug, is_system, permissions, color)
SELECT 
  id,
  'Admin',
  'admin',
  TRUE,
  '{"*": ["*"]}'::jsonb,
  '#3b82f6'
FROM workspaces
ON CONFLICT (workspace_id, slug) DO NOTHING;

INSERT INTO workspace_roles (workspace_id, name, slug, is_system, permissions, color)
SELECT 
  id,
  'Member',
  'member',
  TRUE,
  '{"tasks": ["view", "create", "edit"], "clients": ["view"], "projects": ["view"], "meetings": ["view"]}'::jsonb,
  '#6366f1'
FROM workspaces
ON CONFLICT (workspace_id, slug) DO NOTHING;

-- ============================================
-- 10. GRANT EXECUTE ON FUNCTION
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID, UUID) TO authenticated;
