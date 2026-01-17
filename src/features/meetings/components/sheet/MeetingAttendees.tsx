import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Briefcase, LayoutGrid, Plus, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import type { Meeting } from '../../hooks/useMeetings';

interface Attendee {
  id: string;
  user_id: string;
  role: string | null;
  speaking_topic: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  user: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface MeetingAttendeesProps {
  meeting: Meeting;
  attendees: Attendee[];
  onAddAttendee?: (userId: string) => void;
}

export function MeetingAttendees({ meeting, attendees, onAddAttendee }: MeetingAttendeesProps) {
  const { members } = useWorkspaceMembers();
  const [open, setOpen] = useState(false);

  // Filter out existing attendees
  const availableMembers = members.filter(
    member => !attendees.some(attendee => attendee.user_id === member.id)
  );

  return (
    <div className="m-0 p-6 space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Information</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Briefcase className="h-4 w-4" />
              Client
            </div>
            <div className="text-sm font-medium">{meeting.clients?.name || 'Internal'}</div>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <LayoutGrid className="h-4 w-4" />
              Project
            </div>
            <div className="text-sm font-medium">{meeting.projects?.name || 'No Project'}</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attendees ({attendees.length})</h3>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Search member..." />
                <CommandList>
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    {availableMembers.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.full_name || member.email}
                        onSelect={() => {
                          onAddAttendee?.(member.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 opacity-0`}
                        />
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="text-[10px]">
                              {member.full_name?.charAt(0) || member.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{member.full_name || member.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-[10px] font-bold">
                    {attendee.user.full_name?.charAt(0) || attendee.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{attendee.user.full_name || attendee.user.email}</div>
                  <div className="text-[10px] text-muted-foreground">{attendee.role || 'Attendee'}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5">
                {attendee.status}
              </Badge>
            </div>
          ))}
          {attendees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No attendees added yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
