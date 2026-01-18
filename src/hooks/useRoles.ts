import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Role, CreateRoleInput, UpdateRoleInput } from '@/types/rbac.types';
import { toast } from 'sonner';

export function useRoles() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = workspace?.id;
  
  // ============================================
  // FETCH ALL ROLES
  // ============================================
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('is_system', { ascending: false })
        .order('name');
        
      if (error) throw error;
      return data as Role[];
    },
    enabled: !!workspaceId,
  });
  
  // ============================================
  // CREATE ROLE
  // ============================================
  const createRoleMutation = useMutation({
    mutationFn: async (input: CreateRoleInput) => {
      if (!workspaceId) throw new Error('No workspace selected');
      
      // Auto-generate slug
      const slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from('roles')
        .insert({
          workspace_id: workspaceId,
          ...input,
          slug,
          is_system: false,
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create role');
    },
  });
  
  // ============================================
  // UPDATE ROLE
  // ============================================
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, ...input }: UpdateRoleInput) => {
      const { data, error } = await supabase
        .from('roles')
        .update(input)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
  
  // ============================================
  // DELETE ROLE
  // ============================================
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      toast.success('Role deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });
  
  // ============================================
  // HELPERS
  // ============================================
  const assignableRoles = roles.filter(r => !r.is_system || r.name === 'Member');
  const systemRoles = roles.filter(r => r.is_system);
  const customRoles = roles.filter(r => !r.is_system);
  
  return {
    roles,
    assignableRoles,
    systemRoles,
    customRoles,
    isLoading,
    error,
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
}
