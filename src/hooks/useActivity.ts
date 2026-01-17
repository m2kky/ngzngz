import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { getErrorMessage } from '@/lib/errors';

export type ActivityLog = {
  id: string;
  record_type: string;
  record_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  users?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  };
};

export type CreateActivityLogInput = {
  recordType: string;
  recordId: string;
  actionType: string;
  metadata?: Record<string, unknown>;
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
        .select('*, users(full_name, nickname, avatar_url)')
        .eq('record_type', recordType)
        .eq('record_id', recordId)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(limit)
        .returns<ActivityLog[]>();

      if (error) throw error;
      setActivityLogs((data ?? []) as ActivityLog[]);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error fetching activity logs:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const addActivityLog = useCallback(async (input: CreateActivityLogInput) => {
    if (!user) throw new Error('User must be authenticated');
    if (!workspace) throw new Error('No workspace selected');

    try {
      setError(null);
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          record_type: input.recordType,
          record_id: input.recordId,
          user_id: user.id,
          workspace_id: workspace.id,
          action_type: input.actionType,
          metadata: input.metadata || {},
        })
        .select('*, users(full_name, nickname, avatar_url)')
        .returns<ActivityLog>()
        .single();

      if (error) throw error;
      
      // Update local state
      setActivityLogs(prev => [data as ActivityLog, ...prev]);
      return data as ActivityLog;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error adding activity log:', message);
      setError(message);
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
