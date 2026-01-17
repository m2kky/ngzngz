import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

export type Project = Database['public']['Tables']['projects']['Row'] & {
  clients?: {
    id: string;
    name: string;
  } | null;
};

export type CreateProjectInput = Database['public']['Tables']['projects']['Insert'];

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
        .from('projects')
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
      setProjects(data as Project[]);
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
        .from('projects')
        .insert({
          ...input,
          workspace_id: workspace.id,
          status: input.status || 'planning',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects(); 
      return data as Project;
    } catch (err: any) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  return { projects, loading, error, createProject, refresh: fetchProjects };
}
