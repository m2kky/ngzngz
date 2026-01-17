import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/hooks/useComments';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

export function CommentList({ comments, loading, error }: CommentListProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground py-4">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-center text-sm text-red-600 py-4">Error loading comments</div>;
  }

  if (comments.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-4">No comments yet</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.users?.avatar_url || ''} />
            <AvatarFallback>{getInitials(comment.users?.full_name || 'User')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.users?.full_name || comment.users?.nickname || `User ${comment.user_id.slice(0, 4)}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
