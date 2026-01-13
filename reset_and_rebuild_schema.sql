-- MASTER RESET & REBUILD SCRIPT
-- WARNING: THIS WILL DELETE ALL DATA IN YOUR DATABASE
-- Run this in Supabase SQL Editor to reset everything

-- 1. Drop existing tables (Order matters for foreign keys)
DROP TABLE IF EXISTS trends CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS brand_voice CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- 2. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create Tables (Dependency Order)

-- 3.1 Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  logo_url TEXT,
  branding_config JSONB DEFAULT '{
    "primaryColor": "#ccff00",
    "secondaryColor": "#a855f7",
    "fontFamily": "Inter"
  }'::jsonb,
  task_property_definitions JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Maps to auth.users.id ideally, but for now standalone
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role TEXT DEFAULT 'MEMBER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 Workspace Members (Join Table)
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 3.4 Strategies
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  business_context JSONB DEFAULT '{}'::jsonb,
  market_sizing JSONB DEFAULT '{}'::jsonb,
  competitive_analysis JSONB DEFAULT '{}'::jsonb,
  target_audience JSONB DEFAULT '{}'::jsonb,
  marketing_objectives JSONB DEFAULT '{}'::jsonb,
  product_strategy JSONB DEFAULT '{}'::jsonb,
  pricing_strategy JSONB DEFAULT '{}'::jsonb,
  distribution_strategy JSONB DEFAULT '{}'::jsonb,
  promotion_mix JSONB DEFAULT '{}'::jsonb,
  budget_allocation JSONB DEFAULT '{}'::jsonb,
  team_structure JSONB DEFAULT '{}'::jsonb,
  tech_stack JSONB DEFAULT '{}'::jsonb,
  kpis JSONB DEFAULT '{}'::jsonb,
  risks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 Personas
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  description TEXT,
  core_profile JSONB DEFAULT '{}'::jsonb,
  professional JSONB DEFAULT '{}'::jsonb,
  goals JSONB DEFAULT '{}'::jsonb,
  purchasing JSONB DEFAULT '{}'::jsonb,
  technology JSONB DEFAULT '{}'::jsonb,
  solution JSONB DEFAULT '{}'::jsonb,
  pain_points TEXT[] DEFAULT '{}',
  tone_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 Brand Voice
CREATE TABLE brand_voice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tone_keywords TEXT[] DEFAULT '{}',
  guidelines TEXT,
  dos TEXT[] DEFAULT '{}',
  donts TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planning',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  project_owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  priority TEXT DEFAULT 'MEDIUM',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  properties JSONB DEFAULT '{}'::jsonb,
  ai_score INTEGER,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 Trends
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  description TEXT,
  virality_score INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'MEDIUM',
  format TEXT,
  example_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- Workspaces: Public for now (or restrict to members)
CREATE POLICY "Public access for workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);

-- Users: Public for now
CREATE POLICY "Public access for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Workspace Members: View own or workspace members
CREATE POLICY "View workspace members" ON workspace_members FOR SELECT USING (true);
CREATE POLICY "Join workspace" ON workspace_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Manage workspace members" ON workspace_members FOR ALL USING (true);

-- Strategies, Personas, Brand Voice: Public for now (simplify dev)
CREATE POLICY "Public strategies" ON strategies FOR ALL USING (true);
CREATE POLICY "Public personas" ON personas FOR ALL USING (true);
CREATE POLICY "Public brand_voice" ON brand_voice FOR ALL USING (true);

-- Projects: Public for now
CREATE POLICY "Public projects" ON projects FOR ALL USING (true);

-- Tasks: Public for now
CREATE POLICY "Public tasks" ON tasks FOR ALL USING (true);

-- Trends: Public read
CREATE POLICY "Public trends" ON trends FOR ALL USING (true);

-- 6. Seed Data (Optional - Basic Setup)
INSERT INTO trends (title, platform, description, virality_score, difficulty, format) VALUES
('Wes Anderson Style', 'TikTok', 'Symmetrical composition, pastel colors.', 95, 'HARD', 'Visual Style'),
('Tube Girl Effect', 'TikTok', 'Filming confidently on public transport.', 88, 'EASY', 'Challenge');
