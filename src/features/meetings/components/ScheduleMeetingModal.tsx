import { useState, useEffect } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useClients } from '@/features/clients/hooks/useClients';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface ScheduleMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Zod schema for validation
const meetingSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
  date: z.date({ 
    required_error: "Date is required",
    invalid_type_error: "Date is required"
  }),
  startTime: z.string({ required_error: "Start time is required" }).min(1, "Start time is required"),
  endTime: z.string({ required_error: "End time is required" }).min(1, "End time is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  attendees: z.array(z.string()).optional(),
}).refine((data) => {
  if (!data.date || !data.startTime || !data.endTime) return true;
  const start = new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.startTime}`);
  const end = new Date(`${format(data.date, 'yyyy-MM-dd')}T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type MeetingFormData = z.infer<typeof meetingSchema>;

export function ScheduleMeetingModal({ open, onOpenChange }: ScheduleMeetingModalProps) {
  const { createMeeting } = useMeetings();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { members } = useWorkspaceMembers();
  
  const [loading, setLoading] = useState(false);
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Auto-link client when project changes
  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project?.client_id) {
        setClientId(project.client_id);
      }
    }
  }, [projectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form...');
    setErrors({});

    // Prepare data for validation
    const formData: MeetingFormData = {
      title,
      date: date as Date,
      startTime,
      endTime,
      location,
      description,
      projectId: projectId === 'none' ? undefined : (projectId || undefined),
      clientId: clientId === 'none' ? undefined : (clientId || undefined),
      attendees
    };

    // Validate using Zod
    const result = meetingSchema.safeParse(formData);

    if (!result.success) {
      console.log('Validation failed:', result.error);
      const newErrors: Record<string, string> = {};
      
      // Fix: result.error.errors is an array, not undefined.
      // But we should check if it exists just in case (though safeParse returns it on failure)
      if (result.error && Array.isArray(result.error.errors)) {
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
      }
      
      setErrors(newErrors);
      
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      
      return;
    }

    try {
      setLoading(true);
      
      const startDateTime = new Date(`${format(date!, 'yyyy-MM-dd')}T${startTime}`).toISOString();
      const endDateTime = new Date(`${format(date!, 'yyyy-MM-dd')}T${endTime}`).toISOString();

      await createMeeting({
        title,
        description,
        start_time: startDateTime,
        end_time: endDateTime,
        location,
        project_id: projectId === 'none' ? null : (projectId || null),
        client_id: clientId === 'none' ? null : (clientId || null),
        attendees,
      });

      toast.success('Meeting scheduled successfully');
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDate(undefined);
      setStartTime('');
      setEndTime('');
      setLocation('');
      setDescription('');
      setProjectId('');
      setClientId('');
      setAttendees([]);
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : 'Failed to schedule meeting';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (userId: string) => {
    setAttendees(current => 
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId]
    );
  };

  const removeAttendee = (userId: string) => {
    setAttendees(current => current.filter(id => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
          <DialogDescription>
            Fill in the meeting details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form id="schedule-meeting-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Sync"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                  {errors.date}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <TimePicker 
                  value={startTime} 
                  onChange={setStartTime}
                  className={errors.startTime ? "border-destructive" : ""}
                />
                {errors.startTime && (
                  <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <TimePicker 
                  value={endTime} 
                  onChange={setEndTime}
                  className={errors.endTime ? "border-destructive" : ""}
                />
                {errors.endTime && (
                  <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project & Client Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId} disabled={!!projectId && !!projects.find(p => p.id === projectId)?.client_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  <span className="text-muted-foreground">Select attendees...</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search members..." />
                  <CommandList>
                    <CommandEmpty>No member found.</CommandEmpty>
                    <CommandGroup>
                      {members.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.full_name}
                          onSelect={() => {
                            toggleAttendee(member.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              attendees.includes(member.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            {member.avatar_url && <img src={member.avatar_url} alt="" className="w-5 h-5 rounded-full" />}
                            <span>{member.full_name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Selected Attendees Chips */}
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attendees.map((userId) => {
                  const member = members.find(m => m.id === userId);
                  return (
                    <Badge key={userId} variant="secondary" className="gap-1 pr-1">
                      {member?.full_name || 'Unknown User'}
                      <button
                        type="button"
                        onClick={() => removeAttendee(userId)}
                        className="ml-1 hover:bg-muted p-0.5 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location / Link</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Meeting link or office room"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this meeting about?"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="schedule-meeting-form" 
              disabled={loading}
              className="cursor-pointer transition-transform active:scale-95"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
