import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
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
                      <AvatarFallback>{getInitials(comment.user_id)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">User {comment.user_id.slice(0, 8)}</span>
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

        <TabsContent value="activity" className="flex-1 p-4 m-0">
          {activityLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">Loading activity...</div>
          ) : activityError ? (
            <div className="text-center text-sm text-red-600 py-4">Error loading activity</div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No activity yet</div>
          ) : (
            <div className="space-y-3">
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

                const getActionColor = () => {
                  switch (log.action_type) {
                    case 'created':
                      return 'bg-green-500';
                    case 'status_changed':
                      return 'bg-blue-500';
                    case 'updated':
                      return 'bg-yellow-500';
                    default:
                      return 'bg-gray-500';
                  }
                };

                return (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getActionColor()}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">User</span>
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
