import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';

export type DashboardStats = {
  totalClients: number;
  activeProjects: number;
  openTasks: number;
  completedTasks: number;
};

export function useDashboardStats() {
  const { workspace } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    openTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!workspace) return;

      try {
        setLoading(true);

        // 1. Total Clients
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .neq('status', 'archived');

        // 2. Active Projects
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'active');

        // 3. Open Tasks (not done or archived)
        const { count: openTasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .not('status', 'in', '("done","archived")');

        // 4. Completed Tasks
        const { count: completedTasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'done');

        setStats({
          totalClients: clientsCount || 0,
          activeProjects: projectsCount || 0,
          openTasks: openTasksCount || 0,
          completedTasks: completedTasksCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [workspace?.id]);

  return { stats, loading };
}
