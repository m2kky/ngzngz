import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

export interface WorkspaceMemberProfile {
  id: string; // user id
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

export function useWorkspaceMembers() {
  const { workspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMemberProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!workspace) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('workspace_members' as any)
          .select(`
            user_id,
            role,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('workspace_id', workspace.id)
          .eq('status', 'active');

        if (error) throw error;

        // Flatten the structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMembers = data.map((item: any) => ({
          id: item.users.id,
          full_name: item.users.full_name || item.users.email,
          email: item.users.email,
          avatar_url: item.users.avatar_url,
          role: item.role
        }));

        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [workspace]);

  return { members, loading };
}
