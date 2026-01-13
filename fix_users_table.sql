-- Fix users table schema for upsert functionality

-- 1. Add updated_at column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add UNIQUE constraint to email for upsert to work
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- 3. Ensure RLS policies are correct (just in case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for users" ON users;
CREATE POLICY "Public access for users" ON users FOR ALL USING (true) WITH CHECK (true);
