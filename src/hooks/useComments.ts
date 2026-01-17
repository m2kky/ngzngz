import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { getErrorMessage } from '@/lib/errors';

export type Comment = {
  id: string;
  record_type: string;
  record_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  users?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  };
};

export type CreateCommentInput = {
  recordType: string;
  recordId: string;
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

export function useComments() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (recordType: string, recordId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!workspace) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('comments')
        .select('*, users(full_name, nickname, avatar_url)')
        .eq('record_type', recordType)
        .eq('record_id', recordId)
        .eq('workspace_id', workspace.id)
        .is('archived_at', null)
        .order('created_at', { ascending: true })
        .returns<Comment[]>();

      if (error) throw error;
      setComments((data ?? []) as Comment[]);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error fetching comments:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const addComment = useCallback(async (input: CreateCommentInput) => {
    if (!user) throw new Error('User must be authenticated');
    if (!workspace) throw new Error('No workspace selected');

    try {
      setError(null);
      const { data, error } = await supabase
        .from('comments')
        .insert({
          record_type: input.recordType,
          record_id: input.recordId,
          user_id: user.id,
          workspace_id: workspace.id,
          content: input.content,
          mentioned_user_ids: [],
        })
        .select('*, users(full_name, nickname, avatar_url)')
        .returns<Comment>()
        .single();

      if (error) throw error;

      // Update local state
      setComments(prev => [...prev, data as Comment]);
      return data as Comment;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error adding comment:', message);
      setError(message);
      throw err;
    }
  }, [user, workspace]);

  const updateComment = useCallback(async (commentId: string, input: UpdateCommentInput) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const { data, error } = await supabase
        .from('comments')
        .update({ content: input.content })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .returns<Comment>()
        .single();

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, ...(data as Comment) } : comment
      ));
      return data as Comment;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error updating comment:', message);
      setError(message);
      throw err;
    }
  }, [user]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const { error } = await supabase
        .from('comments')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state (remove comment)
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error deleting comment:', message);
      setError(message);
      throw err;
    }
  }, [user]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}
