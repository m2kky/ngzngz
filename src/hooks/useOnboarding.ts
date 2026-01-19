import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';
import type { Database } from '@/types/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

interface CreateWorkspaceData {
  name: string;
  visibility?: 'private' | 'public';
}

interface CreateClientData {
  name: string;
  email?: string;
}

interface CreateProjectData {
  name: string;
  client_id?: string;
}

interface CreateTaskData {
  title: string;
  project_id?: string;
}

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createWorkspace = async (data: CreateWorkspaceData) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);

    try {
      // Generate a base slug and append a random suffix to ensure uniqueness
      const baseSlug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      // Use RPC for atomic creation
      const { data: workspaceId, error: rpcError } = await supabase
        .rpc('create_workspace_complete', {
          p_name: data.name,
          p_slug: slug,
          p_visibility: data.visibility || 'private'
        });

      if (rpcError) throw rpcError;
      if (!workspaceId) throw new Error('Failed to create workspace');

      // Fetch the created workspace to return it
      const { data: workspace, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (fetchError) throw fetchError;

      return { workspace, error: null };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || 'Failed to create workspace';
      setError(errorMessage);
      return { workspace: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (workspaceId: string, data: CreateClientData) => {
    setLoading(true);
    setError(null);

    try {
      const baseSlug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      
      const clientData: ClientInsert = {
        workspace_id: workspaceId,
        name: data.name,
        slug,
        primary_contact_email: data.email || null,
        status: 'active',
      };

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientError) throw clientError;

      return { client, error: null };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || 'Failed to create client';
      setError(errorMessage);
      return { client: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (workspaceId: string, data: CreateProjectData) => {
    setLoading(true);
    setError(null);

    try {
      const projectData: ProjectInsert = {
        workspace_id: workspaceId,
        name: data.name,
        client_id: data.client_id || null,
        status: 'active',
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      return { project, error: null };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || 'Failed to create project';
      setError(errorMessage);
      return { project: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (workspaceId: string, data: CreateTaskData) => {
    setLoading(true);
    setError(null);

    try {
      const taskData: TaskInsert = {
        workspace_id: workspaceId,
        title: data.title,
        project_id: data.project_id || null,
        status: 'backlog', // Default status
      };

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) throw taskError;

      return { task, error: null };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || 'Failed to create task';
      setError(errorMessage);
      return { task: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const joinWorkspace = async (workspaceId: string, inviteToken?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);

    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { success: true, error: null, requiresApproval: false };
      }

      // Get workspace details
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('visibility')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw new Error('Workspace not found');

      // If has invite token, check if valid
      if (inviteToken) {
        // Check workspace_invites first (preferred)
        const { data: invitation } = await supabase
          .from('workspace_invites')
          .select('*')
          .eq('token', inviteToken)
          .eq('workspace_id', workspaceId)
          .eq('status', 'PENDING') // Assuming uppercase status based on recent conventions
          .single();

        if (invitation) {
            // Get role ID for the invited role
            // The invitation stores role as enum (ADMIN, etc), but we need role_id for workspace_members
            // We need to look up the role by name/slug. 
            // NOTE: The role names in 'roles' table are 'Owner', 'Admin', 'Member' etc.
            // The invitation role is likely 'ADMIN', 'SQUAD_MEMBER' etc.
            // We need a mapping or just default to Member if mismatch.
            
            // Map invitation role to role slug
            const roleMap: Record<string, string> = {
                'ADMIN': 'admin',
                'ACCOUNT_MANAGER': 'admin', // Map to admin?
                'SQUAD_MEMBER': 'member',
                'MEDIA_BUYER': 'member',
                'CLIENT': 'member' // Or guest
            };
            
            const roleSlug = roleMap[invitation.role] || 'member';

            const { data: roleData } = await supabase
                .from('roles')
                .select('id')
                .eq('workspace_id', workspaceId)
                .eq('slug', roleSlug)
                .single();
            
            if (!roleData) throw new Error('Role configuration error');

          // Valid invite, add to workspace
          const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
              workspace_id: workspaceId,
              user_id: user.id,
              status: 'active',
              role_id: roleData.id
            });

          if (memberError) throw memberError;

          // Mark invitation as accepted
          await supabase
            .from('workspace_invites')
            .update({ status: 'ACCEPTED' })
            .eq('id', invitation.id);

          return { success: true, error: null, requiresApproval: false };
        }
      }

      // If public workspace, auto-join
      if (workspace.visibility === 'public') {
        // Get 'Member' role
        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('slug', 'member')
            .single();

        const { error: memberError } = await supabase
          .from('workspace_members')
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            status: 'active',
            role_id: roleData?.id // If null, it might fail constraints, which is good
          });

        if (memberError) throw memberError;

        return { success: true, error: null, requiresApproval: false };
      }

      return { success: false, error: 'This workspace requires an invitation to join. Please contact the workspace admin.', requiresApproval: true };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err) || 'Failed to join workspace';
      setError(errorMessage);
      return { success: false, error: errorMessage, requiresApproval: false };
    } finally {
      setLoading(false);
    }
  };

  const getWorkspaceById = async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('id, name, slug, visibility')
      .eq('id', workspaceId)
      .single();

    return { workspace: data, error };
  };

  return {
    loading,
    error,
    createWorkspace,
    createClient,
    createProject,
    createTask,
    joinWorkspace,
    getWorkspaceById,
  };
}
