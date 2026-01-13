import { RecordHeader } from "./RecordHeader";
import { PropertiesRow } from "./PropertiesRow";
import { RecordBody } from "./RecordBody";
import { CommentsActivity } from "./CommentsActivity";
import { CheckSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function RecordPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm">Task Details</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-0">
          <RecordHeader 
            icon={CheckSquare} 
            title="Implement UI Concept" 
            breadcrumbs={["Tasks", "Ninjawy-123"]}
          />
        </div>
        <PropertiesRow properties={[]} />
        <RecordBody />
        <CommentsActivity recordType="task" recordId="" />
      </div>
    </div>
  );
}
