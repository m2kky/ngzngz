-- Add the missing column for custom task properties
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS task_property_definitions JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN workspaces.task_property_definitions IS 'Stores custom property definitions for tasks in this workspace';
