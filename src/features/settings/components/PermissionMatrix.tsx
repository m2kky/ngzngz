import { 
  RESOURCE_MODULES, 
  PERMISSION_ACTIONS, 
  ROLE_TEMPLATES, 
  type Permissions, 
  type ResourceModule, 
  type PermissionAction,
  type ModulePermissions
} from '@/types/rbac.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PermissionMatrixProps {
  permissions: Permissions;
  onChange: (permissions: Permissions) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({ permissions, onChange, readOnly = false }: PermissionMatrixProps) {
  
  const togglePermission = (module: ResourceModule, action: PermissionAction) => {
    if (readOnly) return;
    
    const currentModulePerms = permissions[module] || {};
    const newValue = !currentModulePerms[action];
    
    const newPermissions = {
      ...permissions,
      [module]: {
        ...currentModulePerms,
        [action]: newValue,
      },
    };
    
    onChange(newPermissions);
  };

  const toggleRow = (module: ResourceModule) => {
    if (readOnly) return;
    
    const currentModulePerms = permissions[module] || {};
    // Check if all actions are enabled
    const allEnabled = PERMISSION_ACTIONS.every(action => currentModulePerms[action]);
    
    const newModulePerms: ModulePermissions = {};
    PERMISSION_ACTIONS.forEach(action => {
      newModulePerms[action] = !allEnabled;
    });
    
    onChange({
      ...permissions,
      [module]: newModulePerms,
    });
  };

  const applyTemplate = (templatePermissions: Permissions) => {
    if (readOnly) return;
    onChange(templatePermissions);
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-muted-foreground self-center mr-2">Templates:</span>
          {Object.values(ROLE_TEMPLATES).map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(template.permissions)}
              className="h-8 border-dashed"
            >
              {template.name}
            </Button>
          ))}
        </div>
      )}

      {/* Matrix */}
      <div className="border border-[#2c2c2c] rounded-md overflow-hidden bg-[#1e1e1e]/30">
        <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] gap-0 text-sm">
          
          {/* Header */}
          <div className="p-3 bg-[#2c2c2c]/50 font-medium text-muted-foreground border-b border-[#2c2c2c]">Module</div>
          {PERMISSION_ACTIONS.map(action => (
            <div key={action} className="p-3 bg-[#2c2c2c]/50 font-medium text-center capitalize text-muted-foreground border-b border-[#2c2c2c]">
              {action}
            </div>
          ))}

          {/* Rows */}
          {RESOURCE_MODULES.map((module) => {
            const modulePerms = permissions[module] || {};
            const isAllEnabled = PERMISSION_ACTIONS.every(a => modulePerms[a]);

            return (
              <div key={module} className="contents group">
                {/* Module Name & Row Toggle */}
                <div className="p-3 border-b border-[#2c2c2c] bg-[#1e1e1e]/20 group-hover:bg-[#1e1e1e]/50 transition-colors flex items-center justify-between">
                  <span className="capitalize font-medium text-gray-300">{module.replace('_', ' ')}</span>
                  {!readOnly && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleRow(module)}
                      title={isAllEnabled ? "Deselect all" : "Select all"}
                    >
                      {isAllEnabled ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                    </Button>
                  )}
                </div>

                {/* Action Checkboxes */}
                {PERMISSION_ACTIONS.map((action) => {
                  const isChecked = !!modulePerms[action];
                  const isDisabled = readOnly; 
                  // Special cases: e.g. some modules might not support all actions, but for now we assume they do
                  // or we can hardcode logic like "billing" has no "create" etc if needed.
                  // For this generic implementation we allow all.
                  
                  return (
                    <div 
                      key={`${module}-${action}`} 
                      className="p-3 border-b border-[#2c2c2c] flex justify-center items-center bg-[#1e1e1e]/20 group-hover:bg-[#1e1e1e]/50 transition-colors border-l border-[#2c2c2c]/30"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => togglePermission(module, action)}
                        disabled={isDisabled}
                        className={cn(
                          "data-[state=checked]:bg-primary data-[state=checked]:border-primary border-[#3c3c3c]",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
