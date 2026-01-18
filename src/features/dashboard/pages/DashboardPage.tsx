import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Loader2, Users, FolderKanban, CheckSquare, Plus } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { stats, loading: statsLoading } = useDashboardStats();
  const navigate = useNavigate();

  const loading = workspaceLoading || statsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {workspace && (
            <p className="text-muted-foreground">
              Overview for <span className="font-semibold text-foreground">{workspace.name}</span>
            </p>
          )}
        </div>
        <NewProjectDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </NewProjectDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clients Card */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/clients')}
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Clients</h3>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active clients in workspace
          </p>
        </div>

        {/* Projects Card */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/projects')}
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Active Projects</h3>
            <FolderKanban className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Projects currently in progress
          </p>
        </div>

        {/* Open Tasks Card */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Open Tasks</h3>
            <CheckSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-2xl font-bold">{stats.openTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tasks needing attention
          </p>
        </div>

        {/* Completed Tasks Card */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Completed Tasks</h3>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tasks finished successfully
          </p>
        </div>
      </div>

      {/* Recent Activity Section Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Recent Projects</h3>
          <div className="text-sm text-muted-foreground flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            No recent activity
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="text-sm text-muted-foreground flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            No upcoming deadlines
          </div>
        </div>
      </div>
    </div>
  );
}
