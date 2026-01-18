import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type DashboardStats = {
  totalClients: number;
  activeProjects: number;
  openTasks: number;
  completedTasks: number;
  // Performance Metrics
  totalAgencyTime: number; // minutes
  avgRevisions: number;
  myTotalTime: number; // minutes
  myActiveTasks: number;
};

export function useDashboardStats() {
  const { workspace } = useWorkspace();
  const { can } = usePermissions();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    openTasks: 0,
    completedTasks: 0,
    totalAgencyTime: 0,
    avgRevisions: 0,
    myTotalTime: 0,
    myActiveTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!workspace || !user) return;

      try {
        setLoading(true);

        // 1. Common Stats (Workspace Level)
        const clientsPromise = supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .neq('status', 'archived');

        const projectsPromise = supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'active');

        const openTasksPromise = supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .not('status', 'in', '("done","archived")');

        const completedTasksPromise = supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'done');

        // 2. Role-Based Stats
        // We use can.view directly in the logic, but for dependency we use can.view reference.
        // To be safe and avoid stale closures if 'can' logic changes (though it shouldn't if based on stable permissions),
        // we can assume 'can.view' is stable enough or we can extract the boolean outside.
        const canViewReports = can.view('reports');
        let agencyTimePromise;
        let avgRevisionsPromise;
        let myTimePromise;
        let myTasksPromise;

        if (canViewReports) {
          // Admin/Manager: Agency Wide Stats
          // Note: Summing columns requires RPC or client-side calc. For now, client-side for simplicity on filtered set or use a new RPC if needed. 
          // Let's use a light select for summation to avoid heavy payload, or just select the columns needed.
          agencyTimePromise = supabase
            .from('tasks')
            .select('time_spent_minutes')
            .eq('workspace_id', workspace.id)
            .gt('time_spent_minutes', 0);

          avgRevisionsPromise = supabase
            .from('tasks')
            .select('internal_revision_count')
            .eq('workspace_id', workspace.id)
            .eq('status', 'done');
        } else {
          // Member: Personal Stats
          myTimePromise = supabase
            .from('tasks')
            .select('time_spent_minutes')
            .eq('workspace_id', workspace.id)
            .eq('assignee_id', user.id) // Assuming assignee_id is single UUID. If array, need 'cs' operator.
            .gt('time_spent_minutes', 0);

          myTasksPromise = supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id)
            .eq('assignee_id', user.id)
            .not('status', 'in', '("done","archived")');
        }

        const [
          { count: clientsCount },
          { count: projectsCount },
          { count: openTasksCount },
          { count: completedTasksCount },
          agencyTimeResult,
          avgRevisionsResult,
          myTimeResult,
          myTasksResult
        ] = await Promise.all([
          clientsPromise,
          projectsPromise,
          openTasksPromise,
          completedTasksPromise,
          canViewReports ? agencyTimePromise : Promise.resolve({ data: [] }),
          canViewReports ? avgRevisionsPromise : Promise.resolve({ data: [] }),
          !canViewReports ? myTimePromise : Promise.resolve({ data: [] }),
          !canViewReports ? myTasksPromise : Promise.resolve({ count: 0 })
        ]);

        // Calculate Aggregates
        let totalAgencyTime = 0;
        if (agencyTimeResult?.data) {
          totalAgencyTime = agencyTimeResult.data.reduce((acc, curr) => acc + (curr.time_spent_minutes || 0), 0);
        }

        let avgRevisions = 0;
        if (avgRevisionsResult?.data && avgRevisionsResult.data.length > 0) {
          const totalRevisions = avgRevisionsResult.data.reduce((acc, curr) => acc + (curr.internal_revision_count || 0), 0);
          avgRevisions = parseFloat((totalRevisions / avgRevisionsResult.data.length).toFixed(1));
        }

        let myTotalTime = 0;
        if (myTimeResult?.data) {
          myTotalTime = myTimeResult.data.reduce((acc, curr) => acc + (curr.time_spent_minutes || 0), 0);
        }

        setStats({
          totalClients: clientsCount || 0,
          activeProjects: projectsCount || 0,
          openTasks: openTasksCount || 0,
          completedTasks: completedTasksCount || 0,
          totalAgencyTime,
          avgRevisions,
          myTotalTime,
          myActiveTasks: myTasksResult?.count || 0,
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [workspace?.id, user?.id, can.view]);

  return { stats, loading };
}
