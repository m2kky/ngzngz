-- MASTER RESET SCRIPT (V5 - SECURITY DEFINER FIX)
-- WARNING: THIS WILL DELETE ALL DATA IN THE LISTED TABLES

-- 1. Drop existing tables and functions
DROP TABLE IF EXISTS user_views CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS squads CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS get_my_workspace_ids();

-- 2. Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'SQUAD_MEMBER',
    xp_points INTEGER DEFAULT 0,
    ninja_level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Workspaces Table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    branding_config JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'ACTIVE',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Workspace Members Table
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 5. Create Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PLANNING',
    client_health TEXT CHECK (client_health IN ('Happy', 'Neutral', 'At Risk')),
    total_budget NUMERIC,
    spent_budget NUMERIC DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFTING',
    priority TEXT DEFAULT 'MEDIUM',
    assignee_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    publish_date TIMESTAMPTZ,
    platform TEXT CHECK (platform IN ('Instagram', 'TikTok', 'LinkedIn', 'YouTube')),
    estimated_cost NUMERIC,
    properties JSONB DEFAULT '{}'::jsonb,
    content_blocks JSONB DEFAULT '[]'::jsonb,
    ai_score INTEGER,
    ai_feedback TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create User Views Table
CREATE TABLE user_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    view_name TEXT NOT NULL,
    view_type TEXT NOT NULL,
    view_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_views ENABLE ROW LEVEL SECURITY;

-- 8. HELPER FUNCTION (The Magic Fix)
-- This function runs with "SECURITY DEFINER" privileges (admin), bypassing RLS.
-- It allows us to get the user's workspaces without triggering an infinite loop.
CREATE OR REPLACE FUNCTION get_my_workspace_ids()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ARRAY(SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid());
END;
$$;

-- 9. Create RLS Policies

-- Users
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Workspaces
CREATE POLICY "Users can view workspaces they belong to" ON workspaces 
FOR SELECT USING (
    id = ANY(get_my_workspace_ids()) OR created_by = auth.uid()
);

CREATE POLICY "Users can create workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workspaces" ON workspaces 
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own workspaces" ON workspaces 
FOR DELETE USING (created_by = auth.uid());

-- Workspace Members
CREATE POLICY "Members can view other members" ON workspace_members
FOR SELECT USING (
    workspace_id = ANY(get_my_workspace_ids())
);

CREATE POLICY "Owners can insert members" ON workspace_members FOR INSERT WITH CHECK (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() AND role = 'OWNER'
    )
);

-- Tasks
CREATE POLICY "Members can access tasks" ON tasks
FOR ALL USING (
    workspace_id = ANY(get_my_workspace_ids())
);

-- Projects
CREATE POLICY "Members can access projects" ON projects
FOR ALL USING (
    workspace_id = ANY(get_my_workspace_ids())
);

-- User Views
CREATE POLICY "Members can access views" ON user_views
FOR ALL USING (
    workspace_id = ANY(get_my_workspace_ids())
);


-- 10. TRIGGERS

-- A. Auto-add Creator as Workspace Member
CREATE OR REPLACE FUNCTION public.add_creator_to_workspace()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new.id, new.created_by, 'OWNER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.add_creator_to_workspace();

-- B. Auth User Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. BACKFILL USERS
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
