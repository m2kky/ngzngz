import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  CalendarPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../../lib/calendar-links';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Meeting } from '../../hooks/useMeetings';

interface MeetingHeaderProps {
  meeting: Meeting;
}

export function MeetingHeader({ meeting }: MeetingHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED': return 'bg-muted text-muted-foreground border-transparent';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="p-6 pb-4 border-b space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={getStatusColor(meeting.status)}>
          {meeting.status}
        </Badge>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <CalendarPlus className="h-3.5 w-3.5" />
                Add to Calendar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(getGoogleCalendarLink(meeting), '_blank')}>
                Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(getOutlookCalendarLink(meeting), '_blank')}>
                Outlook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {meeting.meeting_link && (
            <Button size="sm" className="gap-2 h-8" onClick={() => window.open(meeting.meeting_link!, '_blank')}>
              <Video className="h-3.5 w-3.5" />
              Join Meeting
            </Button>
          )}
        </div>
      </div>
      <SheetTitle className="text-2xl font-bold">{meeting.title}</SheetTitle>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          {format(new Date(meeting.start_time), 'EEEE, MMMM do')}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
        </div>
        {meeting.location && (
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <MapPin className="h-4 w-4" />
            {meeting.location}
          </div>
        )}
      </div>
    </div>
  );
}
