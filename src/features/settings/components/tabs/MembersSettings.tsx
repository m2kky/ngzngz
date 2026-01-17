import { useState, useEffect } from 'react';
import { Mail, Copy, Trash2, Loader2 } from 'lucide-react';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useInvitations } from '@/hooks/useInvitations';
import { useWorkspace } from '@/hooks/useWorkspace';
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

import { InviteModal } from '@/components/invites/invite-modal';

export function MembersSettings() {
  const { members, loading: membersLoading } = useWorkspaceMembers();
  const { invitations, revokeInvitation, fetchInvitations } = useInvitations();
  
  // Initial fetch of invitations
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

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
        <InviteModal>
           <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
             <Mail className="w-4 h-4 mr-2" />
             Invite Member
           </Button>
        </InviteModal>
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
                 <AvatarImage src={member.avatar_url || undefined} />
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
