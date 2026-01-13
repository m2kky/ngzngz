-- 1. Add XP columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ninja_level INTEGER DEFAULT 1;

-- 2. Create Function to award XP
CREATE OR REPLACE FUNCTION handle_xp_award()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  xp_gain INT := 50; -- XP per task
  current_xp INT;
  current_level INT;
  new_xp INT;
  new_level INT;
BEGIN
  -- Award XP when status changes to "Delivered" or "Done" states
  -- Delivered: INTERNAL_REVIEW, CLIENT_REVIEW
  -- Done: APPROVED, PUBLISHED, ADS_HANDOFF
  -- We check if it enters one of these states from a "Working" state (Drafting, In Progress, AI Check)
  IF (NEW.status IN ('INTERNAL_REVIEW', 'CLIENT_REVIEW', 'APPROVED', 'PUBLISHED', 'ADS_HANDOFF')) 
     AND (OLD.status NOT IN ('INTERNAL_REVIEW', 'CLIENT_REVIEW', 'APPROVED', 'PUBLISHED', 'ADS_HANDOFF')) THEN
    user_id := NEW.assignee_id;
    
    -- If no assignee, do nothing
    IF user_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get current user stats
    SELECT xp_points, ninja_level INTO current_xp, current_level
    FROM users
    WHERE id = user_id;

    -- Initialize if null
    IF current_xp IS NULL THEN current_xp := 0; END IF;
    IF current_level IS NULL THEN current_level := 1; END IF;

    -- Calculate new values
    new_xp := current_xp + xp_gain;
    
    -- Level up logic: Threshold = Level * 500
    -- Example: Level 1 needs 500 XP to reach Level 2.
    IF new_xp >= (current_level * 500) THEN
      new_level := current_level + 1;
    ELSE
      new_level := current_level;
    END IF;

    -- Update user
    UPDATE users
    SET 
      xp_points = new_xp,
      ninja_level = new_level
    WHERE id = user_id;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_task_complete ON tasks;
CREATE TRIGGER on_task_complete
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION handle_xp_award();
