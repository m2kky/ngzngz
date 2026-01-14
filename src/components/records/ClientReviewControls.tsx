import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateRecord } from '@/hooks/useUpdateRecord';
import { useComments } from "@/hooks/useComments";
import { Send, CheckCircle2, XCircle } from 'lucide-react';

interface ClientReviewControlsProps {
  record: any;
  onUpdate: () => void;
}

export function ClientReviewControls({ record, onUpdate }: ClientReviewControlsProps) {
  const { updateRecord, updating } = useUpdateRecord();
  const { addComment } = useComments();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Only for tasks
  if (!record || record.type !== undefined && record.type !== 'task') return null;
  // If we don't know the type from the record itself (since some fetch queries don't include it in the object), 
  // we rely on the parent to only render this for tasks. But checking record fields helps.
  
  const status = record.status;
  const isClientReview = status === 'client_review';

  const handleSendToClient = async () => {
    try {
      await updateRecord('task', record.id, {
        status: 'client_review',
        client_view_status: 'pending',
      }, record);
      onUpdate();
    } catch (error) {
      console.error('Failed to send to client', error);
    }
  };

  const handleAccept = async () => {
    try {
      await updateRecord('task', record.id, {
        status: 'approved',
        client_view_status: 'approved',
        last_client_feedback: null // Clear feedback on approval
      }, record);
      
      // Optional: Add an "Approved" comment automatically?
      // await addComment({
      //   recordType: 'task',
      //   recordId: record.id,
      //   content: 'Client accepted the task ✅'
      // });

      onUpdate();
    } catch (error) {
      console.error('Failed to accept task', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    try {
      // 1. Update record status
      await updateRecord('task', record.id, {
        status: 'internal_review', // Send back to internal
        client_view_status: 'rejected',
        last_client_feedback: rejectReason,
        rejection_count: (record.rejection_count || 0) + 1
      }, record);

      // 2. Add visible comment for the team
      await addComment({
        recordType: 'task',
        recordId: record.id,
        content: `❌ Client Rejected: ${rejectReason}`
      });
      
      setRejectDialogOpen(false);
      setRejectReason('');
      onUpdate();
    } catch (error) {
      console.error('Failed to reject task', error);
    }
  };

  if (!isClientReview && status !== 'approved' && status !== 'internal_review') {
      return (
          <div className="mx-6 mt-6 mb-2">
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 py-8 bg-muted/20 hover:bg-muted/40"
                onClick={handleSendToClient}
                disabled={updating}
            >
                <Send className="mr-2 h-4 w-4" />
                Send to Client Review
              </Button>
          </div>
      );
  }

  if (isClientReview) {
      return (
        <div className="bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/50 p-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-orange-700 dark:text-orange-400">Client Review Mode</h3>
                        <p className="text-sm text-orange-600/80 dark:text-orange-400/70">
                            Simulating what the client sees. Action required.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleAccept}
                            disabled={updating}
                         >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Accept
                         </Button>
                         <Button 
                            variant="destructive"
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={updating}
                         >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                         </Button>
                    </div>
                </div>
            </div>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Task</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this task. This will be sent back to the team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reason" className="mb-2 block">Rejection Reason</Label>
                        <Textarea 
                            id="reason" 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            placeholder="e.g., The color scheme doesn't match our brand guidelines..."
                            className="h-32"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || updating}>
                            Reject Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      );
  }

  return null;
}
