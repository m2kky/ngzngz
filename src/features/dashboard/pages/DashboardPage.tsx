import { format } from "date-fns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Clock, DollarSign, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { RecordSheet } from "@/components/records/RecordSheet";
import { useState } from "react";

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, myTasks, activities, attentionTasks, loading } = useHomeDashboard();
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning, {user?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            It's {format(new Date(), "EEEE, MMMM do, yyyy")}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {/* Placeholder for future actions like "New Task" */}
        </div>
      </div>

      {/* 2. Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Active Clients" 
          value={stats?.activeClients || 0} 
          icon={Users} 
          trend="Total active accounts"
        />
        <StatsCard 
          title="Tasks Due Soon" 
          value={stats?.tasksDueSoon || 0} 
          icon={Clock} 
          trend="Assigned to you (48h)"
          highlight={stats?.tasksDueSoon > 0}
        />
        <StatsCard 
          title="Ad Accounts" 
          value={stats?.activeAdAccounts || 0} 
          icon={DollarSign} 
          trend="Connected platforms"
        />
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: My Workspace (2 cols wide on large screens) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* My Tasks Widget */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                My Tasks
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} className="text-muted-foreground">
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {myTasks && myTasks.length > 0 ? (
                <div className="space-y-1">
                  {myTasks.map((task: any) => (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          task.priority === 'urgent' ? 'bg-red-500' : 
                          task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="font-medium truncate text-sm">{task.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="truncate max-w-[120px]">{task.clients?.name}</span>
                            <span>•</span>
                            <span className={new Date(task.due_date) < new Date() ? "text-red-500 font-medium" : ""}>
                              {format(new Date(task.due_date), "MMM d")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Open
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No urgent tasks. You're all caught up! 🎉" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Agency Pulse */}
        <div className="space-y-6">
          
          {/* Needs Attention Widget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attentionTasks && attentionTasks.length > 0 ? (
                <div className="space-y-3">
                  {attentionTasks.map((task: any) => (
                    <div key={task.id} onClick={() => setSelectedTaskId(task.id)} className="flex items-start justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.clients?.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize bg-orange-50 text-orange-700 border-orange-200">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Nothing stuck in review. Good flow! 🌊
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed Widget */}
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-6 pb-4">
                <div className="space-y-6 pt-2">
                  {activities && activities.length > 0 ? (
                    activities.map((log: any) => (
                      <div key={log.id} className="flex gap-3 relative pb-1">
                        {/* Timeline line */}
                        <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-border last:hidden" />
                        
                        <Avatar className="w-8 h-8 border">
                          <AvatarImage src={log.users?.avatar_url} />
                          <AvatarFallback>{log.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-semibold">{log.users?.full_name}</span>{" "}
                            <span className="text-muted-foreground">{formatAction(log)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "h:mm a")}
                          </p>
                          {log.metadata?.reason && (
                            <div className="text-xs bg-red-50 text-red-600 p-2 rounded mt-1 border border-red-100">
                              "{log.metadata.reason}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="No recent activity recorded." />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Detail Sheet */}
      <RecordSheet
        open={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        recordId={selectedTaskId}
        type="task"
      />
    </div>
  );
}

// --- Sub-components ---

function StatsCard({ title, value, icon: Icon, trend, highlight }: any) {
  return (
    <Card className={highlight ? "border-primary/50 bg-primary/5" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="xl:col-span-2 h-[400px] rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Helper to format log messages
function formatAction(log: any) {
  const type = log.record_type;
  const action = log.action_type;
  
  switch (action) {
    case 'create': return `created a new ${type}`;
    case 'update': return `updated ${type}`;
    case 'delete': return `deleted ${type}`;
    case 'status_change': return `moved ${type} to ${log.metadata?.new_status}`;
    case 'timer_start': return `started working on ${type}`;
    case 'timer_stop': return `logged time on ${type}`;
    case 'internal_rejection': return `requested changes on ${type}`;
    case 'internal_approval': return `approved ${type}`;
    default: return `${action} ${type}`;
  }
}
