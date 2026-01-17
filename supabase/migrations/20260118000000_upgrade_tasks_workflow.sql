-- Upgrade tasks table for Performance Tracking
ALTER TABLE "public"."tasks"
ADD COLUMN "time_spent_minutes" INTEGER DEFAULT 0,
ADD COLUMN "internal_revision_count" INTEGER DEFAULT 0,
ADD COLUMN "phase" TEXT;

-- Add comment to document the new columns
COMMENT ON COLUMN "public"."tasks"."time_spent_minutes" IS 'Total time spent on the task in minutes';
COMMENT ON COLUMN "public"."tasks"."internal_revision_count" IS 'Number of times the task was rejected internally';
COMMENT ON COLUMN "public"."tasks"."phase" IS 'Current phase of the task (e.g., Planning, Design, Development)';
