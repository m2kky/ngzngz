# Ninjawy vNext - Implementation Plan (Part 2)

> **استكمال Part 1: Dojo, Automations, Properties, Views, Activity, RLS**

---

## 1.11 Dojo (XP/Gamification)

```sql
-- ============================================
-- XP RULES
-- ============================================
CREATE TABLE dojo_xp_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN (
    'task_completed', 'task_on_time', 'task_overdue_complete',
    'first_pass_accept', 'collaboration', 'meeting_attended'
  )),
  
  xp_amount INTEGER NOT NULL DEFAULT 10,
  daily_cap INTEGER DEFAULT 100, -- Max XP per day from this action
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER XP
-- ============================================
CREATE TABLE dojo_user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- ============================================
-- XP HISTORY
-- ============================================
CREATE TABLE dojo_xp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_xp_id UUID NOT NULL REFERENCES dojo_user_xp(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  source_type TEXT, -- 'task', 'meeting', etc.
  source_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_history_user ON dojo_xp_history(user_xp_id);

-- ============================================
-- QUESTS
-- ============================================
CREATE TABLE dojo_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  
  -- Condition: {action: 'task_completed', count: 5}
  condition JSONB NOT NULL,
  xp_reward INTEGER NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER QUEST PROGRESS
-- ============================================
CREATE TABLE dojo_user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES dojo_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  period_start DATE NOT NULL, -- For daily/weekly reset
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(quest_id, user_id, period_start)
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE dojo_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- NULL = global
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Condition: {type: 'streak', value: 7}
  condition JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dojo_user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_id UUID NOT NULL REFERENCES dojo_achievements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(achievement_id, user_id)
);
```

---

## 1.12 Automations

```sql
-- ============================================
-- AUTOMATIONS
-- ============================================
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  is_enabled BOOLEAN DEFAULT true,
  
  -- Trigger: {type: 'task_status_changed', config: {to_status: 'done'}}
  trigger JSONB NOT NULL,
  
  -- Conditions: [{field: 'priority', operator: 'eq', value: 'urgent'}]
  conditions JSONB DEFAULT '[]',
  
  -- Actions: [{type: 'notify', config: {user_ids: [...], message: '...'}}]
  actions JSONB NOT NULL,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_workspace ON automations(workspace_id);

-- ============================================
-- AUTOMATION RUNS
-- ============================================
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  
  trigger_data JSONB,
  actions_executed JSONB,
  error_message TEXT,
  
  triggered_by_user_id UUID REFERENCES users(id),
  source_type TEXT,
  source_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_automation ON automation_runs(automation_id);
```

---

## 1.13 Properties System

```sql
-- ============================================
-- CUSTOM PROPERTY DEFINITIONS
-- ============================================
CREATE TABLE property_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'meeting', 'strategy')),
  
  name TEXT NOT NULL,
  key TEXT NOT NULL, -- Unique key for this entity_type
  
  property_type TEXT NOT NULL CHECK (property_type IN (
    'text', 'number', 'date', 'datetime', 'select', 'multi_select',
    'checkbox', 'person', 'file', 'url', 'email', 'phone', 'relation'
  )),
  
  -- Config: {options: [{value: 'a', label: 'A', color: '#...'}], relation_entity: 'project'}
  config JSONB DEFAULT '{}',
  
  is_required BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, entity_type, key)
);

CREATE INDEX idx_property_defs ON property_definitions(workspace_id, entity_type);
```

---

## 1.14 Saved Views System

```sql
-- ============================================
-- SAVED VIEWS
-- ============================================
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'meeting', 'strategy', 'ads_campaign')),
  
  name TEXT NOT NULL,
  
  -- View config
  layout TEXT NOT NULL CHECK (layout IN ('table', 'board', 'list', 'calendar', 'timeline', 'gallery')),
  
  -- Filters: {rules: [{field, operator, value}], groups: [{operator: 'and', rules: [...]}]}
  filters JSONB DEFAULT '{"rules": [], "groups": []}',
  
  -- Sorts: [{field: 'due_date', direction: 'asc'}]
  sorts JSONB DEFAULT '[]',
  
  -- Group by: {field: 'status'}
  group_by JSONB,
  
  -- Columns visibility/order for table: ['title', 'status', 'assignees', 'due_date']
  columns JSONB,
  
  -- Calendar specific: {date_field: 'due_date'}
  calendar_config JSONB,
  
  -- Access
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  owner_id UUID REFERENCES users(id),
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_views ON saved_views(workspace_id, entity_type);
```

---

## 1.15 Activity/Audit Log

```sql
-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  actor_id UUID REFERENCES users(id), -- NULL for system
  actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'ai_agent', 'client')),
  
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'assigned', 'status_changed', etc.
  
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Changes: {field: {old: 'x', new: 'y'}}
  changes JSONB,
  
  -- For client portal actions
  client_user_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  
  mentioned_user_ids UUID[] DEFAULT '{}',
  
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
```

---

## 1.16 RLS Policies

```sql
-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's workspaces
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(workspace_id)
  FROM workspace_members
  WHERE user_id = auth.uid() AND status = 'active'
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: Check if user can access client
CREATE OR REPLACE FUNCTION can_access_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_member workspace_members%ROWTYPE;
BEGIN
  SELECT wm.* INTO v_member
  FROM workspace_members wm
  JOIN clients c ON c.workspace_id = wm.workspace_id
  WHERE c.id = p_client_id
    AND wm.user_id = auth.uid()
    AND wm.status = 'active';
  
  IF v_member IS NULL THEN RETURN FALSE; END IF;
  IF v_member.access_scope = 'workspace' THEN RETURN TRUE; END IF;
  
  -- Client-scoped: check specific access
  RETURN EXISTS (
    SELECT 1 FROM member_client_access
    WHERE member_id = v_member.id AND client_id = p_client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Workspaces: Users can see workspaces they're members of
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT USING (id = ANY(get_user_workspace_ids()));

-- Clients: Based on workspace membership + client scope
CREATE POLICY "Users can view accessible clients" ON clients
  FOR SELECT USING (can_access_client(id));

CREATE POLICY "Users can insert clients" ON clients
  FOR INSERT WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "Users can update accessible clients" ON clients
  FOR UPDATE USING (can_access_client(id));

-- Tasks: Similar to clients
CREATE POLICY "Users can view tasks" ON tasks
  FOR SELECT USING (
    workspace_id = ANY(get_user_workspace_ids())
    AND (client_id IS NULL OR can_access_client(client_id))
  );

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (workspace_id = ANY(get_user_workspace_ids()));

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (
    workspace_id = ANY(get_user_workspace_ids())
    AND (client_id IS NULL OR can_access_client(client_id))
  );

-- Notifications: Users see only their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

---

## 1.17 Triggers

```sql
-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Task completed_at
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_completed_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_task_completed_at();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

> **يتبع في Part 3: Frontend Implementation Guide**

