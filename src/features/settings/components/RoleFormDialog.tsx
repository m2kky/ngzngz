import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RoleSchema, type CreateRoleInput, type Role } from '@/types/rbac.types';
import { PermissionMatrix } from './PermissionMatrix';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Role | null;
  onSubmit: (data: CreateRoleInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function RoleFormDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit, 
  isSubmitting = false 
}: RoleFormDialogProps) {
  const isEdit = !!initialData;
  const isSystem = initialData?.is_system;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateRoleInput>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      permissions: {},
    }
  });

  const permissions = watch('permissions');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        color: initialData.color || '#6366f1',
        permissions: initialData.permissions,
      });
    } else {
      reset({
        name: '',
        description: '',
        color: '#6366f1',
        permissions: {},
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = async (data: CreateRoleInput) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    }
  };

  const Content = (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Role Name</Label>
          <Input 
            id="name" 
            {...register('name')} 
            className="bg-[#2c2c2c] border-[#3c3c3c]"
            placeholder="e.g. Graphic Designer"
            disabled={isSystem}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Badge Color</Label>
          <div className="flex gap-2">
            <Input 
              id="color" 
              type="color" 
              {...register('color')} 
              className="w-12 h-10 p-1 bg-[#2c2c2c] border-[#3c3c3c] cursor-pointer"
              disabled={isSystem}
            />
            <Input 
              {...register('color')} 
              className="flex-1 bg-[#2c2c2c] border-[#3c3c3c] font-mono"
              placeholder="#000000"
              disabled={isSystem}
            />
          </div>
          {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          {...register('description')} 
          className="bg-[#2c2c2c] border-[#3c3c3c] min-h-[80px]"
          placeholder="What is this role for?"
          disabled={isSystem}
        />
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="max-h-[400px] overflow-y-auto pr-2">
          <PermissionMatrix 
            permissions={permissions} 
            onChange={(newPerms) => setValue('permissions', newPerms, { shouldDirty: true })}
            readOnly={isSystem}
          />
        </div>
      </div>
    </div>
  );

  const Footer = (
    <div className="flex justify-end gap-2 pt-4 border-t border-[#2c2c2c]">
      <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
        {isSystem ? 'Close' : 'Cancel'}
      </Button>
      {!isSystem && (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Role'}
        </Button>
      )}
    </div>
  );

  // Use Dialog for desktop, Sheet for mobile (simplified logic)
  // Or just use Sheet for complex forms like this to have more space?
  // Let's use Dialog with max-width for better matrix visibility
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#191919] border-[#2c2c2c] text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? (isSystem ? 'View Role' : 'Edit Role') : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {isSystem 
              ? 'System roles define core access levels and cannot be modified.' 
              : 'Define role details and granular permissions for workspace members.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto px-1">
          {Content}
          {Footer}
        </form>
      </DialogContent>
    </Dialog>
  );
}
