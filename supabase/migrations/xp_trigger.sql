-- XP Trigger for Task Completion
-- Automatically awards XP when tasks are marked as APPROVED

-- Create function to award XP
CREATE OR REPLACE FUNCTION award_task_xp()
RETURNS TRIGGER AS $$
DECLARE
    current_total_xp INTEGER;
    new_total_xp INTEGER;
    old_level INTEGER;
    new_level INTEGER;
BEGIN
    -- Only award XP if status changed TO 'APPROVED' (not if already approved)
    IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') AND NEW.assignee_id IS NOT NULL THEN
        
        -- Get current XP and level
        SELECT xp_points, ninja_level INTO current_total_xp, old_level
        FROM users
        WHERE id = NEW.assignee_id;
        
        -- Calculate new XP and level
        new_total_xp := current_total_xp + 50;
        new_level := FLOOR(new_total_xp / 1000) + 1;
        
        -- Update user XP and level
        UPDATE users 
        SET 
            weekly_xp = weekly_xp + 50,
            xp_points = new_total_xp,
            ninja_level = new_level,
            updated_at = NOW()
        WHERE id = NEW.assignee_id;
        
        -- Log level up (future: could trigger notification here)
        IF new_level > old_level THEN
            RAISE NOTICE 'User % leveled up from % to %!', NEW.assignee_id, old_level, new_level;
            -- TODO: Insert into notifications table when implemented
        END IF;
        
        RAISE NOTICE 'Awarded 50 XP to user % for completing task %', NEW.assignee_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS task_completion_xp_trigger ON tasks;

-- Create trigger on tasks table
CREATE TRIGGER task_completion_xp_trigger
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION award_task_xp();

COMMENT ON FUNCTION award_task_xp() IS 'Awards 50 XP to task assignee when task is marked as APPROVED. Handles level-ups every 1000 XP.';
