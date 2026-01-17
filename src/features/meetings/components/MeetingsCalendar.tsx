import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Meeting } from '../hooks/useMeetings';

interface MeetingsCalendarProps {
  meetings: Meeting[];
  onMeetingClick: (id: string) => void;
}

export function MeetingsCalendar({ meetings, onMeetingClick }: MeetingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayMeetings = meetings.filter(m => isSameDay(new Date(m.start_time), day));
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] border-r border-b p-2 transition-colors",
                !isCurrentMonth && "bg-muted/20",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  !isCurrentMonth && "opacity-30"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => onMeetingClick(meeting.id)}
                    className={cn(
                      "w-full text-left p-1.5 rounded text-[10px] leading-tight transition-all truncate hover:ring-1 ring-primary/50",
                      meeting.status === 'LIVE' ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                      meeting.status === 'COMPLETED' ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                      "bg-primary/5 text-primary border border-primary/10"
                    )}
                  >
                    <div className="font-semibold truncate">{meeting.title}</div>
                    <div className="flex items-center gap-1 opacity-70">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(meeting.start_time), 'h:mm a')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
