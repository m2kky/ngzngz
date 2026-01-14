import { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Palette, 
  Globe, 
  Monitor, 
  CreditCard, 
  Users, 
  Building,
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = 'account' | 'notifications' | 'appearance' | 'language' | 'workspace' | 'members' | 'billing';

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

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
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 overflow-hidden bg-[#191919] border-[#2c2c2c] text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and workspace settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-56 bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col">
            <div className="p-4 pl-5">
              <h2 className="text-sm font-semibold text-muted-foreground mb-1">
                mizot
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <span>mizot@example.com</span>
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
          <div className="flex-1 overflow-y-auto bg-[#191919]">
            <div className="max-w-2xl mx-auto py-8 px-6">
              {activeTab === 'appearance' && <AppearanceSettings />}
              {activeTab === 'account' && <AccountSettings />}
              {activeTab === 'notifications' && <NotificationsSettings />}
              {activeTab === 'language' && <LanguageSettings />}
              {activeTab === 'workspace' && <WorkspaceGeneralSettings />}
              {activeTab === 'members' && <MembersSettings />}
              {activeTab === 'billing' && <BillingSettings />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ... (AppearanceSettings, AccountSettings, NotificationsSettings remain same)

function LanguageSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Language & Region</h2>
        <p className="text-sm text-muted-foreground">Customize your language and region preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select defaultValue="en">
            <SelectTrigger className="w-full max-w-sm bg-[#2c2c2c] border-[#3c3c3c] text-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="ar">Arabic (العربية)</SelectItem>
              <SelectItem value="fr">French (Français)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Change the language used in the user interface.</p>
        </div>

        <Separator className="bg-[#2c2c2c]" />

        <div className="space-y-2">
          <Label>First day of week</Label>
          <Select defaultValue="sat">
            <SelectTrigger className="w-full max-w-sm bg-[#2c2c2c] border-[#3c3c3c] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sat">Saturday</SelectItem>
              <SelectItem value="sun">Sunday</SelectItem>
              <SelectItem value="mon">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Use 24-hour time</Label>
            <p className="text-sm text-muted-foreground">Display time in 24-hour format (e.g., 14:00).</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}

function WorkspaceGeneralSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your workspace preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            N
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">Upload Logo</Button>
            <p className="text-xs text-muted-foreground">Recommended 256x256px PNG/JPG</p>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <Input defaultValue="Ninjawy" className="bg-[#2c2c2c] border-[#3c3c3c] text-white" />
          </div>
          
          <div className="space-y-2">
            <Label>Workspace URL</Label>
            <div className="flex items-center">
              <span className="bg-[#2c2c2c]/50 border border-[#3c3c3c] border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground h-10 flex items-center">
                ngz.app/
              </span>
              <Input defaultValue="ninjawy" className="rounded-l-none bg-[#2c2c2c] border-[#3c3c3c] text-white focus-visible:ring-0" />
            </div>
          </div>
        </div>

        <Separator className="bg-[#2c2c2c]" />

        <div className="space-y-4">
          <Label className="text-destructive">Danger Zone</Label>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
             <div>
                <h4 className="font-medium text-destructive mb-1">Delete Workspace</h4>
                <p className="text-xs text-muted-foreground">Permanently delete this workspace and all data.</p>
             </div>
             <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersSettings() {
  const members = [
    { name: 'Mizot', email: 'mizot@example.com', role: 'Owner', avatar: 'MZ' },
    { name: 'Sarah Ahmed', email: 'sarah@example.com', role: 'Admin', avatar: 'SA' },
    { name: 'Karim Ali', email: 'karim@example.com', role: 'Member', avatar: 'KA' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Members</h2>
          <p className="text-sm text-muted-foreground">Manage workspace access and roles.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Invite Member
        </Button>
      </div>

      <div className="rounded-lg border border-[#2c2c2c] divide-y divide-[#2c2c2c]">
        {members.map((member) => (
          <div key={member.email} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
               <Avatar>
                 <AvatarFallback className="bg-[#2c2c2c] text-xs">{member.avatar}</AvatarFallback>
               </Avatar>
               <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Select defaultValue={member.role.toLowerCase()}>
                 <SelectTrigger className="w-[100px] h-8 text-xs bg-transparent border-[#3c3c3c]">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-xl font-semibold mb-1">Plans & Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Current Plan Card */}
         <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-lg font-semibold text-primary mb-2">Pro Plan</h3>
               <div className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
               <p className="text-sm text-muted-foreground mb-6">You are on the Pro plan. Next billing date: Feb 14, 2026.</p>
               <Button className="w-full bg-primary text-primary-foreground">Manage Subscription</Button>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
         </div>

         {/* Usage Stats */}
         <div className="space-y-6 p-4 rounded-xl border border-[#2c2c2c] bg-[#1e1e1e]">
            <h4 className="font-medium text-sm">Usage limits</h4>
            
            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Members</span>
                  <span className="text-muted-foreground">3 / 20</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[15%] rounded-full"></div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Storage</span>
                  <span className="text-muted-foreground">2.1 GB / 100 GB</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 w-[2%] rounded-full"></div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Automations</span>
                  <span className="text-muted-foreground">450 / 5000</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[9%] rounded-full"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how Ninjawy looks on your device.</p>
      </div>
      
      <div className="space-y-4">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-4">
          <div 
            onClick={() => setTheme('light')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'light' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-white text-gray-900 border border-gray-200">
              <Sun className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">Light</span>
              {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <div 
            onClick={() => setTheme('dark')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'dark' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-[#0a0a0c] text-white border border-gray-800">
              <Moon className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">Dark</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <div 
            onClick={() => setTheme('system')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'system' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-[#1e1e1e] text-white border border-gray-700">
              <Monitor className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">System</span>
              {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">MZ</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button variant="outline" size="sm">Change Avatar</Button>
          <div className="text-xs text-muted-foreground">Recommended size 256x256px</div>
        </div>
      </div>

      <Separator className="bg-[#2c2c2c]" />

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Display Name</Label>
          <div className="text-sm text-white font-medium p-2 bg-[#2c2c2c] rounded-md border border-[#3c3c3c]">
            Mizot
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="text-sm text-white font-medium p-2 bg-[#2c2c2c] rounded-md border border-[#3c3c3c]">
            mizot@example.com
          </div>
          <p className="text-xs text-muted-foreground">Contact support to change email.</p>
        </div>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Task Assignments</Label>
            <p className="text-sm text-muted-foreground">Receive emails when you are assigned to a task.</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Separator className="bg-[#2c2c2c]" />
        
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Mentions & Comments</Label>
            <p className="text-sm text-muted-foreground">Receive notifications when someone mentions you.</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <Separator className="bg-[#2c2c2c]" />

        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Project Updates</Label>
            <p className="text-sm text-muted-foreground">Weekly digest of project activities.</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
