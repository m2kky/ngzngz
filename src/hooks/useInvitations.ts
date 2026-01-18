import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Matches the actual 'invites' table structure
export interface Invitation {
  id: string;
  workspace_id: string;
  email: string | null;
  token: string;
  role: string | null;
  role_id: string | null;
  access_scope: string;
  allowed_client_ids: string[] | null;
  expires_at: string | null;
  used_at: string | null; // null = pending, has value = used
  created_by: string | null;
  created_at: string;
}

export function useInvitations() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!workspace) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch pending invitations (used_at is null = not used yet)
      const { data, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('workspace_id', workspace.id)
        .is('used_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvitations(data as Invitation[] || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invitations';
      console.error('Error fetching invitations:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const createInvitation = async ({ email, role_id }: { email: string | null; role_id: string }) => {
    if (!workspace) throw new Error('No active workspace');

    setLoading(true);
    setError(null);
    try {
      // Generate a unique token
      const token = crypto.randomUUID();
      
      const { data, error: createError } = await supabase
        .from('invites')
        .insert({
          workspace_id: workspace.id,
          email: email || null, // Allow null for direct links
          role_id,
          token,
          access_scope: 'workspace',
          created_by: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

      if (createError) {
        // Handle unique violation (already invited)
        if (createError.code === '23505') {
          throw new Error('This user has already been invited.');
        }
        throw createError;
      }

      setInvitations(prev => [data as Invitation, ...prev]);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invitation';
      console.error('Error creating invitation:', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('invites')
        .delete()
        .eq('id', invitationId);

      if (deleteError) throw deleteError;

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke invitation';
      console.error('Error revoking invitation:', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createInviteLink = async (role_id: string) => {
    if (!workspace) throw new Error('No active workspace');
    
    // Create an invite with null email
    const invite = await createInvitation({ email: null, role_id });
    
    // Return the full URL
    // Format: [BaseURL]/invite/[Token] (or /join?token=... as requested, but routing uses /invite/:token currently)
    // Checking App.tsx: <Route path="/invite/:token" element={<AcceptInvitePage />} />
    // So we use /invite/[token]
    return `${window.location.origin}/invite/${invite.token}`;
  };

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    createInvitation,
    createInviteLink,
    revokeInvitation
  };
}

