import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RecordSheet } from "@/components/records/RecordSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewTaskDialog } from "../components/NewTaskDialog";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import { KanbanBoard } from "@/components/views/KanbanBoard";
import { DataTable } from "@/components/views/DataTable";
import { useTasks } from "../hooks/useTasks";

export function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'list';
  const { tasks, loading, updateTask } = useTasks();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b bg-[#191919] flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <div className="h-6 w-px bg-[#2c2c2c]" />
          <ViewSwitcher />
        </div>
        <div className="flex items-center gap-3">
          <NewTaskDialog>
            <Button size="sm" className="h-8">
              <Plus className="mr-2 h-3.5 w-3.5" />
              New Task
            </Button>
          </NewTaskDialog>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 min-h-0 bg-[#141414]">
        {currentView === 'board' ? (
          <KanbanBoard 
            tasks={tasks} 
            loading={loading} 
            onUpdateTask={updateTask} 
            onTaskClick={(id) => setSelectedTask(id)}
          />
        ) : (
          <DataTable 
            tasks={tasks} 
            loading={loading} 
            onTaskClick={(id) => setSelectedTask(id)}
          />
        )}
      </div>

      <RecordSheet 
        open={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        recordId={selectedTask}
        type="task"
      />
    </div>
  );
}
