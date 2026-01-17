import { useState } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { ScheduleMeetingModal } from '../components/ScheduleMeetingModal';
import { MeetingSheet } from '../components/MeetingSheet';
import { MeetingsCalendar } from '../components/MeetingsCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Calendar, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MeetingsToolbar, type ViewType } from '../components/views/MeetingsToolbar';
import { MeetingsList } from '../components/views/MeetingsList';
import { MeetingsGrid } from '../components/views/MeetingsGrid';

export function MeetingsPage() {
  const { meetings, loading, error } = useMeetings();
  const [view, setView] = useState<ViewType>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleOpenMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setIsSheetOpen(true);
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading meetings: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <MeetingsToolbar 
        view={view}
        onViewChange={setView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        onNewMeeting={() => setIsModalOpen(true)}
        totalMeetings={filteredMeetings.length}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mb-2">No meetings found</CardTitle>
          <p className="text-muted-foreground max-w-sm mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? "No meetings match your current filters. Try adjusting them."
              : "You don't have any meetings scheduled yet. Create your first meeting to get started."}
          </p>
          <Button variant="outline" className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {searchQuery || statusFilter !== 'all' ? "Clear Filters" : "Schedule Meeting"}
          </Button>
        </Card>
      ) : view === 'calendar' ? (
        <MeetingsCalendar 
          meetings={filteredMeetings} 
          onMeetingClick={handleOpenMeeting} 
        />
      ) : view === 'list' ? (
        <MeetingsList 
          meetings={filteredMeetings} 
          onMeetingClick={handleOpenMeeting} 
        />
      ) : (
        <MeetingsGrid 
          meetings={filteredMeetings} 
          onMeetingClick={handleOpenMeeting} 
        />
      )}

      <ScheduleMeetingModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      <MeetingSheet
        meetingId={selectedMeetingId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
