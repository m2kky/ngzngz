import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

export type Client = Database['public']['Tables']['clients']['Row'];
export type CreateClientInput = Database['public']['Tables']['clients']['Insert'];

export function useClients() {
  const { workspace } = useWorkspace();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('name');

      if (error) throw error;
      setClients(data as Client[]);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [workspace?.id]);

  const createClient = async (input: CreateClientInput) => {
    if (!workspace) throw new Error('No workspace selected');

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...input,
          workspace_id: workspace.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setClients(prev => [...prev, data as Client]);
      return data as Client;
    } catch (err: any) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  return { clients, loading, error, createClient, refresh: fetchClients };
}
