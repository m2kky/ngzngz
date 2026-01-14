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
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Meetings', path: '/meetings' },
  { icon: TrendingUp, label: 'Ads', path: '/ads' },
  { icon: Target, label: 'Strategy', path: '/strategy' },
  { icon: Palette, label: 'Brand Kit', path: '/brand-kits' },
  { icon: Zap, label: 'Automations', path: '/automations' },
  { icon: Trophy, label: 'Dojo', path: '/dojo' },
];

export function DesktopSidebar() {
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
            {sidebarItems.map((item) => (
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

        <div className="p-4 border-t border-sidebar-border">
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
