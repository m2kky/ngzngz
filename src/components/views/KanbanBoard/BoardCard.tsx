import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface BoardCardProps {
  task: Task;
  isOverlay?: boolean;
  onTaskClick?: (taskId: string) => void;
}

export function BoardCard({ task, isOverlay, onTaskClick }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      default: return 'bg-[#2c2c2c] text-muted-foreground';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only open if not dragging and callback exists
        if (!isDragging && onTaskClick && !isOverlay) {
          // Prevent drag start if just clicking
          e.stopPropagation();
          onTaskClick(task.id);
        }
      }}
      className={cn(
        "group relative flex flex-col gap-2 p-3 rounded-md bg-[#232323] border border-[#333] hover:border-[#444] shadow-sm transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
        isOverlay && "ring-2 ring-primary rotate-2 shadow-lg opacity-100 z-50 bg-[#232323] cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight text-white/90 line-clamp-2">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
           {task.priority !== 'medium' && (
            <span className={cn("px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
           )}
           {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
        
        {/* Mock Avatar */}
        <div className="flex -space-x-1.5">
           <div className="w-5 h-5 rounded-full bg-primary/20 border border-[#232323] flex items-center justify-center text-[9px] text-primary">
             <User className="w-3 h-3" />
           </div>
        </div>
      </div>
    </div>
  );
}
