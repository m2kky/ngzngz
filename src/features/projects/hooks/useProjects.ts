import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

// Temporary type until we generate types from schema
export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  client_id: string | null;
  owner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
  } | null;
};

export type CreateProjectInput = {
  name: string;
  client_id?: string | null;
  description?: string;
  status?: Project['status'];
  start_date?: string | null;
  end_date?: string | null;
};

export function useProjects() {
  const { workspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects' as any)
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as any);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [workspace?.id]);

  const createProject = async (input: CreateProjectInput) => {
    if (!workspace) throw new Error('No workspace selected');

    try {
      const { data, error } = await supabase
        .from('projects' as any)
        .insert({
          ...input,
          workspace_id: workspace.id,
          status: input.status || 'planning',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state (refreshing is safer to get client relation if needed)
      await fetchProjects(); 
      return data as Project;
    } catch (err: any) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  return { projects, loading, error, createProject, refresh: fetchProjects };
}
