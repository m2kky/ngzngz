-- Fix RLS Recursion by using a SECURITY DEFINER function
-- This allows checking permissions without triggering the RLS policy on the 'roles' table again

CREATE OR REPLACE FUNCTION public.current_user_can_manage_roles(_workspace_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has a role with 'manage' settings permission or is 'Owner'
  -- This query runs with system privileges, bypassing RLS on 'roles' and 'workspace_members'
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members wm
    JOIN roles r ON wm.role_id = r.id
    WHERE wm.user_id = auth.uid()
    AND wm.workspace_id = _workspace_id
    AND (r.name = 'Owner' OR (r.permissions->'settings'->>'manage')::boolean = true)
  );
END;
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can manage roles" ON "public"."roles";

-- Re-create the policy using the secure function
CREATE POLICY "Admins can manage roles" ON "public"."roles"
    FOR ALL USING (
        current_user_can_manage_roles(workspace_id)
    );
