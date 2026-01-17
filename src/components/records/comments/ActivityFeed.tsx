import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import type { ActivityLog } from '@/hooks/useActivity';

interface ActivityFeedProps {
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
  recordType: string;
}

export function ActivityFeed({ activityLogs, loading, error, recordType }: ActivityFeedProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActionText = (log: ActivityLog) => {
    const meta = log.metadata as Record<string, unknown> | undefined;
    switch (log.action_type) {
      case 'created':
        return `created this ${recordType}`;
      case 'status_changed':
        return `changed status from "${meta?.old_value}" to "${meta?.new_value}"`;
      case 'updated':
        if (meta?.field) {
          return `updated ${meta.field}`;
        }
        return 'made changes';
      default:
        return log.action_type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground py-4">Loading activity...</div>;
  }

  if (error) {
    return <div className="text-center text-sm text-red-600 py-4">Error loading activity</div>;
  }

  if (activityLogs.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-4">No activity yet</div>;
  }

  return (
    <div className="space-y-4">
      {activityLogs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={log.users?.avatar_url || ''} />
            <AvatarFallback className="text-[10px]">{getInitials(log.users?.full_name || log.users?.nickname || '??')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {log.users?.full_name || log.users?.nickname || 'User'}
              </span>
              <span className="text-muted-foreground">{getActionText(log)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
