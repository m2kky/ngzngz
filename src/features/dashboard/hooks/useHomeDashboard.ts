import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { addDays, format } from "date-fns";

export function useHomeDashboard() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = workspace?.id;

  // 1. Stats Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", workspaceId],
    queryFn: async () => {
      if (!workspaceId || !user) return null;

      const [clients, tasksDue, adsSpend] = await Promise.all([
        // Active Clients
        supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .neq("status", "archived"),
        
        // Tasks Due Soon (48h) assigned to user
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .contains("assignee_ids", [user.id]) // Fixed: Use contains for array column
          .lte("due_date", addDays(new Date(), 2).toISOString())
          .neq("status", "done"),
          
        // Mock Ads Spend (or fetch active ad accounts count)
        supabase
          .from("ad_integrations") // Fixed: Correct table name
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("platform", "facebook") // Fixed: Correct column and value if applicable (or remove platform filter for all)
      ]);

      return {
        activeClients: clients.count || 0,
        tasksDueSoon: tasksDue.count || 0,
        activeAdAccounts: adsSpend.count || 0
      };
    },
    enabled: !!workspaceId && !!user,
  });

  // 2. My Tasks Query
  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["dashboard-my-tasks", workspaceId],
    queryFn: async () => {
      if (!workspaceId || !user) return [];
      
      const { data } = await supabase
        .from("tasks")
        .select(`
          id, 
          title, 
          due_date, 
          priority, 
          status,
          clients(name)
        `)
        .eq("workspace_id", workspaceId)
        .contains("assignee_ids", [user.id])
        .neq("status", "done")
        .order("due_date", { ascending: true })
        .limit(5);
        
      return data || [];
    },
    enabled: !!workspaceId && !!user,
  });

  // 3. Activity Feed Query
  const { data: activities, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data } = await supabase
        .from("activity_logs")
        .select(`
          *,
          users:user_id(full_name, avatar_url)
        `)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: !!workspaceId,
  });

  // 4. Needs Attention Query
  const { data: attentionTasks, isLoading: attentionLoading } = useQuery({
    queryKey: ["dashboard-attention", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data } = await supabase
        .from("tasks")
        .select(`
          id, 
          title, 
          status,
          updated_at,
          clients(name)
        `)
        .eq("workspace_id", workspaceId)
        .in("status", ["internal_review", "client_review"])
        .order("updated_at", { ascending: true }) // Oldest first
        .limit(5);

      return data || [];
    },
    enabled: !!workspaceId,
  });

  return {
    stats,
    myTasks,
    activities,
    attentionTasks,
    loading: statsLoading || tasksLoading || activityLoading || attentionLoading
  };
}
