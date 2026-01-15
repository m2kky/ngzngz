import { useMemo, useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  defaultDropAnimationSideEffects, 
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  MouseSensor
} from "@dnd-kit/core";
import type { 
  DragStartEvent, 
  DragEndEvent 
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import type { Task } from "@/features/tasks/types";
import { BoardColumn } from "./BoardColumn";
import { BoardCard } from "./BoardCard";

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (taskId: string) => void;
}

const COLUMNS: { id: Task['status'], title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'internal_review', title: 'Internal Review' },
  { id: 'client_review', title: 'Client Review' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({ tasks, loading, onUpdateTask, onTaskClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    const acc: Record<string, Task[]> = {};
    COLUMNS.forEach(col => acc[col.id] = []);
    tasks.forEach(task => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      } else {
        // Handle tasks with statuses not in our columns map if any
        if (!acc['backlog']) acc['backlog'] = [];
        acc['backlog'].push(task);
      }
    });
    return acc;
  }, [tasks]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overId = over.id as string;
    
    // Check if dropped on a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    let newStatus = isOverColumn ? overId : null;

    // If dropped on a card, find that card's status
    if (!newStatus) {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      onUpdateTask(activeTask.id, { status: newStatus as Task['status'] });
    }

    setActiveId(null);
  };

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId),
    [activeId, tasks]
  );

  if (loading) {
     return <div className="p-8 text-center text-muted-foreground">Loading board...</div>;
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={onDragStart} 
      onDragEnd={onDragEnd}
    >
      <div className="h-full flex gap-4 p-4 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasksByStatus[col.id]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask && (
            <BoardCard task={activeTask} isOverlay />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
