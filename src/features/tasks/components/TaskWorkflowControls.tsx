import { useState, useEffect } from "react";
import { Play, Pause, CheckCircle, RotateCcw, Clock, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskWorkflowControlsProps {
  task: Task;
  onUpdate: () => void;
}

const PHASES = [
  { value: "planning", label: "Planning" },
  { value: "copywriting", label: "Copywriting" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "review", label: "Review" },
];

export function TaskWorkflowControls({ task, onUpdate }: TaskWorkflowControlsProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSession, setElapsedSession] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        setElapsedSession(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, startTime]);

  const handleTimerToggle = async () => {
    if (isPlaying) {
      // Stop Timer
      setIsUpdating(true);
      const durationMinutes = Math.ceil(elapsedSession / 60);
      
      try {
        // 1. Update Task
        const { error: taskError } = await supabase
          .from("tasks")
          .update({
            time_spent_minutes: (task.time_spent_minutes || 0) + durationMinutes,
          })
          .eq("id", task.id);

        if (taskError) throw taskError;

        // 2. Log Activity
        const { error: logError } = await supabase
          .from("activity_logs")
          .insert({
            action_type: "timer_stop",
            record_type: "task",
            record_id: task.id,
            metadata: {
              duration_minutes: durationMinutes,
              duration_seconds: elapsedSession,
            },
          });

        if (logError) throw logError;

        toast({ title: "Session Saved", description: `Added ${durationMinutes} minutes.` });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Failed to save session.", variant: "destructive" });
      } finally {
        setIsPlaying(false);
        setStartTime(null);
        setElapsedSession(0);
        setIsUpdating(false);
      }
    } else {
      // Start Timer
      setStartTime(Date.now());
      setIsPlaying(true);
      
      // Log Start (Optional, but good for auditing)
      await supabase.from("activity_logs").insert({
        action_type: "timer_start",
        record_type: "task",
        record_id: task.id,
        metadata: {},
      });
    }
  };

  const handlePhaseChange = async (newPhase: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ phase: newPhase })
        .eq("id", task.id);

      if (error) throw error;
      toast({ title: "Phase Updated", description: `Task moved to ${newPhase}` });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update phase", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "client_review" }) // Or 'approved' based on workflow
        .eq("id", task.id);

      if (error) throw error;

      await supabase.from("activity_logs").insert({
        action_type: "internal_approval",
        record_type: "task",
        record_id: task.id,
        metadata: { previous_status: task.status },
      });

      toast({ title: "Task Approved", description: "Moved to Client Review" });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Approval failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "in_progress",
          internal_revision_count: (task.internal_revision_count || 0) + 1,
        })
        .eq("id", task.id);

      if (error) throw error;

      await supabase.from("activity_logs").insert({
        action_type: "internal_rejection",
        record_type: "task",
        record_id: task.id,
        metadata: {
          reason: rejectionReason,
          previous_status: task.status,
        },
      });

      toast({ title: "Changes Requested", description: "Task returned to In Progress" });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Rejection failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  const totalTime = task.time_spent_minutes || 0;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Timer Control */}
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            onClick={handleTimerToggle}
            disabled={isUpdating}
            className="w-32"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </>
            )}
          </Button>
          
          {isPlaying && (
            <span className="font-mono text-sm animate-pulse text-primary">
              {formatTime(elapsedSession)}
            </span>
          )}
        </div>

        {/* Performance Badge */}
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hours}h {minutes}m
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            Rev: {task.internal_revision_count || 0}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Phase Selector */}
        <div className="flex-1 max-w-xs">
          <Select
            value={task.phase || ""}
            onValueChange={handlePhaseChange}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Phase" />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((phase) => (
                <SelectItem key={phase.value} value={phase.value}>
                  {phase.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Approval Workflow (Only for Internal Review) */}
        {task.status === "internal_review" && (
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Changes</DialogTitle>
                  <DialogDescription>
                    This will return the task to "In Progress" and increment the revision count.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="reason" className="text-right mb-2 block">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="E.g., Design does not match brand guidelines..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    Submit Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
