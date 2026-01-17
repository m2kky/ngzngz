import { createContext, useContext, useEffect, useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage';
export type PermissionResource = 'tasks' | 'ads' | 'finance' | 'strategy' | 'settings';

type Permissions = Record<PermissionResource, Record<PermissionAction, boolean>>;

interface RBACContextType {
  role: string | null;
  permissions: Permissions | null;
  loading: boolean;
  can: (action: PermissionAction, resource: PermissionResource) => boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!workspace || !user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch role_id from workspace_members
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('role_id')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();

        if (memberError || !memberData?.role_id) {
            // Fallback: If no RBAC role, maybe check if they are owner in user_roles?
            // For now, assume restricted access or handle legacy logic
            console.warn("No RBAC role found for user");
            setLoading(false);
            return;
        }

        // Fetch permissions from roles table
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name, permissions')
          .eq('id', memberData.role_id)
          .single();

        if (roleError) throw roleError;

        setRole(roleData.name);
        setPermissions(roleData.permissions as unknown as Permissions);
      } catch (error) {
        console.error('Failed to fetch RBAC permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [workspace?.id, user?.id]);

  const can = (action: PermissionAction, resource: PermissionResource): boolean => {
    if (!permissions) return false;
    
    // Check if resource exists in permissions
    const resourcePerms = permissions[resource];
    if (!resourcePerms) return false;

    // Check specific action
    if (resourcePerms[action]) return true;

    // Optional: 'manage' implies all actions? Or strict checking?
    // Let's keep it strict for now, but 'manage' usually implies full access to that resource.
    if (action !== 'manage' && resourcePerms['manage']) return true;

    return false;
  };

  return (
    <RBACContext.Provider value={{ role, permissions, loading, can }}>
      {children}
    </RBACContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within an RBACProvider');
  }
  return context;
}

export function RBACGuard({ 
  action, 
  resource, 
  fallback = null, 
  children 
}: { 
  action: PermissionAction; 
  resource: PermissionResource; 
  fallback?: React.ReactNode;
  children: React.ReactNode 
}) {
  const { can, loading } = usePermission();

  if (loading) return null; // Or a skeleton?

  if (can(action, resource)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
