import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { RecordType } from '@/types/record';

export function useUpdateRecord() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [updating, setUpdating] = useState(false);

  const updateRecord = async (
    type: RecordType,
    id: string,
    updates: Record<string, unknown>,
    oldRecord?: Record<string, unknown>
  ) => {
    setUpdating(true);
    try {
      const table = type === 'task' ? 'tasks' : type === 'project' ? 'projects' : 'clients';
      
      const { data, error } = await (supabase
        .from(table) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity for each changed field
      if (user && workspace && oldRecord) {
        const changedFields = Object.keys(updates).filter(
          key => oldRecord[key] !== updates[key]
        );

        for (const field of changedFields) {
          await (supabase.from('activity_log') as any).insert({
            workspace_id: workspace.id,
            user_id: user.id,
            record_type: type,
            record_id: id,
            action_type: field === 'status' ? 'status_changed' : 'updated',
            metadata: {
              field,
              old_value: oldRecord[field],
              new_value: updates[field],
            },
          });
        }
      } else if (user && workspace) {
        // If no old record, just log a generic update
        await (supabase.from('activity_log') as any).insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: type,
          record_id: id,
          action_type: 'updated',
          metadata: { fields: Object.keys(updates) },
        });
      }

      return data;
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateRecord, updating };
}
