"use client";

import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Database } from '@/types/database.types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { cn } from '@/lib/utils';

type Task = Database['public']['Tables']['tasks']['Row'];

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
  allDay?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  high: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  urgent: 'bg-red-500/20 border-red-500/50 text-red-300',
};

const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const priorityClass = PRIORITY_COLORS[event.resource.priority] || 'bg-gray-500/20 border-gray-500/50 text-gray-300';
  
  return (
    <div className={cn(
      "px-2 py-1 text-xs rounded border-l-2 truncate cursor-pointer transition-colors hover:bg-opacity-30",
      priorityClass
    )}>
      {event.title}
    </div>
  );
};

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const events = useMemo(() => {
    return tasks
      .filter(task => task.due_date) // Only tasks with due dates
      .map(task => {
        const date = new Date(task.due_date!);
        return {
          id: task.id,
          title: task.title,
          start: date,
          end: date,
          resource: task,
          allDay: true,
        };
      });
  }, [tasks]);

  const handleSelectEvent = (event: CalendarEvent) => {
    onTaskClick?.(event.id);
  };

  return (
    <div className="h-full p-4 calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="h-full"
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        components={{
          event: EventComponent
        }}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  );
}
