import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, LayoutGrid, Plus } from 'lucide-react';
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
}

export function MeetingAttendees({ meeting, attendees }: MeetingAttendeesProps) {
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
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                  {attendee.user.full_name?.charAt(0) || attendee.user.email.charAt(0)}
                </div>
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
