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
};

export type CreateMeetingInput = Database['public']['Tables']['meetings']['Insert'];

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

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...input,
          workspace_id: workspace.id,
          status: input.status || 'SCHEDULED',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMeetings();
      return data as Meeting;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating meeting:', message);
      throw err;
    }
  };

  return { meetings, loading, error, createMeeting, refresh: fetchMeetings };
}
