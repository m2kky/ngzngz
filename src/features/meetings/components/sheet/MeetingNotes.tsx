import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface MeetingNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  loading?: boolean;
}

export function MeetingNotes({ notes, onNotesChange, onSave, loading }: MeetingNotesProps) {
  return (
    <div className="m-0 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agenda & Minutes</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSave} 
          disabled={loading}
          className="text-xs text-primary"
        >
          {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Save Changes
        </Button>
      </div>
      <div className="border rounded-lg p-0 bg-card">
        <Textarea 
          value={notes} 
          onChange={(e) => onNotesChange(e.target.value)} 
          placeholder="Start writing the agenda or meeting minutes... Use - for bullet points."
          className="min-h-[300px] border-0 focus-visible:ring-0 resize-none p-4 whitespace-pre-wrap leading-relaxed"
        />
      </div>
    </div>
  );
}
