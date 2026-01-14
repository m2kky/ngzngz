import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

// Temporary until types are generated
export type Client = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: 'active' | 'inactive' | 'archived';
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateClientInput = {
  name: string;
  slug: string;
  status?: 'active' | 'inactive';
  primary_contact_name?: string;
  primary_contact_email?: string;
  website?: string;
};

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
        .from('clients' as any)
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
        .from('clients' as any)
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
