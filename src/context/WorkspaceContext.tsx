import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Database } from '@/types/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

interface WorkspaceContextType {
  workspace: Workspace | null;
  member: WorkspaceMember | null;
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  refreshWorkspace: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setWorkspaces([]);
      setWorkspace(null);
      setMember(null);
      return;
    }

    try {
      // 1. Get all memberships
      const { data: members, error: memberError } = await supabase
        .from('workspace_members' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // If we encounter an error, it might be due to a race condition with onboarding or permissions.
      // But we shouldn't throw immediately if we can recover or if it's just empty.
      if (memberError) {
          console.error("Error fetching memberships:", memberError);
          // If 500 or 406, it might be transient. But if RLS fails, we get empty.
          // Let's assume empty if error.
          setWorkspaces([]);
          setWorkspace(null);
          setMember(null);
          return;
      }

      if (members && members.length > 0) {
        // 2. Get details for ALL workspaces
        const workspaceIds = members.map((m: any) => m.workspace_id);
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces' as any)
          .select('*')
          .in('id', workspaceIds);

        if (workspacesError) throw workspacesError;

        setWorkspaces(workspacesData);

        // Determine active workspace
        // If we already have a selected workspace in state that exists in the new list, keep it
        let activeWorkspace = workspacesData[0];
        
        // Check local storage for persistence (optional enhancement for later, simpler for now)
        const storedWorkspaceId = localStorage.getItem('activeWorkspaceId');
        
        if (storedWorkspaceId) {
             const stored = workspacesData.find((w: any) => w.id === storedWorkspaceId);
             if (stored) activeWorkspace = stored;
        }

        const activeMember = members.find((m: any) => m.workspace_id === activeWorkspace.id);
        
        setWorkspace(activeWorkspace);
        setMember(activeMember || null);
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
  }, [user, authLoading]);

  // Initial fetch
  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const switchWorkspace = useCallback((workspaceId: string) => {
    const targetWorkspace = workspaces.find(w => w.id === workspaceId);
    if (!targetWorkspace || !user) return;
    
    setWorkspace(targetWorkspace);
    localStorage.setItem('activeWorkspaceId', workspaceId); // Persist selection

    // Fetch member details for the new workspace
     supabase
    .from('workspace_members' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .single()
    .then(({data}: any) => {
        if(data) setMember(data);
    });
  }, [workspaces, user]);

  const value = {
    workspace,
    member,
    workspaces,
    loading,
    error,
    refreshWorkspace: fetchWorkspace,
    switchWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}
