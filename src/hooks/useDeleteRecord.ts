import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { RecordType } from '@/types/record';

export function useDeleteRecord() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [deleting, setDeleting] = useState(false);

  const archiveRecord = async (type: RecordType, id: string) => {
    if (!workspace || !user) throw new Error('Not authenticated');
    
    setDeleting(true);
    try {
      const table = type === 'task' ? 'tasks' : type === 'project' ? 'projects' : 'clients';
      
      const { error } = await (supabase
        .from(table) as any)
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Log activity
      await (supabase.from('activity_log') as any).insert({
        workspace_id: workspace.id,
        user_id: user.id,
        record_type: type,
        record_id: id,
        action_type: 'archived',
        metadata: {},
      });

      return true;
    } catch (error) {
      console.error('Error archiving record:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const deleteRecord = async (type: RecordType, id: string) => {
    if (!workspace || !user) throw new Error('Not authenticated');
    
    setDeleting(true);
    try {
      const table = type === 'task' ? 'tasks' : type === 'project' ? 'projects' : 'clients';
      
      // For now, we do a hard delete
      // In production, you might want to do soft delete
      const { error } = await (supabase
        .from(table) as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log activity (optional - might fail if record is gone)
      try {
        await (supabase.from('activity_log') as any).insert({
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
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { archiveRecord, deleteRecord, deleting };
}
