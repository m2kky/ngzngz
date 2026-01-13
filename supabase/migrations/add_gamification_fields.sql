-- Add Gamification Fields Migration
-- Adds weekly_xp and badges columns to users table
-- Note: users table already has xp_points (use as total_xp) and ninja_level (use as level)

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Rename existing columns for consistency (optional - can keep xp_points and ninja_level)
-- ALTER TABLE users RENAME COLUMN xp_points TO total_xp;
-- ALTER TABLE users RENAME COLUMN ninja_level TO level;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_weekly_xp ON users(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(xp_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(ninja_level DESC);

-- Comments for documentation
COMMENT ON COLUMN users.weekly_xp IS 'XP earned this week (resets weekly)';
COMMENT ON COLUMN users.xp_points IS 'Total lifetime XP earned';
COMMENT ON COLUMN users.ninja_level IS 'Current ninja level (calculated from total XP)';
COMMENT ON COLUMN users.badges IS 'Array of unlocked achievement/badge IDs';

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    icon_url TEXT,
    category TEXT DEFAULT 'general',
    requirement_type TEXT, -- e.g., 'tasks_completed', 'xp_earned', 'streak_days'
    requirement_value INTEGER, -- e.g., 10 tasks, 1000 xp, 7 days
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to achievements
DROP POLICY IF EXISTS "Public read access for achievements" ON achievements;
CREATE POLICY "Public read access for achievements" ON achievements
    FOR SELECT USING (true);

-- Only admins can manage achievements
DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" ON achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SYSTEM_ADMIN'
        )
    );

-- Create index for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Seed some initial achievements
INSERT INTO achievements (title, description, xp_reward, category, requirement_type, requirement_value) VALUES
    ('First Steps', 'Complete your first task', 50, 'tasks', 'tasks_completed', 1),
    ('Getting Started', 'Complete 5 tasks', 100, 'tasks', 'tasks_completed', 5),
    ('Task Master', 'Complete 25 tasks', 250, 'tasks', 'tasks_completed', 25),
    ('Century Club', 'Complete 100 tasks', 500, 'tasks', 'tasks_completed', 100),
    ('Speed Demon', 'Complete 3 tasks in one day', 150, 'speed', 'tasks_in_day', 3),
    ('Night Owl', 'Complete a task after 10 PM', 75, 'special', 'task_after_hours', 1),
    ('Early Bird', 'Complete a task before 7 AM', 75, 'special', 'task_early_morning', 1),
    ('XP Rookie', 'Earn 500 total XP', 100, 'xp', 'total_xp', 500),
    ('XP Veteran', 'Earn 2000 total XP', 200, 'xp', 'total_xp', 2000),
    ('XP Legend', 'Earn 5000 total XP', 500, 'xp', 'total_xp', 5000)
ON CONFLICT DO NOTHING;
