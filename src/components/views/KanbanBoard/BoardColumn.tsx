import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  id: Task['status'];
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function BoardColumn({ id, title, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  return (
    <div className="flex flex-col min-w-[320px] h-full bg-[#1a1a1a] rounded-lg border border-[#2c2c2c]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2c2c2c]">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary",
          isOver && "bg-[#2c2c2c]/30"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-[#2c2c2c] rounded-lg flex items-center justify-center text-xs text-muted-foreground/50">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
