-- Function to safely accept an invitation
-- Refactored to cast role to app_role explicitly
CREATE OR REPLACE FUNCTION accept_invitation(lookup_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  result_workspace_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify invitation
  SELECT * INTO invite_record
  FROM invitations
  WHERE token = lookup_token
  AND status = 'pending'
  AND expires_at > NOW();

  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- 1. Insert into user_roles (if not exists)
  -- CAST invite_record.role to app_role explicitly
  INSERT INTO user_roles (workspace_id, user_id, role)
  VALUES (invite_record.workspace_id, current_user_id, invite_record.role::app_role)
  ON CONFLICT (workspace_id, user_id) 
  DO UPDATE SET role = EXCLUDED.role;

  -- 2. Insert into workspace_members (for compatibility/listing)
  INSERT INTO workspace_members (workspace_id, user_id, status)
  VALUES (invite_record.workspace_id, current_user_id, 'active')
  ON CONFLICT (workspace_id, user_id)
  DO UPDATE SET status = 'active';

  -- 3. Mark invitation as accepted
  UPDATE invitations
  SET status = 'accepted'
  WHERE id = invite_record.id;

  RETURN jsonb_build_object(
    'workspace_id', invite_record.workspace_id,
    'role', invite_record.role
  );
END;
$$;
