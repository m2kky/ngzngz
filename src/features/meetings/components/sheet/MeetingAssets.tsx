import { Button } from '@/components/ui/button';
import { Plus, Video, ExternalLink, Paperclip } from 'lucide-react';
import type { Meeting } from '../../hooks/useMeetings';

interface MeetingAssetsProps {
  meeting: Meeting;
}

export function MeetingAssets({ meeting }: MeetingAssetsProps) {
  return (
    <div className="m-0 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Meeting Assets</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          Upload
        </Button>
      </div>
      
      <div className="grid gap-3">
        {meeting.recording_link && (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Meeting Recording</div>
                <div className="text-[10px] text-muted-foreground">Video Cloud Link</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => window.open(meeting.recording_link!, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Placeholder for attachments */}
        <div className="flex items-center justify-center py-12 border rounded-lg border-dashed">
          <div className="text-center space-y-2">
            <Paperclip className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
            <p className="text-sm text-muted-foreground">No documents attached yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
