-- ============================================
-- PART 1: DIAGNOSTIC PROBE
-- Run this to simulate the onboarding failure
-- ============================================
CREATE OR REPLACE FUNCTION debug_onboarding_wizard(
    _user_id UUID,
    _workspace_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER -- CRITICAL: Runs with YOUR permissions to test RLS
AS $$
DECLARE
    v_workspace_id UUID;
    v_member_exists BOOLEAN;
    v_role_exists BOOLEAN;
    v_read_check RECORD;
    v_step TEXT := 'init';
    v_log JSONB := '{}'::jsonb;
BEGIN
    -- 1. Check Table Existence
    v_step := 'check_table';
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workspaces') THEN
        RETURN jsonb_build_object('success', false, 'step', v_step, 'error', 'Table "workspaces" does not exist');
    END IF;

    -- 2. Attempt INSERT (Simulate POST)
    v_step := 'insert_workspace';
    BEGIN
        INSERT INTO workspaces (name, slug, created_by)
        VALUES (
            _workspace_name, 
            lower(regexp_replace(_workspace_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6),
            _user_id
        )
        RETURNING id INTO v_workspace_id;
        
        v_log := v_log || jsonb_build_object('workspace_id', v_workspace_id);
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'step', v_step, 'error', SQLERRM, 'hint', 'Insert failed. Check "Authenticated users can create workspaces" policy.');
    END;

    -- 3. Immediate Visibility Check (The "Select *" after POST)
    v_step := 'read_after_write';
    SELECT * INTO v_read_check FROM workspaces WHERE id = v_workspace_id;
    
    IF v_read_check IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'step', v_step, 
            'error', 'RLS VIOLATION: Inserted row is not visible.',
            'data', v_log,
            'hint', 'The SELECT policy for workspaces must include "OR created_by = auth.uid()".'
        );
    END IF;

    -- 4. Check Trigger Side-Effects (Membership)
    v_step := 'check_membership';
    SELECT EXISTS(SELECT 1 FROM workspace_members WHERE workspace_id = v_workspace_id AND user_id = _user_id)
    INTO v_member_exists;

    -- 5. Check Trigger Side-Effects (Roles)
    v_step := 'check_roles';
    SELECT EXISTS(SELECT 1 FROM user_roles WHERE workspace_id = v_workspace_id AND user_id = _user_id AND role = 'owner')
    INTO v_role_exists;

    RETURN jsonb_build_object(
        'success', true,
        'step', 'complete',
        'data', jsonb_build_object(
            'workspace_id', v_workspace_id,
            'member_created', v_member_exists,
            'role_assigned', v_role_exists
        )
    );
END;
$$;


-- ============================================
-- PART 2: RLS REPAIR SCRIPT
-- Run this to fix the 404 error
-- ============================================

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can view workspaces" ON workspaces;

-- 2. Apply the "Chicken-and-Egg" Safe Policy
CREATE POLICY "Users can view their workspaces"
ON workspaces FOR SELECT
TO authenticated
USING (
    -- Case 1: Standard Access (Existing Member)
    id IN (
        SELECT workspace_id 
        FROM workspace_members 
        WHERE user_id = auth.uid()
        AND status = 'active' -- Optional: Ensure only active members see it
    )
    -- Case 2: Creator Access (The Fix for Onboarding)
    -- Allows you to see the workspace immediately after creating it,
    -- even before the trigger adds you as a member.
    OR created_by = auth.uid()
    -- Case 3: Public Access (Optional)
    OR visibility = 'public'
);

-- 3. Ensure INSERT policy is correct
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
CREATE POLICY "Authenticated users can create workspaces"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (
    -- Ensure users can only create workspaces if they mark themselves as creator
    created_by = auth.uid()
);
