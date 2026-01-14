import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

type Invitation = Database['public']['Tables']['invitations']['Row'];
type CreateInvitationParams = Database['public']['Tables']['invitations']['Insert'];

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
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvitations(data || []);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const createInvitation = async ({ email, role }: { email: string; role: 'owner' | 'admin' | 'member' | 'guest' }) => {
    if (!workspace) throw new Error('No active workspace');

    setLoading(true);
    setError(null);
    try {
      const { data, error: createError } = await supabase
        .from('invitations')
        .insert({
          workspace_id: workspace.id,
          email,
          role,
          status: 'pending' // Default, explicitly set for clarity
        } as CreateInvitationParams)
        .select()
        .single();

      if (createError) {
        // Handle unique violation (already invited)
        if (createError.code === '23505') {
            throw new Error('This user has already been invited.');
        }
        throw createError;
      }

      setInvitations(prev => [data, ...prev]);
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
        .from('invitations')
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
