import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Video } from 'lucide-react';
import { format } from 'date-fns';
import type { Meeting } from '../../hooks/useMeetings';

interface MeetingsGridProps {
  meetings: Meeting[];
  onMeetingClick: (id: string) => void;
}

export function MeetingsGrid({ meetings, onMeetingClick }: MeetingsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => (
        <Card 
          key={meeting.id} 
          className="group hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col"
          onClick={() => onMeetingClick(meeting.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full">
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                  {meeting.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{format(new Date(meeting.start_time), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    {meeting.location.startsWith('http') ? (
                      <Video className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{meeting.location}</span>
                  </div>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider flex-shrink-0 ml-2 ${
                meeting.status === 'LIVE' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                meeting.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                'bg-primary/10 text-primary'
              }`}>
                {meeting.status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
              {meeting.description || 'No description provided.'}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t">
              <div className="flex -space-x-2">
                {meeting.meeting_attendees && meeting.meeting_attendees.length > 0 ? (
                  meeting.meeting_attendees.map((attendee) => (
                    <div 
                      key={attendee.user_id} 
                      className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
                      title={attendee.users?.full_name || 'Attendee'}
                    >
                      {attendee.users?.avatar_url ? (
                        <img 
                          src={attendee.users.avatar_url} 
                          alt={attendee.users.full_name || ''} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <span className="text-[10px] font-medium">
                          {attendee.users?.full_name 
                            ? attendee.users.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            : 'U'}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No attendees</span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
