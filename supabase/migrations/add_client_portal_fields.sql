-- Add Client Portal fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_client_feedback TEXT,
ADD COLUMN IF NOT EXISTS client_view_status TEXT DEFAULT 'pending'; -- pending, approved, rejected

-- Add index for performance on filtering by client status
CREATE INDEX IF NOT EXISTS idx_tasks_client_status ON tasks(client_view_status);
