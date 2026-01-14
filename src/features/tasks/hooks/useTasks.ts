import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

// Temporary type until we generate types from schema
export type Task = {
  id: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'internal_review' | 'client_review' | 'approved' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  assignee_ids: string[];
  client_id: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = {
  title: string;
  status?: Task['status'];
  priority?: Task['priority'];
  due_date?: string | null;
  client_id?: string | null;
  project_id?: string | null;
};

export function useTasks() {
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('tasks') as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data as Task[]);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [workspace?.id]);

  const createTask = async (input: CreateTaskInput) => {
    if (!workspace) throw new Error('No workspace selected');

    try {
      const { data, error } = await (supabase
        .from('tasks') as any)
        .insert({
          ...input,
          workspace_id: workspace.id,
          status: input.status || 'backlog',
          priority: input.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity for task creation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from('activity_logs') as any).insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: 'task',
          record_id: data.id,
          action_type: 'created',
          metadata: { title: input.title },
        });
      }

      // Update local state
      setTasks(prev => [data as Task, ...prev]);
      return data as Task;
    } catch (err: unknown) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  return { tasks, loading, error, createTask, refresh: fetchTasks };
}
