-- ============================================
-- ONBOARDING WIZARD DIAGNOSTIC FUNCTION
-- Created: 2026-01-18
-- Purpose: Diagnose 404 errors during workspace creation
-- 
-- NOTE: This is the DIAGNOSTIC FUNCTION only.
-- For the ACTUAL FIX, run: fix_onboarding_wizard_404.sql
-- ============================================

-- ============================================
-- PART 1: THE DIAGNOSTIC FUNCTION (The "Probe")
-- ============================================
CREATE OR REPLACE FUNCTION debug_onboarding_wizard(
  _user_id UUID,
  _workspace_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_workspace_id UUID;
  v_step TEXT := 'init';
  v_error TEXT;
  v_data JSONB;
  v_table_exists BOOLEAN;
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- ============================================
  -- STEP 1: Check if workspaces table exists
  -- ============================================
  v_step := 'check_workspaces_table';
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspaces'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'CRITICAL: workspaces table does NOT exist!',
      'data', NULL
    );
  END IF;
  
  -- Check RLS status
  SELECT relrowsecurity INTO v_rls_enabled
  FROM pg_class 
  WHERE relname = 'workspaces' AND relnamespace = 'public'::regnamespace;
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename = 'workspaces' AND schemaname = 'public';
  
  v_data := jsonb_build_object(
    'table_exists', TRUE,
    'rls_enabled', v_rls_enabled,
    'policy_count', v_policy_count
  );
  
  -- ============================================
  -- STEP 2: Check workspace_members table
  -- ============================================
  v_step := 'check_workspace_members_table';
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspace_members'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'CRITICAL: workspace_members table does NOT exist!',
      'data', v_data
    );
  END IF;
  
  v_data := v_data || jsonb_build_object('workspace_members_exists', TRUE);
  
  -- ============================================
  -- STEP 3: Check user_roles table
  -- ============================================
  v_step := 'check_user_roles_table';
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'CRITICAL: user_roles table does NOT exist!',
      'data', v_data
    );
  END IF;
  
  v_data := v_data || jsonb_build_object('user_roles_exists', TRUE);
  
  -- ============================================
  -- STEP 4: Check workspace_roles table
  -- ============================================
  v_step := 'check_workspace_roles_table';
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspace_roles'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'WARNING: workspace_roles table does NOT exist (optional, but recommended)',
      'data', v_data
    );
  END IF;
  
  v_data := v_data || jsonb_build_object('workspace_roles_exists', TRUE);
  
  -- ============================================
  -- STEP 5: Check RLS policies on workspaces
  -- ============================================
  v_step := 'check_rls_policies';
  
  SELECT jsonb_agg(jsonb_build_object(
    'policy_name', policyname,
    'command', cmd,
    'roles', roles,
    'qual', qual,
    'with_check', with_check
  )) INTO v_data
  FROM pg_policies 
  WHERE tablename = 'workspaces' AND schemaname = 'public';
  
  IF v_data IS NULL OR jsonb_array_length(v_data) = 0 THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'CRITICAL: No RLS policies found on workspaces table!',
      'data', jsonb_build_object('policies', '[]')
    );
  END IF;
  
  -- ============================================
  -- STEP 6: Attempt INSERT into workspaces
  -- ============================================
  v_step := 'insert_workspace';
  BEGIN
    INSERT INTO workspaces (name, created_by, visibility)
    VALUES (_workspace_name, _user_id, 'private')
    RETURNING id INTO v_workspace_id;
    
    v_data := jsonb_build_object('workspace_id', v_workspace_id);
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'INSERT into workspaces failed: ' || SQLERRM,
      'data', jsonb_build_object('sqlstate', SQLSTATE)
    );
  END;
  
  -- ============================================
  -- STEP 7: Attempt INSERT into workspace_members
  -- ============================================
  v_step := 'insert_workspace_member';
  BEGIN
    INSERT INTO workspace_members (workspace_id, user_id, joined_at)
    VALUES (v_workspace_id, _user_id, NOW());
    
    v_data := v_data || jsonb_build_object('workspace_member_created', TRUE);
  EXCEPTION WHEN OTHERS THEN
    -- Cleanup
    DELETE FROM workspaces WHERE id = v_workspace_id;
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'INSERT into workspace_members failed: ' || SQLERRM,
      'data', jsonb_build_object('sqlstate', SQLSTATE, 'workspace_id', v_workspace_id)
    );
  END;
  
  -- ============================================
  -- STEP 8: Attempt INSERT into user_roles (Owner)
  -- ============================================
  v_step := 'insert_user_role';
  BEGIN
    INSERT INTO user_roles (user_id, workspace_id, role)
    VALUES (_user_id, v_workspace_id, 'owner'::app_role);
    
    v_data := v_data || jsonb_build_object('user_role_created', TRUE);
  EXCEPTION WHEN OTHERS THEN
    -- Cleanup
    DELETE FROM workspace_members WHERE workspace_id = v_workspace_id;
    DELETE FROM workspaces WHERE id = v_workspace_id;
    RETURN jsonb_build_object(
      'success', FALSE,
      'step', v_step,
      'error', 'INSERT into user_roles failed: ' || SQLERRM,
      'data', jsonb_build_object('sqlstate', SQLSTATE, 'workspace_id', v_workspace_id)
    );
  END;
  
  -- ============================================
  -- STEP 9: Check if workspace_roles were seeded by trigger
  -- ============================================
  v_step := 'verify_workspace_roles_seeded';
  DECLARE
    v_role_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_role_count
    FROM workspace_roles
    WHERE workspace_id = v_workspace_id;
    
    IF v_role_count > 0 THEN
      v_data := v_data || jsonb_build_object('workspace_roles_seeded', v_role_count);
    ELSE
      v_data := v_data || jsonb_build_object(
        'workspace_roles_seeded', 0,
        'warning', 'No workspace_roles were automatically seeded. Trigger may be missing.'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_data := v_data || jsonb_build_object(
      'workspace_roles_check_error', SQLERRM
    );
  END;
  
  -- ============================================
  -- STEP 10: Verify SELECT after INSERT (The Chicken-and-Egg Test)
  -- ============================================
  v_step := 'verify_select_after_insert';
  DECLARE
    v_can_select BOOLEAN := FALSE;
    v_workspace_record RECORD;
  BEGIN
    -- This simulates what Supabase client does with ?select=*
    SELECT * INTO v_workspace_record
    FROM workspaces
    WHERE id = v_workspace_id;
    
    IF v_workspace_record IS NOT NULL THEN
      v_can_select := TRUE;
      v_data := v_data || jsonb_build_object(
        'can_select_after_insert', TRUE,
        'workspace_name', v_workspace_record.name
      );
    ELSE
      v_data := v_data || jsonb_build_object(
        'can_select_after_insert', FALSE,
        'error', 'CRITICAL: Cannot SELECT workspace after INSERT! This causes 404 error.'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_data := v_data || jsonb_build_object(
      'can_select_after_insert', FALSE,
      'select_error', SQLERRM
    );
  END;
  
  -- ============================================
  -- CLEANUP: Remove test data
  -- ============================================
  v_step := 'cleanup';
  BEGIN
    DELETE FROM user_roles WHERE workspace_id = v_workspace_id;
    DELETE FROM workspace_members WHERE workspace_id = v_workspace_id;
    DELETE FROM workspace_roles WHERE workspace_id = v_workspace_id;
    DELETE FROM workspaces WHERE id = v_workspace_id;
    v_data := v_data || jsonb_build_object('cleanup', 'success');
  EXCEPTION WHEN OTHERS THEN
    v_data := v_data || jsonb_build_object('cleanup_error', SQLERRM);
  END;
  
  -- ============================================
  -- RETURN SUCCESS
  -- ============================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'step', 'complete',
    'error', NULL,
    'data', v_data
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'step', v_step,
    'error', 'Unexpected error: ' || SQLERRM,
    'data', jsonb_build_object('sqlstate', SQLSTATE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_onboarding_wizard(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION debug_onboarding_wizard(UUID, TEXT) TO service_role;

-- ============================================
-- HOW TO RUN THE DIAGNOSTIC
-- ============================================
-- Replace with an actual user ID from auth.users:
-- 
-- SELECT debug_onboarding_wizard(
--   'your-user-uuid-here'::UUID,
--   'Test Workspace Debug'
-- );
--
-- ============================================
-- FOR THE ACTUAL FIX
-- ============================================
-- Run fix_onboarding_wizard_404.sql in Supabase SQL Editor

