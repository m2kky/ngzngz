export type TaskStatus = 'backlog' | 'in_progress' | 'internal_review' | 'client_review' | 'approved' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_ids: string[];
  client_id: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  client_id?: string | null;
  project_id?: string | null;
};
