-- Ninja Gen Z - Master Database Schema
-- This file contains the complete schema for the application.
-- Run this in the Supabase SQL Editor to set up the entire database.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Workspaces Table (Clients/Agencies)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  logo_url TEXT,
  branding_config JSONB DEFAULT '{
    "primaryColor": "#ccff00",
    "secondaryColor": "#a855f7",
    "fontFamily": "Inter"
  }'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist (Migration safety)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{ "primaryColor": "#ccff00", "secondaryColor": "#a855f7", "fontFamily": "Inter" }'::jsonb;

-- 3. Create Strategies Table (SOSTAC Framework)
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
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

-- Ensure workspace_id exists (Fix for "column does not exist" error)
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS business_context JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS market_sizing JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS competitive_analysis JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS marketing_objectives JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS product_strategy JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS pricing_strategy JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS distribution_strategy JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS promotion_mix JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS budget_allocation JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS team_structure JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}'::jsonb;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS risks JSONB DEFAULT '{}'::jsonb;

-- 4. Create Personas Table
CREATE TABLE IF NOT EXISTS personas (
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

-- Ensure columns exist
ALTER TABLE personas ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS core_profile JSONB DEFAULT '{}'::jsonb;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS professional JSONB DEFAULT '{}'::jsonb;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '{}'::jsonb;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS purchasing JSONB DEFAULT '{}'::jsonb;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS technology JSONB DEFAULT '{}'::jsonb;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS solution JSONB DEFAULT '{}'::jsonb;

-- 5. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role TEXT DEFAULT 'MEMBER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  priority TEXT DEFAULT 'MEDIUM',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  ai_score INTEGER,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_score INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

-- 7. Create Brand Voice Table
CREATE TABLE IF NOT EXISTS brand_voice (
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

-- Ensure columns exist
ALTER TABLE brand_voice ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice ENABLE ROW LEVEL SECURITY;

-- 9. Create Access Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Public access for workspaces" ON workspaces;
CREATE POLICY "Public access for workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for strategies" ON strategies;
CREATE POLICY "Public access for strategies" ON strategies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for personas" ON personas;
CREATE POLICY "Public access for personas" ON personas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for tasks" ON tasks;
CREATE POLICY "Public access for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for users" ON users;
CREATE POLICY "Public access for users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for brand_voice" ON brand_voice;
CREATE POLICY "Public access for brand_voice" ON brand_voice FOR ALL USING (true) WITH CHECK (true);

-- 10. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_strategies_workspace ON strategies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_personas_workspace ON personas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brand_voice_workspace ON brand_voice(workspace_id);

-- 11. Dynamic Properties Support
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS properties JSONB DEFAULT '{}'::jsonb;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS task_property_definitions JSONB DEFAULT '[]'::jsonb;
