import { useState } from 'react';
import { Plus, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleCard } from '../RoleCard';
import { RoleFormDialog } from '../RoleFormDialog';
import { useRoles } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Role, CreateRoleInput } from '@/types/rbac.types';

export function RolesSettings() {
  const { roles, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating, isDeleting } = useRoles();
  const { can } = usePermissions();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  const handleSubmit = async (data: CreateRoleInput) => {
    if (selectedRole) {
      await updateRole({ id: selectedRole.id, ...data });
    } else {
      await createRole(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading roles...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Roles & Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage custom roles and access levels for your workspace.
          </p>
        </div>
        
        {can.manage('settings') && (
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            memberCount={0} // TODO: Need to fetch member count per role if needed, or join in query
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedRole}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className="bg-[#191919] border-[#2c2c2c] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              <span className="font-semibold text-white"> "{roleToDelete?.name}"</span>.
              Members with this role will lose their assigned permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2c2c2c] hover:bg-[#2c2c2c]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
