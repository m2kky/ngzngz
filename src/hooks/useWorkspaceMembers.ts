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
        // 1. Fetch active members
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members' as any)
          .select(`
            user_id,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('workspace_id', workspace.id)
          .eq('status', 'active');

        if (membersError) throw membersError;

        // 2. Fetch roles for this workspace
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('workspace_id', workspace.id);

        if (rolesError) throw rolesError;

        // Map roles by user_id
        const rolesMap = new Map();
        if (rolesData) {
            rolesData.forEach((r: any) => rolesMap.set(r.user_id, r.role));
        }

        // 3. Merge data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMembers = membersData.map((item: any) => ({
          id: item.users.id,
          full_name: item.users.full_name || item.users.email,
          email: item.users.email,
          avatar_url: item.users.avatar_url,
          role: rolesMap.get(item.users.id) || 'member' // Default to member if no role found
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
