import { useState, useEffect } from 'react';
import { Mail, Copy, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useInvitations } from '@/hooks/useInvitations';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useRoles } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export function MembersSettings() {
  const { members, loading: membersLoading } = useWorkspaceMembers();
  const { invitations, createInvitation, createInviteLink, revokeInvitation, fetchInvitations } = useInvitations();
  const { workspace } = useWorkspace();
  const { assignableRoles, roles, isLoading: rolesLoading } = useRoles();
  const { can } = usePermissions();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isInviting, setIsInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Initial fetch of invitations
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvite = async () => {
     if (!inviteEmail || !selectedRoleId) return;
     setIsInviting(true);
     try {
        await createInvitation({ email: inviteEmail, role_id: selectedRoleId });
        await fetchInvitations();
        setShowInviteDialog(false);
        setInviteEmail('');
        setSelectedRoleId('');
        toast.success('Invitation sent successfully');
     } catch (err: unknown) {
        toast.error(getErrorMessage(err) || 'Failed to send invitation');
     } finally {
        setIsInviting(false);
     }
  };

  const handleGenerateLink = async () => {
    if (!selectedRoleId) return;
    setIsInviting(true);
    try {
      const link = await createInviteLink(selectedRoleId);
      await fetchInvitations();
      setGeneratedLink(link);
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Failed to generate link');
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = (token: string) => {
     const link = `${window.location.origin}/invite/${token}`;
     navigator.clipboard.writeText(link);
     toast.success('Link copied to clipboard');
  };

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return 'Unknown';
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  const getRoleColor = (roleId: string | null) => {
    if (!roleId) return '#6366f1';
    const role = roles.find(r => r.id === roleId);
    return role?.color || '#6366f1';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Members</h2>
          <p className="text-sm text-muted-foreground">Manage workspace access and roles.</p>
        </div>
        {can.create('settings') && (
          <Dialog open={showInviteDialog} onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) setGeneratedLink(null);
          }}>
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
                    <Label>Role</Label>
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                       <SelectTrigger className="bg-[#2c2c2c] border-[#3c3c3c] text-white">
                          <SelectValue placeholder="Select a role" />
                       </SelectTrigger>
                       <SelectContent>
                          {rolesLoading ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">Loading roles...</div>
                          ) : (
                            assignableRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: role.color || '#6366f1' }} 
                                  />
                                  {role.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                       </SelectContent>
                    </Select>
                 </div>

                 {/* Invite Methods Tabs or simple divider */}
                 <div className="grid grid-cols-1 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Invite by Email</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="colleague@example.com" 
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="bg-[#2c2c2c] border-[#3c3c3c] text-white"
                        />
                        <Button onClick={handleInvite} disabled={isInviting || !inviteEmail || !selectedRoleId}>
                          {isInviting && inviteEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#2c2c2c]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#191919] px-2 text-muted-foreground">Or share a link</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Direct Link</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-[#2c2c2c] border border-[#3c3c3c] rounded-md px-3 py-2 text-sm text-muted-foreground truncate h-10 flex items-center">
                          {generatedLink || 'Select a role to generate link'}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleGenerateLink} 
                          disabled={isInviting || !selectedRoleId}
                          className="border-[#3c3c3c] hover:bg-[#2c2c2c]"
                        >
                          {isInviting && !inviteEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                        </Button>
                      </div>
                      {generatedLink && (
                        <p className="text-xs text-green-500">Link copied to clipboard! Anyone with this link can join.</p>
                      )}
                    </div>
                 </div>
              </div>
              <div className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>Close</Button>
              </div>
           </DialogContent>
        </Dialog>
        )}
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
                              {/* Use role_id to look up role name, fallback to inv.role if available */}
                              <div className="flex items-center gap-1.5">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full" 
                                  style={{ backgroundColor: getRoleColor(inv.role_id) }} 
                                />
                                <span>{getRoleName(inv.role_id) || inv.role || 'Unknown Role'}</span>
                              </div>
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
                 <AvatarImage src={member.avatar_url || undefined} />
                 <AvatarFallback className="bg-[#2c2c2c] text-xs">{(member.full_name || member.email).substring(0,2).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div>
                  <div className="font-medium text-sm">{member.full_name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               {/* Note: member.role is currently a string in useWorkspaceMembers, 
                   ideally we should join with roles table in backend or map it here if we have role_id.
                   Assuming member object has role_id or role name. 
                   If it's just a name string from old system, we display it. 
                   If we updated backend to return role object, we could use that.
                   For now, we just display what we have.
               */}
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
