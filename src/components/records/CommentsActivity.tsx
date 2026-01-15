import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useComments } from '@/hooks/useComments';
import { useActivity } from '@/hooks/useActivity';
import { formatDistanceToNow } from 'date-fns';

interface CommentsActivityProps {
  recordType: string;
  recordId: string;
}

export function CommentsActivity({ recordType, recordId }: CommentsActivityProps) {
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  
  const { 
    comments, 
    loading: commentsLoading, 
    error: commentsError, 
    fetchComments, 
    addComment 
  } = useComments();
  
  const { 
    activityLogs, 
    loading: activityLoading, 
    error: activityError, 
    fetchActivityLogs 
  } = useActivity();

  useEffect(() => {
    if (recordType && recordId) {
      fetchComments(recordType, recordId);
      fetchActivityLogs(recordType, recordId);
    }
  }, [recordType, recordId, fetchComments, fetchActivityLogs]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      await addComment({
        recordType,
        recordId,
        content: commentInput.trim(),
      });
      setCommentInput('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="border-t bg-muted/10 flex flex-col h-100">
      <Tabs defaultValue="comments" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4 border-b">
          <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-4">
            <TabsTrigger 
              value="comments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comments" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
          <div className="flex-1 p-4">
            {commentsLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">Loading comments...</div>
            ) : commentsError ? (
              <div className="text-center text-sm text-red-600 py-4">Error loading comments</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">No comments yet</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(comment as any).users?.avatar_url} />
                      <AvatarFallback>{getInitials((comment as any).users?.full_name || 'User')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {(comment as any).users?.full_name || (comment as any).users?.nickname || `User ${comment.user_id.slice(0, 4)}`}
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
            )}
          </div>
          <div className="p-4 border-t bg-background sticky bottom-0 z-10">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input 
                placeholder="Write a comment..." 
                className="flex-1" 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <Button type="submit" size="icon" disabled={!commentInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4 m-0 overflow-y-auto">
          {activityLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">Loading activity...</div>
          ) : activityError ? (
            <div className="text-center text-sm text-red-600 py-4">Error loading activity</div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No activity yet</div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log) => {
                const getActionText = () => {
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

                return (
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
                        <span className="text-muted-foreground">{getActionText()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
