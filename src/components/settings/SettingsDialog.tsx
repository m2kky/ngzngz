import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Monitor, 
  CreditCard, 
  Users, 
  Building,
  Check,
  Moon,
  Sun,
  Mail,
  Loader2,
  Trash2,
  Copy
} from 'lucide-react';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useInvitations } from '@/hooks/useInvitations';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
              <h2 className="text-sm font-semibold text-white mb-1">
                {profile?.full_name || profile?.nickname || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <span>{profile?.email}</span>
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
                {activeTab === 'workspace' && <WorkspaceGeneralSettings />}
                {activeTab === 'members' && <MembersSettings />}
                {activeTab === 'billing' && <BillingSettings />}
              </div>
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
  const { members, loading: membersLoading } = useWorkspaceMembers();
  const { invitations, createInvitation, revokeInvitation, fetchInvitations } = useInvitations();
  const { workspace } = useWorkspace();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);

  // Initial fetch of invitations
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvite = async () => {
     if (!inviteEmail) return;
     setIsInviting(true);
     try {
        await createInvitation({ email: inviteEmail, role: inviteRole });
        setShowInviteDialog(false);
        setInviteEmail('');
        setInviteRole('member');
     } catch (err) {
        // Error handling matches global patterns; simplified for brevity
        console.error(err);
     } finally {
        setIsInviting(false);
     }
  };

  const copyInviteLink = (token: string) => {
     const link = `${window.location.origin}/invite/${token}`;
     navigator.clipboard.writeText(link);
     // In a real app, show a toast here
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Members</h2>
          <p className="text-sm text-muted-foreground">Manage workspace access and roles.</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
           <DialogTrigger asChild>
             <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
               <Mail className="w-4 h-4 mr-2" />
               Invite Member
             </Button>
           </DialogTrigger>
           <DialogContent className="bg-[#191919] border-[#2c2c2c] text-white">
              <DialogHeader>
                 <DialogTitle>Invite Member</DialogTitle>
                 <DialogDescription>
                    Send an invitation to join {workspace?.name}.
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                       placeholder="colleague@example.com" 
                       value={inviteEmail}
                       onChange={(e) => setInviteEmail(e.target.value)}
                       className="bg-[#2c2c2c] border-[#3c3c3c] text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                       <SelectTrigger className="bg-[#2c2c2c] border-[#3c3c3c] text-white">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                 <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                    {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send Invite
                 </Button>
              </div>
           </DialogContent>
        </Dialog>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
         <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Invitations</h3>
            <div className="rounded-lg border border-[#2c2c2c] divide-y divide-[#2c2c2c]">
               {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-[#1e1e1e]/50">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#2c2c2c] flex items-center justify-center text-muted-foreground">
                           <Mail className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="font-medium text-sm">{inv.email}</div>
                           <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{inv.role}</span>
                              <span>•</span>
                              <span>Expires in 7 days</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8" onClick={() => copyInviteLink(inv.token)}>
                           <Copy className="w-3.5 h-3.5 mr-2" />
                           Copy Link
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => revokeInvitation(inv.id)}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Active Members List */}
      <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Members</h3>
      <div className="rounded-lg border border-[#2c2c2c] divide-y divide-[#2c2c2c] min-h-[100px]">
        {membersLoading ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
               <Loader2 className="w-5 h-5 animate-spin mr-2" />
               Loading members...
            </div>
        ) : members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
               <Avatar>
                 <AvatarImage src={member.avatar_url} />
                 <AvatarFallback className="bg-[#2c2c2c] text-xs">{(member.full_name || member.email).substring(0,2).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div>
                  <div className="font-medium text-sm">{member.full_name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="capitalize bg-[#2c2c2c] border-[#3c3c3c] text-muted-foreground font-normal">
                  {member.role}
               </Badge>
            </div>
          </div>
        ))}
      </div>
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
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNickname(profile.nickname || '');
      setTitle(profile.title || '');
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      alert('تم تحديث الصورة بنجاح! 📸');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('فشل رفع الصورة. حاول مرة أخرى.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        full_name: fullName,
        nickname: nickname,
        title: title,
      });
      alert('تم حفظ التعديلات بنجاح! ✅');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('فشل حفظ التعديلات. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-6 h-6 animate-spin text-primary" />
       </div>
     );
  }

  const initials = (profile?.full_name || profile?.email || '??').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-[#2c2c2c]">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#2c2c2c] border-[#3c3c3c]"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isUploading ? 'Uploading...' : 'Change Avatar'}
          </Button>
          <div className="text-xs text-muted-foreground">Recommended size 256x256px</div>
        </div>
      </div>

      <Separator className="bg-[#2c2c2c]" />

      <div className="space-y-4 max-w-md">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input 
            id="nickname" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Job Title / Role</Label>
          <Input 
            id="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Product Designer"
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="text-sm text-muted-foreground p-2 bg-[#2c2c2c]/50 rounded-md border border-[#3c3c3c] cursor-not-allowed">
            {profile?.email}
          </div>
          <p className="text-xs text-muted-foreground">Contact support to change email.</p>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
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
