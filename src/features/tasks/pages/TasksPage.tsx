import { useState, useMemo } from "react";
import { RecordSheet } from "@/components/records/RecordSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewTaskDialog } from "../components/NewTaskDialog";
import { KanbanBoard } from "@/components/views/KanbanBoard";
import { DataTable } from "@/components/views/DataTable";
import { createColumns } from "@/components/views/DataTable/columns";
import { CalendarView } from "@/components/views/CalendarView";
import { DataViewToolbar, type ColumnDefinition } from "@/components/views/DataViewToolbar";
import { useDataViewConfig } from "@/components/views/hooks/useDataViewConfig";
import { useTasks } from "../hooks/useTasks";
import { useActivity } from "@/hooks/useActivity";

const AVAILABLE_COLUMNS: ColumnDefinition[] = [
  { id: 'title', label: 'Title' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'due_date', label: 'Due Date' },
  { id: 'assignee_id', label: 'Assignee' },
  { id: 'client_id', label: 'Client' },
  { id: 'project_id', label: 'Project' },
];

export function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  const { 
    config, 
    setViewType, 
    toggleColumnVisibility,
    setTimelineScale
  } = useDataViewConfig({
    key: 'tasks-view',
    defaultView: 'list',
    defaultVisibleColumns: {
      title: true,
      status: true,
      priority: true,
      due_date: true,
      assignee_id: true,
      client_id: true,
      project_id: true
    }
  });

  const { tasks, loading, updateTask } = useTasks();
  const { addActivityLog } = useActivity();
  
  const columns = useMemo(() => createColumns((id) => setSelectedTask(id)), []);

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      // Update the task
      const updatedTask = await updateTask(taskId, updates);
      
      // Log activity if status changed
      if (updates.status) {
        await addActivityLog({
          recordType: 'task',
          recordId: taskId,
          actionType: 'status_changed',
          metadata: {
            field: 'status',
            from: tasks.find(t => t.id === taskId)?.status,
            to: updates.status,
          },
        });
      }
      
      // Log activity if priority changed
      if (updates.priority) {
        await addActivityLog({
          recordType: 'task',
          recordId: taskId,
          actionType: 'priority_changed',
          metadata: {
            field: 'priority',
            from: tasks.find(t => t.id === taskId)?.priority,
            to: updates.priority,
          },
        });
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleTaskDateChange = async (taskId: string, start: Date, end: Date) => {
    try {
      await updateTask(taskId, {
        due_date: end.toISOString(),
      });
    } catch (error) {
      console.error('Failed to update task dates:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b bg-[#191919] flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <div className="h-6 w-px bg-[#2c2c2c]" />
          <DataViewToolbar 
            config={config}
            onViewChange={setViewType}
            onVisibilityChange={toggleColumnVisibility}
            availableColumns={AVAILABLE_COLUMNS}
          />
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
        {config.viewType === 'board' && (
          <KanbanBoard 
            tasks={tasks} 
            loading={loading} 
            onUpdateTask={handleUpdateTask} 
            onTaskClick={(id) => setSelectedTask(id)}
          />
        )}
        
        {config.viewType === 'calendar' && (
          <CalendarView 
            tasks={tasks}
            onTaskClick={(id) => setSelectedTask(id)}
          />
        )}

        {config.viewType === 'timeline' && (
          <TimelineView 
            tasks={tasks}
            onTaskClick={(id) => setSelectedTask(id)}
            onTaskUpdate={handleTaskDateChange}
            viewMode={
              config.timelineScale === 'Week' ? ViewMode.Week :
              config.timelineScale === 'Day' ? ViewMode.Day :
              ViewMode.Month
            }
          />
        )}

        {config.viewType === 'list' && (
          <DataTable 
            data={tasks} 
            columns={columns}
            loading={loading} 
            columnVisibility={config.visibleColumns}
            onColumnVisibilityChange={toggleColumnVisibility as any}
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
