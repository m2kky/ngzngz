import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { RecordType } from '@/types/record';
import type { Database } from '@/types/database.types';

export function useDeleteRecord() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [deleting, setDeleting] = useState(false);

  const archiveRecord = async (type: RecordType, id: string) => {
    if (!workspace || !user) throw new Error('Not authenticated');
    
    setDeleting(true);
    try {
      const table = type === 'task' ? 'tasks' as const : type === 'project' ? 'projects' as const : 'clients' as const;
      
      const { error } = await supabase
        .from(table)
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        record_type: type,
        record_id: id,
        action_type: 'archived',
        metadata: {},
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error archiving record:', message);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const deleteRecord = async (type: RecordType, id: string) => {
    if (!workspace || !user) throw new Error('Not authenticated');
    
    setDeleting(true);
    try {
      const table = type === 'task' ? 'tasks' as const : type === 'project' ? 'projects' as const : 'clients' as const;
      
      // For now, we do a hard delete
      // In production, you might want to do soft delete
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log activity (optional - might fail if record is gone)
      try {
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: type,
          record_id: id,
          action_type: 'deleted',
          metadata: {},
        });
      } catch {
        // Ignore activity log errors for delete
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error deleting record:', message);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  return { archiveRecord, deleteRecord, deleting };
}
