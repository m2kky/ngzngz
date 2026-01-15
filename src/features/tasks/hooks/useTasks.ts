import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Task, CreateTaskInput } from '../types';

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
        await (supabase.from('activity_log') as any).insert({
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

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!workspace) return;

    try {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));

      const { error } = await (supabase
        .from('tasks') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('workspace_id', workspace.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating task:', err);
      fetchTasks();
      throw err;
    }
  };

  return { tasks, loading, error, createTask, updateTask, refresh: fetchTasks };
}
