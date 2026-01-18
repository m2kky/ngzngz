import { useState } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  CreditCard, 
  Users, 
  Building,
  Shield
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AppearanceSettings } from '@/features/settings/components/tabs/AppearanceSettings';
import { AccountSettings } from '@/features/settings/components/tabs/AccountSettings';
import { LanguageSettings } from '@/features/settings/components/tabs/LanguageSettings';
import { WorkspaceSettings } from '@/features/settings/components/tabs/WorkspaceSettings';
import { MembersSettings } from '@/features/settings/components/tabs/MembersSettings';
import { BillingSettings } from '@/features/settings/components/tabs/BillingSettings';
import { NotificationsSettings } from '@/features/settings/components/tabs/NotificationsSettings';
import { RolesSettings } from '@/features/settings/components/tabs/RolesSettings';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = 'account' | 'notifications' | 'appearance' | 'language' | 'workspace' | 'members' | 'billing' | 'roles';

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const { profile } = useProfile();

  const menuItems = [
    {
      group: 'Account',
      items: [
        { id: 'account', label: 'My Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'language', label: 'Language & Region', icon: Globe },
      ]
    },
    {
      group: 'Workspace',
      items: [
        { id: 'workspace', label: 'General', icon: Building },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 overflow-hidden bg-[#191919] border-[#2c2c2c] text-white flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and workspace settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-full w-full">
          {/* Sidebar */}
          <div className="w-56 bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col">
            <div className="p-4 pl-5">
              <h2 className="text-sm font-semibold text-white mb-1 truncate">
                {profile?.full_name || profile?.nickname || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70 truncate">
                <span className="truncate">{profile?.email}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
              {menuItems.map((group) => (
                <div key={group.group}>
                  <h3 className="px-3 mb-2 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {group.group}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as SettingsTab)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                          activeTab === item.id 
                            ? "bg-[#2c2c2c] text-white font-medium" 
                            : "text-muted-foreground hover:bg-[#2c2c2c]/50 hover:text-white"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-[#2c2c2c]">
              <div className="text-xs text-muted-foreground">
                Ninjawy v1.0.0
              </div>
            </div>
          </div>


          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#191919] overflow-hidden">
            <div className="flex-1 overflow-y-auto py-8 px-6">
              <div className="max-w-2xl mx-auto pb-10">
                {activeTab === 'appearance' && <AppearanceSettings />}
                {activeTab === 'account' && <AccountSettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'language' && <LanguageSettings />}
                {activeTab === 'workspace' && <WorkspaceSettings />}
                {activeTab === 'members' && <MembersSettings />}
                {activeTab === 'roles' && <RolesSettings />}
                {activeTab === 'billing' && <BillingSettings />}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
