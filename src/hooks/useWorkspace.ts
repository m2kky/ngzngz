import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Database } from '@/types/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

export function useWorkspace() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspace() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Get user's membership
        const { data: members, error: memberError } = await supabase
          .from('workspace_members' as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1);

        if (memberError) throw memberError;

        if (members && members.length > 0) {
          const currentMember = members[0];
          setMember(currentMember);

          // 2. Get workspace details
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces' as any)
            .select('*')
            .eq('id', currentMember.workspace_id)
            .single();

          if (workspaceError) throw workspaceError;
          setWorkspace(workspaceData);
        } else {
          // Fallback for demo: If user has no workspace, try to fetch the demo workspace
          // Note: In production, we would redirect to onboarding
          console.log('No membership found, checking for demo workspace...');
          
          const { data: demoWorkspaces, error: demoError } = await supabase
            .from('workspaces')
            .select('*')
            .eq('slug', 'ninjawy-demo')
            .limit(1);

          if (!demoError && demoWorkspaces && demoWorkspaces.length > 0) {
             const demoWorkspace = demoWorkspaces[0];
             // Auto-join the demo workspace for now (Client-side logic for MVP dev)
             // Ideally this should be a server action or user action
             const { error: joinError } = await supabase
               .from('workspace_members')
               .insert({
                 workspace_id: demoWorkspace.id,
                 user_id: user.id,
                 role: 'admin', // Auto-admin for dev
                 status: 'active'
               });
             
             // If insert succeeds OR conflicts (already member), try to fetch again
             if (!joinError || joinError.code === '23505' || joinError.code === '409') {
               if (joinError) console.log('Member already exists, refreshing...');
               
               setWorkspace(demoWorkspace);
               // Refresh member
               const { data: newMember } = await supabase
                 .from('workspace_members')
                 .select('*')
                 .eq('workspace_id', demoWorkspace.id)
                 .eq('user_id', user.id)
                 .single();
               setMember(newMember);
             } else {
               console.error('Failed to join demo workspace:', joinError);
             }
          }
        }
      } catch (err: any) {
        console.error('Error fetching workspace:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspace();
  }, [user]);

  return { workspace, member, loading, error };
}
