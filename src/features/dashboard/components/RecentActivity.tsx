import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle, PlusCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ActivityLog = {
  id: string;
  user_id: string;
  action_type: string;
  created_at: string;
  metadata: any;
  users: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
  // Join for task title if needed, but might be complex. For now rely on metadata or just generic.
  // Actually, activity_logs has record_id and record_type. We can try to fetch task title if possible or just show generic "Task".
  // Let's assume metadata might contain info or we just show "on a task".
};

export function RecentActivity() {
  const { workspace } = useWorkspace();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      if (!workspace) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            *,
            users:user_id (
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setLogs(data as any[] || []);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [workspace?.id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'timer_stop': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'task_complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_create': return <PlusCircle className="h-4 w-4 text-purple-500" />;
      case 'internal_rejection': return <RefreshCw className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (log: ActivityLog) => {
    const name = log.users?.full_name || log.users?.email || 'Unknown User';
    
    switch (log.action_type) {
      case 'timer_stop':
        return (
          <span>
            <span className="font-medium text-foreground">{name}</span> logged {log.metadata?.duration_minutes || 0}m on a task
          </span>
        );
      case 'internal_approval':
        return (
          <span>
            <span className="font-medium text-foreground">{name}</span> approved a task for client review
          </span>
        );
      case 'internal_rejection':
        return (
          <span>
            <span className="font-medium text-foreground">{name}</span> requested changes on a task
          </span>
        );
      case 'task_create':
        return (
          <span>
            <span className="font-medium text-foreground">{name}</span> created a new task
          </span>
        );
      default:
        return (
          <span>
            <span className="font-medium text-foreground">{name}</span> performed {log.action_type}
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground text-center">Loading activity...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/5">
        No recent activity
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start group">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={log.users?.avatar_url} />
              <AvatarFallback className="text-[10px]">
                {(log.users?.full_name || log.users?.email || '??').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-muted-foreground leading-none">
                {getActivityMessage(log)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                {getActivityIcon(log.action_type)}
                <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
