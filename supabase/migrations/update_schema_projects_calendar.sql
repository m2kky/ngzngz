-- Update Projects Table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC,
ADD COLUMN IF NOT EXISTS spent_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS client_health TEXT CHECK (client_health IN ('Happy', 'Neutral', 'At Risk'));

-- Update Tasks Table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('Instagram', 'TikTok', 'LinkedIn', 'YouTube')),
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC;

-- Add index for project_id on tasks for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_publish_date ON tasks(publish_date);
