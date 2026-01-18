import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

// Define types manually since database.types.ts might be out of sync regarding the new 'invites' table
export interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: string | null;
  role_id: string | null;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
  expires_at: string;
  created_at: string;
  created_by: string | null;
}

export function useInvitations() {
  const { workspace } = useWorkspace();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!workspace) return;
    
    setLoading(true);
    setError(null);
    try {
      // Switch to 'invites' table as per RBAC instructions
      const { data, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvitations(data as Invitation[] || []);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const createInvitation = async ({ email, role_id }: { email: string; role_id: string }) => {
    if (!workspace) throw new Error('No active workspace');

    setLoading(true);
    setError(null);
    try {
      const { data, error: createError } = await supabase
        .from('invites')
        .insert({
          workspace_id: workspace.id,
          email,
          role_id, // Use role_id for RBAC
          status: 'pending'
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
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      setError(err.message || 'Failed to create invitation');
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
    } catch (err: any) {
      console.error('Error revoking invitation:', err);
      setError(err.message || 'Failed to revoke invitation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    createInvitation,
    revokeInvitation
  };
}
