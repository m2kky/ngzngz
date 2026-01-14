-- 1. Create app_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, workspace_id)
);

-- 3. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Migrate data from workspace_members to user_roles
INSERT INTO user_roles (user_id, workspace_id, role)
SELECT 
    user_id, 
    workspace_id, 
    CASE 
        WHEN role::text = ANY(ARRAY['owner', 'admin', 'manager', 'member', 'viewer', 'guest']) THEN role::text::app_role
        ELSE 'member'::app_role -- Fallback for legacy roles
    END
FROM workspace_members
WHERE role IS NOT NULL
ON CONFLICT (user_id, workspace_id) DO UPDATE SET role = EXCLUDED.role;

-- 5. Drop dependent policies BEFORE dropping columns
-- Dropping policies on workspaces (dependent on workspace_members.role)
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspaces" ON workspaces;

-- Dropping policies on workspace_join_requests (dependent on workspace_members.role)
-- Ensure table exists/enabled just in case
ALTER TABLE workspace_join_requests ENABLE ROW LEVEL SECURITY; 
DROP POLICY IF EXISTS "Workspace admins can view join requests" ON workspace_join_requests;
DROP POLICY IF EXISTS "Workspace admins can update join requests" ON workspace_join_requests;

-- 6. Drop legacy columns from workspace_members
ALTER TABLE workspace_members DROP COLUMN IF EXISTS role;
ALTER TABLE workspace_members DROP COLUMN IF EXISTS access_scope;

-- 7. Add visibility to workspaces if missing (already exists but good for idempotency)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));

-- 8. Apply/Re-apply RLS Policies using user_roles

-- WORKSPACES
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    OR visibility = 'public'
  );

CREATE POLICY "Workspace owners can update workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Workspace owners can delete workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- WORKSPACE JOIN REQUESTS
-- Re-create policies using user_roles
CREATE POLICY "Workspace admins can view join requests"
  ON workspace_join_requests FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can update join requests"
  ON workspace_join_requests FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- USER_ROLES
-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Workspace admins/owners can view roles in their workspace
DROP POLICY IF EXISTS "Admins can view workspace roles" ON user_roles;
CREATE POLICY "Admins can view workspace roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners can manage roles" ON user_roles;
CREATE POLICY "Owners can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
