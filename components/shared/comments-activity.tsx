"use client"

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/../components/ui/avatar";
import { Button } from "@/../components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/../components/ui/input";
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/../lib/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';

interface CommentsActivityProps {
  recordType: string;
  recordId: string;
}

export function CommentsActivity({ recordType, recordId }: CommentsActivityProps) {
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient() as any;

  const fetchComments = useCallback(async () => {
    if (!recordId || !currentWorkspace) return;
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(full_name, nickname, avatar_url)')
      .eq('record_type', recordType)
      .eq('record_id', recordId)
      .eq('workspace_id', currentWorkspace.id)
      .is('archived_at', null)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
    setLoadingComments(false);
  }, [recordType, recordId, currentWorkspace, supabase]);

  const fetchActivityLogs = useCallback(async () => {
    if (!recordId || !currentWorkspace) return;
    setLoadingActivity(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, users(full_name, nickname, avatar_url)')
      .eq('record_type', recordType)
      .eq('record_id', recordId)
      .eq('workspace_id', currentWorkspace.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivityLogs(data);
    }
    setLoadingActivity(false);
  }, [recordType, recordId, currentWorkspace, supabase]);

  useEffect(() => {
    fetchComments();
    fetchActivityLogs();
  }, [fetchComments, fetchActivityLogs]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentWorkspace) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        record_type: recordType,
        record_id: recordId,
        user_id: user.id,
        workspace_id: currentWorkspace.id,
        content: commentInput.trim(),
      })
      .select('*, users(full_name, nickname, avatar_url)')
      .single();

    if (error) {
      toast.error("Failed to post comment");
    } else {
      setComments([...comments, data]);
      setCommentInput('');
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <Tabs defaultValue="comments" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 border-b border-white/10">
          <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-4">
            <TabsTrigger 
              value="comments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--brand)] data-[state=active]:bg-transparent px-0 pb-2 text-zinc-400 data-[state=active]:text-white"
            >
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--brand)] data-[state=active]:bg-transparent px-0 pb-2 text-zinc-400 data-[state=active]:text-white"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comments" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-sm text-zinc-500 py-8">No comments yet. Start the conversation!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 animate-fade-in">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={comment.users?.avatar_url} />
                    <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">{getInitials(comment.users?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {comment.users?.full_name || 'Anonymous Ninja'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-white/10 bg-zinc-900/50">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input 
                placeholder="Write a comment..." 
                className="flex-1 bg-white/5 border-white/10 text-white focus-visible:ring-[var(--brand)]/50" 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="bg-[var(--brand)] text-black hover:opacity-90" disabled={!commentInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4 m-0 overflow-y-auto custom-scrollbar">
          {loadingActivity ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center text-sm text-zinc-500 py-8">No activity recorded yet.</div>
          ) : (
            <div className="space-y-6">
              {activityLogs.map((log) => {
                const getActionText = () => {
                  const meta = log.metadata as Record<string, any> | undefined;
                  switch (log.action_type) {
                    case 'created':
                      return `created this ${recordType}`;
                    case 'status_changed':
                      return `changed status to "${meta?.new_value}"`;
                    case 'updated':
                      return `updated ${meta?.field || 'the record'}`;
                    default:
                      return log.action_type.replace(/_/g, ' ');
                  }
                };

                return (
                  <div key={log.id} className="flex items-start gap-3 text-sm animate-fade-in">
                    <div className="relative">
                      <Avatar className="h-6 w-6 border border-white/10">
                        <AvatarImage src={log.users?.avatar_url} />
                        <AvatarFallback className="text-[8px] bg-zinc-800 text-zinc-500">{getInitials(log.users?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-200">
                          {log.users?.full_name || 'Ninja'}
                        </span>
                        <span className="text-zinc-500">{getActionText()}</span>
                      </div>
                      <span className="text-[10px] text-zinc-600">
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
