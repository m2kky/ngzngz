import { Editor } from "@/components/ui/editor";

interface RecordBodyProps {
  description?: string | null;
  onUpdate?: (content: string) => void;
}

export function RecordBody({ description, onUpdate }: RecordBodyProps) {
  return (
    <div className="flex-1 p-6 min-h-75 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <div className="flex-1 border rounded-md p-4 bg-card/50">
        <Editor 
          value={description || ""} 
          onChange={(val) => onUpdate && onUpdate(val)}
          editable={!!onUpdate}
          placeholder="Add more details about this record..."
        />
      </div>
    </div>
  );
}
