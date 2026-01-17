import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Calendar,
  TrendingUp, 
  Target, 
  Palette, 
  Zap, 
  Trophy, 
  Settings, 
  ChevronLeft,
  Menu,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
import { usePermission } from '@/features/auth/context/RBACContext';
import { useWorkspace } from '@/hooks/useWorkspace';
import { InviteModal } from '@/components/invites/invite-modal';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', resource: 'dashboard', action: 'view' },
  { icon: Users, label: 'Clients', path: '/clients', resource: 'clients', action: 'view' },
  { icon: FolderKanban, label: 'Projects', path: '/projects', resource: 'projects', action: 'view' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', resource: 'tasks', action: 'view' },
  { icon: Calendar, label: 'Meetings', path: '/meetings', resource: 'meetings', action: 'view' },
  { icon: TrendingUp, label: 'Ads', path: '/ads', resource: 'ads', action: 'view' },
  { icon: Target, label: 'Strategy', path: '/strategy', resource: 'strategy', action: 'view' },
  { icon: Palette, label: 'Brand Kit', path: '/brand-kits', resource: 'brand_kits', action: 'view' },
  { icon: Zap, label: 'Automations', path: '/automations', resource: 'automation', action: 'view' },
  { icon: Trophy, label: 'Dojo', path: '/dojo', resource: 'dojo', action: 'view' },
];

export function DesktopSidebar() {
  const { can } = usePermission();
  const { workspace } = useWorkspace();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Filter items based on permissions
  // Note: For now, we map resources loosely. If a resource isn't in RBAC list, we default allow or strict check.
  // Assuming 'dashboard' is always allowed.
  const filteredItems = sidebarItems.filter(item => {
      if (item.path === '/') return true; // Always show dashboard
      if (item.resource === 'clients') return true; // Everyone sees clients for now? Or strict?
      // Use the can() function. If resource is not in the type definition, we might need to update types or be lenient.
      // The current PermissionResource type is: 'tasks' | 'ads' | 'finance' | 'strategy' | 'settings'
      
      if (item.resource === 'tasks') return can('view', 'tasks');
      if (item.resource === 'ads') return can('view', 'ads');
      if (item.resource === 'strategy') return can('view', 'strategy');
      
      // For others not in strict RBAC yet, show them or hide them?
      // Let's show them by default to avoid breaking workflow until we add them to RBAC
      return true;
  });

  const canInvite = can('manage', 'settings'); // Or specific invite permission

  return (
    <>
      <aside 
        className={cn(
          "relative flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >


        <div className="flex items-center justify-between h-14 px-2 border-b border-sidebar-border">
          {!collapsed && <WorkspaceSwitcher />}
          {collapsed && (
             <div className="mx-auto font-bold text-xl text-primary">N</div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6 ml-auto", !collapsed && "absolute -right-3 top-4 bg-background border shadow-sm rounded-full h-6 w-6 z-10")}
            onClick={toggleCollapsed}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          {canInvite && (
            <InviteModal workspaceId={workspace?.id}>
                <button
                    className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium w-full",
                    "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                    )}
                >
                    <UserPlus className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Invite Member</span>}
                </button>
            </InviteModal>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium w-full",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </aside>
      
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
