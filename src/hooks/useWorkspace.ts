import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Database } from '@/types/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

export function useWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const fetchWorkspace = async () => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching workspaces for user:', user.id);
      
      // 1. Get all memberships
      const { data: members, error: memberError } = await supabase
        .from('workspace_members' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberError) {
        console.error('Member fetch error:', memberError);
        throw memberError;
      }

      console.log('Members found:', members);

      if (members && members.length > 0) {
        // 2. Get details for ALL workspaces
        const workspaceIds = members.map((m: any) => m.workspace_id);
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces' as any)
          .select('*')
          .in('id', workspaceIds);

        if (workspacesError) {
             console.error('Workspaces details error:', workspacesError);
             throw workspacesError;
        }

        console.log('Workspaces loaded:', workspacesData);
        setWorkspaces(workspacesData);

        // Set active workspace (first one by default if not set)
        if (workspacesData && workspacesData.length > 0) {
            // Find current member record for the active workspace
            // If we already have a selected workspace, keep it if it's still valid
            // Otherwise, pick the first one
            let activeWorkspace = workspacesData[0];
            
            if (workspace) {
              const stillExists = workspacesData.find((w: any) => w.id === workspace.id);
              if (stillExists) {
                activeWorkspace = stillExists;
              }
            }

            const activeMember = members.find((m: any) => m.workspace_id === activeWorkspace.id);
            
            setWorkspace(activeWorkspace);
            if (activeMember) {
              setMember(activeMember);
            } else {
              setMember(null);
            }
        }
      } else {
        setWorkspaces([]);
        setWorkspace(null);
        setMember(null);
      }
    } catch (err: any) {
      console.error('Error fetching workspace:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const targetWorkspace = workspaces.find(w => w.id === workspaceId);
    if (!targetWorkspace || !user) return;
    
    setWorkspace(targetWorkspace);
    
    // We need to fetch/find the member record for this workspace to ensure permissions are correct
    // We can re-fetch just the member to be safe and ensure latest role
     supabase
    .from('workspace_members' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .single()
    .then(({data}: any) => {
        if(data) setMember(data);
    });
  };

  useEffect(() => {
    fetchWorkspace();
  }, [user, authLoading]);

  return { workspace, workspaces, member, loading, error, refreshWorkspace: fetchWorkspace, switchWorkspace };
}
