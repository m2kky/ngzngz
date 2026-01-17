import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { RecordType } from '@/types/record';
import type { Database } from '@/types/database.types';

type TableNameFromType<T extends RecordType> =
  T extends 'task' ? 'tasks' :
  T extends 'project' ? 'projects' :
  T extends 'client' ? 'clients' :
  'meetings';

type TableRowFromType<T extends RecordType> =
  Database['public']['Tables'][TableNameFromType<T>]['Row'];

type TableUpdateFromType<T extends RecordType> =
  Database['public']['Tables'][TableNameFromType<T>]['Update'];

export function useUpdateRecord() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [updating, setUpdating] = useState(false);

  const updateRecord = async <T extends RecordType>(
    type: T,
    id: string,
    updates: Partial<TableUpdateFromType<T>>,
    oldRecord?: Partial<TableRowFromType<T>>
  ): Promise<TableRowFromType<T>> => {
    setUpdating(true);
    try {
      const table = 
        type === 'task' ? 'tasks' : 
        type === 'project' ? 'projects' : 
        type === 'client' ? 'clients' : 
        'meetings';
      
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity for each changed field
      if (user && workspace && oldRecord) {
        const changedFields = Object.keys(updates).filter((key) => (oldRecord as Record<string, unknown>)[key] !== (updates as Record<string, unknown>)[key]);

        for (const field of changedFields) {
          await supabase.from('activity_logs').insert({
            workspace_id: workspace.id,
            user_id: user.id,
            record_type: type,
            record_id: id,
            action_type: field === 'status' ? 'status_changed' : 'updated',
            metadata: {
              field,
              old_value: (oldRecord as Record<string, unknown>)[field],
              new_value: (updates as Record<string, unknown>)[field],
            },
          });
        }
      } else if (user && workspace) {
        // If no old record, just log a generic update
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: type,
          record_id: id,
          action_type: 'updated',
          metadata: { fields: Object.keys(updates) },
        });
      }

      return data as TableRowFromType<T>;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating record:', message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updateRecord, updating };
}
