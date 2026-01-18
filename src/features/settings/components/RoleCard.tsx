import { Edit2, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Role } from '@/types/rbac.types';

interface RoleCardProps {
  role: Role;
  memberCount?: number;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, memberCount = 0, onEdit, onDelete }: RoleCardProps) {
  const isSystem = role.is_system;

  return (
    <Card className="bg-[#1e1e1e] border-[#2c2c2c] overflow-hidden group hover:border-[#3c3c3c] transition-colors">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: role.color || '#6366f1' }}
            />
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                {role.name}
                {isSystem && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-[#2c2c2c] text-muted-foreground border-none">
                    SYSTEM
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {role.description || 'No description provided'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isSystem && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-white"
                  onClick={() => onEdit(role)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(role)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {isSystem && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={() => onEdit(role)}
                title="View permissions"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#2c2c2c]/30 py-1.5 px-2.5 rounded w-fit">
          <Users className="h-3.5 w-3.5" />
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
