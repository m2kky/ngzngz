-- Fix strategies table schema
DO $$ 
BEGIN 
    -- 1. Add client_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'client_id') THEN
        ALTER TABLE strategies ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- 2. Add other potential missing columns from the new definition
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'situation') THEN
        ALTER TABLE strategies ADD COLUMN situation JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'strategy') THEN
        ALTER TABLE strategies ADD COLUMN strategy JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strategies' AND column_name = 'tactics') THEN
        ALTER TABLE strategies ADD COLUMN tactics JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Now safe to create the index
CREATE INDEX IF NOT EXISTS idx_strategies_client_id ON strategies(client_id);
