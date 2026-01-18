import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2, Users, FolderKanban, CheckSquare, Plus, Clock, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";
import { RecentActivity } from "../components/RecentActivity";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const loading = workspaceLoading || statsLoading;
  const canViewReports = can.view('reports');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          {workspace && (
            <p className="text-muted-foreground mt-1">
              Overview for <span className="font-medium text-foreground">{workspace.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {/* Add more quick actions here if needed */}
          <NewProjectDialog>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </NewProjectDialog>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clients */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => navigate('/clients')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Clients</span>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-500 font-medium">Active</span> relationships
            </div>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => navigate('/projects')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderKanban className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Active Projects</span>
            <div className="text-3xl font-bold">{stats.activeProjects}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              In progress now
            </div>
          </div>
        </div>

        {/* Card 3: Productivity (Role Aware) */}
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
              {canViewReports ? "Agency Hours" : "My Logged Hours"}
            </span>
            <div className="text-3xl font-bold">
              {Math.floor((canViewReports ? stats.totalAgencyTime : stats.myTotalTime) / 60)}h{' '}
              <span className="text-lg text-muted-foreground font-normal">
                {(canViewReports ? stats.totalAgencyTime : stats.myTotalTime) % 60}m
              </span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>Tracked time total</span>
            </div>
          </div>
        </div>

        {/* Card 4: Quality / Tasks (Role Aware) */}
        <div 
          className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => navigate('/tasks')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {canViewReports ? <BarChart3 className="h-16 w-16" /> : <CheckSquare className="h-16 w-16" />}
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
              {canViewReports ? "Avg Revisions" : "My Active Tasks"}
            </span>
            <div className="text-3xl font-bold">
              {canViewReports ? stats.avgRevisions : stats.myActiveTasks}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {canViewReports ? (
                <span>Per completed task</span>
              ) : (
                <span className={cn(stats.myActiveTasks > 5 ? "text-orange-500" : "text-green-500")}>
                  {stats.myActiveTasks > 5 ? "High workload" : "On track"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
            </div>
            <RecentActivity />
          </div>
        </div>

        {/* Right Column: Deadlines / Notices */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Deadlines
              </h3>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/5">
              No upcoming deadlines
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
