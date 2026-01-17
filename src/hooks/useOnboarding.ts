import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Database } from '@/types/database.types';

// Note: Using type assertions for inserts due to schema differences
type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];
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
      // Note: Using type assertion due to schema mismatch between code and database types
      const workspaceData: WorkspaceInsert = {
        name: data.name,
        slug,
        visibility: data.visibility || 'private',
        created_by: user.id,
        // These fields may not exist in the current database schema
        // theme: 'dark',
        // background_type: 'gradient',
        // background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      };

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert(workspaceData)
        .select()
        .returns<Database['public']['Tables']['workspaces']['Row']>()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as owner to workspace_members
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          status: 'active',
        });

      if (memberError) throw memberError;

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) {
        // Rollback member creation if role assignment fails
        await supabase
          .from('workspace_members')
          .delete()
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id);
        throw roleError;
      }


      if (memberError) throw memberError;

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
      // Note: Using simplified fields due to schema differences
      const taskData: TaskInsert = {
        workspace_id: workspaceId,
        title: data.title,
        project_id: data.project_id || null,
        // status and priority format may differ in actual schema
      };

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .returns<Database['public']['Tables']['tasks']['Row']>()
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
        const { data: invitation } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', inviteToken)
          .eq('workspace_id', workspaceId)
          .eq('status', 'pending')
          .single();

        if (invitation) {
          // Valid invite, add to workspace
          const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
              workspace_id: workspaceId,
              user_id: user.id,
              status: 'active',
            });

          if (memberError) throw memberError;

          // Assign role from invitation
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              workspace_id: workspaceId,
              user_id: user.id,
              role: invitation.role || 'guest',
            });

          if (roleError) {
             await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId).eq('user_id', user.id);
             throw roleError;
          }


          if (memberError) throw memberError;

          // Mark invitation as accepted
          await supabase
            .from('invitations')
            .update({ status: 'accepted' })
            .eq('id', invitation.id);

          return { success: true, error: null, requiresApproval: false };
        }
      }

      // If public workspace, auto-join
      if (workspace.visibility === 'public') {
        const { error: memberError } = await supabase
          .from('workspace_members')
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            status: 'active',
          });

        if (memberError) throw memberError;

        // Assign guest role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            role: 'guest',
          });

        if (roleError) {
            await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId).eq('user_id', user.id);
            throw roleError;
        }


        if (memberError) throw memberError;

        return { success: true, error: null, requiresApproval: false };
      }

      // Private workspace without invite - create join request
      // TODO: workspace_join_requests table doesn't exist in the database schema
      // For now, just indicate that approval is required (feature disabled)
      // const { error: requestError } = await supabase
      //   .from('workspace_join_requests')
      //   .insert({
      //     workspace_id: workspaceId,
      //     user_id: user.id,
      //     status: 'pending',
      //   });
      // if (requestError) throw requestError;
      // Feature disabled: join requests not supported yet
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
