import { Button } from '@/components/ui/button';
import { Editor } from '@/components/ui/editor';

interface MeetingNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function MeetingNotes({ notes, onNotesChange, onSave }: MeetingNotesProps) {
  return (
    <div className="m-0 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agenda & Minutes</h3>
        <Button variant="ghost" size="sm" onClick={onSave} className="text-xs text-primary">
          Save Changes
        </Button>
      </div>
      <div className="border rounded-lg p-4 bg-card min-h-[400px]">
        <Editor 
          value={notes} 
          onChange={onNotesChange} 
          placeholder="Start writing the agenda or meeting minutes..."
        />
      </div>
    </div>
  );
}
