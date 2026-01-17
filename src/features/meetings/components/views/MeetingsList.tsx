import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Video } from 'lucide-react';
import { format } from 'date-fns';
import type { Meeting } from '../../hooks/useMeetings';

interface MeetingsListProps {
  meetings: Meeting[];
  onMeetingClick: (id: string) => void;
}

export function MeetingsList({ meetings, onMeetingClick }: MeetingsListProps) {
  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Card 
          key={meeting.id} 
          className="group hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => onMeetingClick(meeting.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {meeting.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(meeting.start_time), 'MMM d, h:mm a')}
                  </div>
                  {meeting.location && (
                    <div className="flex items-center gap-1">
                      {meeting.location.startsWith('http') ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                      <span className="truncate max-w-[150px]">{meeting.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                meeting.status === 'LIVE' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                meeting.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                'bg-primary/10 text-primary'
              }`}>
                {meeting.status}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {meeting.description || 'No description provided.'}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                {/* Attendees placeholder - would need actual attendee data here */}
                {[1, 2].map((i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                    U{i}
                  </div>
                ))}
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
