import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { 
  FileText,
  MessageSquare,
  Paperclip,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Meeting } from '../hooks/useMeetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { CommentsActivity } from '@/components/records/CommentsActivity';
import { MeetingHeader } from './sheet/MeetingHeader';
import { MeetingNotes } from './sheet/MeetingNotes';
import { MeetingAttendees } from './sheet/MeetingAttendees';
import { MeetingAssets } from './sheet/MeetingAssets';
import { Loader2 } from 'lucide-react';
import { useUpdateRecord } from '@/hooks/useUpdateRecord';

interface MeetingSheetProps {
  meetingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function MeetingSheet({ meetingId, open, onOpenChange }: MeetingSheetProps) {
  const { workspace } = useWorkspace();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const { updateRecord, updating } = useUpdateRecord();

  useEffect(() => {
    if (open && meetingId) {
      fetchMeetingDetails();
    }
  }, [open, meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          clients (id, name),
          projects (id, name)
        `)
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;
      setMeeting(meetingData as Meeting);
      setNotes(meetingData.description || '');

      // Fetch attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('meeting_attendees')
        .select(`
          *,
          user:users (full_name, email, avatar_url)
        `)
        .eq('meeting_id', meetingId);

      if (attendeesError) throw attendeesError;
      setAttendees(attendeesData as any);

      // Fetch assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('meeting_assets')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;
      
      setMeeting(prev => prev ? { ...prev, meeting_assets: assetsData } : null);

    } catch (error: unknown) {
      console.error('Error fetching meeting details:', error);
      toast.error('Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = async (newNotes: string) => {
    setNotes(newNotes);
    // In a real app, we'd debounced save here
  };

  const saveNotes = async () => {
    if (!meetingId) return;
    try {
      await updateRecord(
        'meeting',
        meetingId,
        { description: notes }
      );
      toast.success('Notes saved');
    } catch (error: unknown) {
      toast.error('Failed to save notes');
    }
  };

  const handleAddAttendee = async (userId: string) => {
    if (!meetingId) return;
    try {
      const { error } = await supabase
        .from('meeting_attendees')
        .insert({
          meeting_id: meetingId,
          user_id: userId,
          status: 'PENDING'
        });

      if (error) throw error;
      
      toast.success('Attendee added successfully');
      fetchMeetingDetails();
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast.error('Failed to add attendee');
    }
  };

  const handleUploadAsset = () => {
    // This will be triggered by the child component, just refresh needed
    fetchMeetingDetails();
  };

  if (!meetingId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col h-full border-l">
        <SheetTitle className="sr-only">Meeting Details</SheetTitle>
        <SheetDescription className="sr-only">Manage meeting details, attendees, and assets</SheetDescription>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : meeting ? (
          <>
            <MeetingHeader meeting={meeting} />

            <Tabs defaultValue="notes" className="flex-1 flex flex-col">
              <div className="px-6 border-b">
                <TabsList className="bg-transparent border-b-0 h-12 w-full justify-start gap-6 p-0">
                  <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2">
                    <FileText className="h-4 w-4" />
                    Meeting Notes
                  </TabsTrigger>
                  <TabsTrigger value="properties" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2">
                    <Users className="h-4 w-4" />
                    Attendees
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2">
                    <Paperclip className="h-4 w-4" />
                    Assets
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="notes">
                  <MeetingNotes 
                    notes={notes} 
                    onNotesChange={handleNotesChange} 
                    onSave={saveNotes} 
                    loading={updating}
                  />
                </TabsContent>

                <TabsContent value="properties">
                  <MeetingAttendees 
                    meeting={meeting} 
                    attendees={attendees}
                    onAddAttendee={handleAddAttendee}
                  />
                </TabsContent>

                <TabsContent value="assets">
                  <MeetingAssets 
                    meeting={meeting} 
                    onAssetUploaded={fetchMeetingDetails}
                  />
                </TabsContent>

                <TabsContent value="comments" className="m-0 p-0 flex flex-col h-full">
                  <CommentsActivity recordType="meeting" recordId={meetingId} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">Meeting not found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
