import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComments } from '@/hooks/useComments';
import { useActivity } from '@/hooks/useActivity';
import { CommentList } from './comments/CommentList';
import { CommentInput } from './comments/CommentInput';
import { ActivityFeed } from './comments/ActivityFeed';

interface CommentsActivityProps {
  recordType: string;
  recordId: string;
}

export function CommentsActivity({ recordType, recordId }: CommentsActivityProps) {
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

  // Refetch activity when switching to activity tab
  useEffect(() => {
    if (activeTab === 'activity' && recordType && recordId) {
      fetchActivityLogs(recordType, recordId);
    }
  }, [activeTab, recordType, recordId, fetchActivityLogs]);

  // Poll for new activity when activity tab is open
  useEffect(() => {
    if (activeTab === 'activity' && recordType && recordId) {
      const intervalId = setInterval(() => {
        fetchActivityLogs(recordType, recordId);
      }, 10000); // 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [activeTab, recordType, recordId, fetchActivityLogs]);

  const handleSubmitComment = async (content: string) => {
    await addComment({
      recordType,
      recordId,
      content,
    });
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
            <CommentList 
              comments={comments} 
              loading={commentsLoading} 
              error={commentsError} 
            />
          </div>
          <CommentInput onSubmit={handleSubmitComment} />
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-4 m-0 overflow-y-auto">
          <ActivityFeed 
            activityLogs={activityLogs} 
            loading={activityLoading} 
            error={activityError} 
            recordType={recordType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
