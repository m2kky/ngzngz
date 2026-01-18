import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Permissions, ResourceModule, PermissionAction } from '@/types/rbac.types';

export function usePermissions() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user?.id || !workspace?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          p_user_id: user.id,
          p_workspace_id: workspace.id,
        });
        
      if (error) throw error;
      return data as Permissions;
    },
    enabled: !!user?.id && !!workspace?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // ============================================
  // PERMISSION CHECK FUNCTION
  // ============================================
  const hasPermission = useCallback((module: ResourceModule, action: PermissionAction): boolean => {
    if (!permissions) return false;
    
    const modulePerms = permissions[module];
    if (!modulePerms) return false;
    
    // Check specific action or manage (which grants all)
    return modulePerms[action] === true || modulePerms.manage === true;
  }, [permissions]);
  
  // ============================================
  // IS ADMIN CHECK (has settings.manage)
  // ============================================
  const isAdmin = useCallback((): boolean => {
    return permissions?.settings?.manage === true;
  }, [permissions]);
  
  // ============================================
  // CAN PERFORM ACTION (convenience wrapper)
  // ============================================
  const can = useMemo(() => ({
    view: (module: ResourceModule) => hasPermission(module, 'view'),
    create: (module: ResourceModule) => hasPermission(module, 'create'),
    edit: (module: ResourceModule) => hasPermission(module, 'edit'),
    delete: (module: ResourceModule) => hasPermission(module, 'delete'),
    manage: (module: ResourceModule) => hasPermission(module, 'manage'),
  }), [hasPermission]);
  
  return {
    permissions,
    isLoading,
    hasPermission,
    isAdmin,
    can,
  };
}
