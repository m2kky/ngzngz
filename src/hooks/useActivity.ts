import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

export type ActivityLog = {
  id: string;
  record_type: string;
  record_id: string;
  user_id: string;
  action_type: string;
  metadata: any;
  created_at: string;
};

export type CreateActivityLogInput = {
  recordType: string;
  recordId: string;
  actionType: string;
  metadata?: any;
};

export function useActivity() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityLogs = useCallback(async (recordType: string, recordId: string, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!workspace) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('record_type', recordType)
        .eq('record_id', recordId)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivityLogs(data as ActivityLog[]);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const addActivityLog = useCallback(async (input: CreateActivityLogInput) => {
    if (!user) throw new Error('User must be authenticated');
    if (!workspace) throw new Error('No workspace selected');

    try {
      setError(null);
      const { data, error } = await (supabase
        .from('activity_logs') as any)
        .insert({
          record_type: input.recordType,
          record_id: input.recordId,
          user_id: user.id,
          workspace_id: workspace.id,
          action_type: input.actionType,
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as ActivityLog;
    } catch (err: any) {
      console.error('Error adding activity log:', err);
      setError(err.message);
      throw err;
    }
  }, [user, workspace]);

  return {
    activityLogs,
    loading,
    error,
    fetchActivityLogs,
    addActivityLog,
  };
}