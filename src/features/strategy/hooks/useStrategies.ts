import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

export type Strategy = Database['public']['Tables']['strategies']['Row'] & {
  clients?: { name: string } | null;
};

export type CreateStrategyInput = Omit<
  Database['public']['Tables']['strategies']['Insert'],
  'id' | 'workspace_id' | 'created_at' | 'updated_at'
>;

export type UpdateStrategyInput = Partial<CreateStrategyInput>;

export function useStrategies() {
  const { workspace } = useWorkspace();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('strategies')
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data as Strategy[]);
    } catch (err: any) {
      console.error('Error fetching strategies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, [workspace?.id]);

  const createStrategy = async (input: CreateStrategyInput) => {
    if (!workspace) throw new Error('No workspace selected');

    try {
      const { data, error } = await supabase
        .from('strategies')
        .insert({
          ...input,
          workspace_id: workspace.id,
          status: input.status || 'draft',
        })
        .select(`
          *,
          clients:client_id (name)
        `)
        .single();

      if (error) throw error;

      // Log activity for strategy creation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: 'strategy',
          record_id: data.id,
          action_type: 'created',
          metadata: { title: input.title },
        });
      }

      // Update local state
      setStrategies(prev => [data as Strategy, ...prev]);
      return data as Strategy;
    } catch (err: unknown) {
      console.error('Error creating strategy:', err);
      throw err;
    }
  };

  const updateStrategy = async (strategyId: string, updates: UpdateStrategyInput) => {
    if (!workspace) return;

    try {
      // Optimistic update
      setStrategies(prev => prev.map(s => 
        s.id === strategyId ? { ...s, ...updates } : s
      ));

      const { error } = await supabase
        .from('strategies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', strategyId)
        .eq('workspace_id', workspace.id);

      if (error) throw error;
      
      // Refresh to get updated client relation
      fetchStrategies();
    } catch (err: any) {
      console.error('Error updating strategy:', err);
      fetchStrategies();
      throw err;
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    if (!workspace) return;

    try {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId)
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      // Update local state
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
    } catch (err: any) {
      console.error('Error deleting strategy:', err);
      throw err;
    }
  };

  return { 
    strategies, 
    loading, 
    error, 
    createStrategy, 
    updateStrategy, 
    deleteStrategy,
    refresh: fetchStrategies 
  };
}