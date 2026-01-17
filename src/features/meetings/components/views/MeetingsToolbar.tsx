import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, FilterX, List, LayoutGrid, CalendarDays, Plus } from 'lucide-react';

export type ViewType = 'list' | 'grid' | 'calendar';

interface MeetingsToolbarProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
  onNewMeeting: () => void;
  totalMeetings: number;
}

export function MeetingsToolbar({
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  onNewMeeting,
  totalMeetings
}: MeetingsToolbarProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Manage your workspace schedules and calls.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('list')}
              className="h-8 w-8 p-0"
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('grid')}
              className="h-8 w-8 p-0"
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('calendar')}
              className="h-8 w-8 p-0"
              title="Calendar View"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-2" onClick={onNewMeeting}>
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 px-2">
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {totalMeetings} meetings
        </div>
      </div>
    </div>
  );
}
