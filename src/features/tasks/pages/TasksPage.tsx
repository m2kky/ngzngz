import { useState } from "react";
import { RecordSheet } from "@/components/records/RecordSheet";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, User, ArrowRight, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isMobile } from "@/lib/utils";
import { useTasks, type Task } from "../hooks/useTasks";
import { format } from "date-fns";
import { NewTaskDialog } from "../components/NewTaskDialog";

export function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const navigate = useNavigate();
  const { tasks, loading } = useTasks();

  const handleTaskClick = (taskId: string) => {
    if (isMobile()) {
      navigate(`/tasks/${taskId}`);
    } else {
      setSelectedTask(taskId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return "bg-green-500/10 text-green-600";
      case 'approved': return "bg-emerald-500/10 text-emerald-600";
      case 'in_progress': return "bg-blue-500/10 text-blue-600";
      case 'client_review': return "bg-purple-500/10 text-purple-600";
      case 'internal_review': return "bg-orange-500/10 text-orange-600";
      case 'urgent': return "bg-red-500/10 text-red-600";
      default: return "bg-slate-500/10 text-slate-600";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your team tasks and projects.</p>
        </div>
        <NewTaskDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </NewTaskDialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/5 text-muted-foreground">
          No tasks found. Create your first task to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className="group flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{task.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                    {/* Placeholder for assignee */}
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> --</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      <RecordSheet 
        open={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        recordId={selectedTask}
        type="task"
      />
    </div>
  );
}
