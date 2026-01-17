import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

export type Meeting = Database['public']['Tables']['meetings']['Row'] & {
  clients?: {
    id: string;
    name: string;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
  meeting_attendees?: {
    user_id: string;
    users?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
  meeting_assets?: {
    id: string;
    name: string;
    url: string;
    type: string | null;
    size_bytes: number | null;
    created_at: string;
  }[];
};

export type CreateMeetingInput = Database['public']['Tables']['meetings']['Insert'] & {
  attendees?: string[]; // Array of user_ids
};

export function useMeetings() {
  const { workspace } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          clients (
            id,
            name
          ),
          projects (
            id,
            name
          ),
          meeting_attendees (
            user_id,
            users (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setMeetings(data as Meeting[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching meetings:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  const createMeeting = async (input: CreateMeetingInput) => {
    if (!workspace) throw new Error('No workspace selected');

    const { attendees, ...meetingData } = input;

    try {
      // 1. Create the meeting
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...meetingData,
          workspace_id: workspace.id,
          status: meetingData.status || 'SCHEDULED',
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Add attendees if any
      if (attendees && attendees.length > 0) {
        const attendeesToInsert = attendees.map(userId => ({
          meeting_id: data.id,
          user_id: userId,
          status: 'PENDING'
        }));

        const { error: attendeesError } = await supabase
          .from('meeting_attendees')
          .insert(attendeesToInsert);

        if (attendeesError) {
          console.error('Error adding attendees:', attendeesError);
          // We don't throw here to avoid failing the whole creation, but we could
        }
      }

      await fetchMeetings(); // Refresh list after creation
      return data as Meeting;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating meeting:', message);
      throw err;
    }
  };

  return { meetings, loading, error, createMeeting, refresh: fetchMeetings };
}
