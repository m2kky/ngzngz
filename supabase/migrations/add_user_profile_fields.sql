-- Add User Profile Fields Migration
-- Adds nickname, theme_color, birth_date, and bio columns to users table

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ccff00';
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Comments for documentation
COMMENT ON COLUMN users.nickname IS 'Display name for chats and user mentions';
COMMENT ON COLUMN users.theme_color IS 'User preferred UI accent color (hex code)';
COMMENT ON COLUMN users.birth_date IS 'User birth date';
COMMENT ON COLUMN users.bio IS 'Short user bio or "Ninja Motto"';
