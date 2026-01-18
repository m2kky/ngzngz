import { useState, useEffect, useRef } from 'react';
import { Play, Square, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateRecord } from '@/hooks/useUpdateRecord';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskWorkflowControlsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any;
  onUpdate?: () => void;
}

export function TaskWorkflowControls({ record, onUpdate }: TaskWorkflowControlsProps) {
  const { updateRecord } = useUpdateRecord();
  
  // Timer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSession, setElapsedSession] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived State
  const totalTime = (record.time_spent_minutes || 0) + Math.floor(elapsedSession / 60);
  const isInternalReview = record.status === 'internal_review';

  // Initialize timer from DB state
  useEffect(() => {
    const savedStart = record.custom_properties?.timer_start_at;
    
    if (savedStart) {
      const start = new Date(savedStart).getTime();
      const now = Date.now();
      const diffSeconds = Math.floor((now - start) / 1000);
      
      setElapsedSession(diffSeconds > 0 ? diffSeconds : 0);
      setIsPlaying(true);
      
      // Start local ticker
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSession(prev => prev + 1);
      }, 1000);
    } else {
      setIsPlaying(false);
      setElapsedSession(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [record.custom_properties?.timer_start_at]);

  const handleStartTimer = async () => {
    const now = new Date().toISOString();
    
    // Optimistic update
    setIsPlaying(true);
    setElapsedSession(0);
    
    // Start local ticker immediately for responsiveness
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSession(prev => prev + 1);
    }, 1000);
    
    try {
      // Save start time to DB
      const newProps = { 
        ...record.custom_properties, 
        timer_start_at: now 
      };
      
      await updateRecord('task', record.id, { 
        custom_properties: newProps 
      }, record);
      
      toast.success('Timer started');
      onUpdate?.(); // Refresh to ensure sync
    } catch (error) {
      console.error('Failed to start timer:', error);
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error('Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    // Stop local timer
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    
    const savedStart = record.custom_properties?.timer_start_at;
    if (!savedStart) return;

    // Calculate actual duration from server start time
    const start = new Date(savedStart).getTime();
    const end = Date.now();
    const durationMinutes = Math.ceil((end - start) / (1000 * 60)); // Round up to nearest minute
    
    const newTotal = (record.time_spent_minutes || 0) + durationMinutes;
    
    try {
      // Remove timer_start_at from custom_properties
      const newProps = { ...record.custom_properties };
      delete newProps.timer_start_at;

      // Update DB
      await updateRecord('task', record.id, { 
        time_spent_minutes: newTotal,
        custom_properties: newProps
      }, record);

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: record.workspace_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        record_type: 'task',
        record_id: record.id,
        action_type: 'timer_stop',
        metadata: { duration_minutes: durationMinutes }
      });

      setElapsedSession(0);
      onUpdate?.();
      toast.success(`Logged ${durationMinutes} minutes`);
    } catch (error) {
      console.error('Failed to save time:', error);
      toast.error('Failed to save time log');
      // Revert optimistic state if needed, or rely on re-fetch
    }
  };

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await updateRecord('task', record.id, { 
          status: 'client_review' 
        }, record);
        toast.success('Task approved for Client Review');
      } else {
        const newCount = (record.internal_revision_count || 0) + 1;
        await updateRecord('task', record.id, { 
          status: 'in_progress',
          internal_revision_count: newCount
        }, record);
        toast.success('Task returned for revision');
      }
      
      // Log it
      await supabase.from('activity_logs').insert({
        workspace_id: record.workspace_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        record_type: 'task',
        record_id: record.id,
        action_type: action === 'approve' ? 'internal_approval' : 'internal_rejection',
        metadata: { 
          previous_status: 'internal_review',
          new_status: action === 'approve' ? 'client_review' : 'in_progress'
        }
      });

      onUpdate?.();
    } catch (error) {
      console.error('Review action failed:', error);
      toast.error('Failed to update task status');
    }
  };

  return (
    <div className="px-6 py-4 bg-muted/20 border-b flex flex-col gap-4">
      {/* Top Row: Timer & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-2 text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20"
                onClick={handleStartTimer}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Timer
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                onClick={handleStopTimer}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop ({Math.floor(elapsedSession / 60)}:{String(elapsedSession % 60).padStart(2, '0')})
              </Button>
            )}
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="bg-background/50 text-muted-foreground gap-1.5 font-normal">
              <Clock className="w-3 h-3" />
              {totalTime}m logged
            </Badge>
            {(record.internal_revision_count || 0) > 0 && (
              <Badge variant="secondary" className="bg-background/50 text-orange-500 gap-1.5 font-normal">
                <RotateCcw className="w-3 h-3" />
                {record.internal_revision_count} revisions
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Review Controls (Only visible in Internal Review) */}
      {isInternalReview && (
        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Ready for Internal Review?</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => handleReviewAction('reject')}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Reject & Revise
            </Button>
            <Button 
              size="sm" 
              className="h-7 bg-blue-500 hover:bg-blue-600 text-white border-0"
              onClick={() => handleReviewAction('approve')}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
