# Ninjawy vNext - Implementation Plan

> **هذا الملف جزء من خطة شاملة مقسمة لـ 3 أجزاء لتسهيل المتابعة**

---

# Part 1: Foundation + Database Schema

## Phase 0: Project Foundation

### 0.1 Initialize Project

```bash
cd d:/ngz/web
npm install
```

### 0.2 Install Dependencies

```bash
# Core
npm install @tanstack/react-router @tanstack/react-query zustand

# UI
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-popover @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-slot
npm install lucide-react
npm install framer-motion

# Forms + Validation
npm install react-hook-form zod @hookform/resolvers

# Data
npm install @supabase/supabase-js

# Views
npm install @tanstack/react-table @tanstack/react-virtual
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-day-picker date-fns

# Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-mention @tiptap/extension-task-list @tiptap/extension-task-item
```

### 0.3 Folder Structure

```
src/
├── app/                    # App entry + providers
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/             # Shell, Sidebar, BottomBar
│   ├── records/            # RecordSheet, RecordPage
│   ├── views/              # TableView, BoardView, etc.
│   ├── properties/         # PropertyRow, PropertyEditor
│   └── editor/             # Tiptap components
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   ├── clients/
│   ├── projects/
│   ├── meetings/
│   ├── inbox/
│   ├── chat/
│   ├── strategy/
│   ├── brandkit/
│   ├── ads/
│   ├── dojo/
│   ├── automations/
│   └── settings/
├── hooks/                  # Custom hooks
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── constants.ts
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
└── routes/                 # TanStack Router routes
```

---

## Phase 1: Database Schema (Supabase SQL)

### 1.1 Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKSPACES
-- ============================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  background_type TEXT DEFAULT 'color' CHECK (background_type IN ('color', 'gradient', 'image')),
  background_value TEXT DEFAULT '#1a1a2e',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  nickname TEXT,
  title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKSPACE MEMBERS (RBAC)
-- ============================================
CREATE TYPE user_role AS ENUM (
  'owner', 'admin', 'manager', 'strategist', 'creative', 'analyst', 'hr', 'guest'
);

CREATE TYPE access_scope AS ENUM ('workspace', 'client');

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'guest',
  access_scope access_scope NOT NULL DEFAULT 'workspace',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Client-scoped access (when access_scope = 'client')
CREATE TABLE member_client_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  client_id UUID NOT NULL, -- References clients table
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, client_id)
);

-- ============================================
-- INVITES
-- ============================================
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT,
  token TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'guest',
  access_scope access_scope NOT NULL DEFAULT 'workspace',
  allowed_client_ids UUID[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Clients Module

```sql
-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  owner_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  notes_doc JSONB DEFAULT '{}', -- Tiptap JSON
  custom_properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_clients_status ON clients(status);
```

### 1.3 Projects Module

```sql
-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
  owner_id UUID REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  tags TEXT[] DEFAULT '{}',
  body_doc JSONB DEFAULT '{}',
  custom_properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_client ON projects(client_id);
```

### 1.4 Tasks Module

```sql
-- ============================================
-- TASK STATUS TEMPLATES
-- ============================================
CREATE TABLE task_status_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  statuses JSONB NOT NULL DEFAULT '[
    {"key": "backlog", "label": "Backlog", "color": "#6b7280", "order": 0},
    {"key": "in_progress", "label": "In Progress", "color": "#3b82f6", "order": 1},
    {"key": "internal_review", "label": "Internal Review", "color": "#f59e0b", "order": 2},
    {"key": "client_review", "label": "Client Review", "color": "#8b5cf6", "order": 3},
    {"key": "approved", "label": "Approved", "color": "#10b981", "order": 4},
    {"key": "done", "label": "Done", "color": "#22c55e", "order": 5},
    {"key": "archived", "label": "Archived", "color": "#9ca3af", "order": 6}
  ]',
  client_review_status TEXT DEFAULT 'client_review',
  accept_next_status TEXT DEFAULT 'approved',
  reject_prev_status TEXT DEFAULT 'internal_review',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Core properties
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'backlog',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  start_date DATE,
  
  -- Assignees (multiple)
  assignee_ids UUID[] DEFAULT '{}',
  
  -- Content
  body_doc JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Client Review tracking
  revision_count INTEGER DEFAULT 0,
  review_round INTEGER DEFAULT 1,
  first_submitted_at TIMESTAMPTZ,
  last_client_response_at TIMESTAMPTZ,
  
  -- Custom
  custom_properties JSONB DEFAULT '{}',
  
  -- Order for manual sorting
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignees ON tasks USING GIN(assignee_ids);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 1.5 Meetings Module

```sql
-- ============================================
-- MEETINGS
-- ============================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'done', 'cancelled')),
  
  attendee_ids UUID[] DEFAULT '{}',
  owner_id UUID REFERENCES users(id),
  
  -- Tiptap docs
  agenda_doc JSONB DEFAULT '{}',
  notes_doc JSONB DEFAULT '{}',
  
  tags TEXT[] DEFAULT '{}',
  custom_properties JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_workspace ON meetings(workspace_id);
CREATE INDEX idx_meetings_start ON meetings(start_time);
CREATE INDEX idx_meetings_client ON meetings(client_id);
```

### 1.6 Chat Module

```sql
-- ============================================
-- CHAT CHANNELS
-- ============================================
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'dm')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  member_ids UUID[] DEFAULT '{}', -- For private/dm channels
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'system', 'agent')),
  
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Linked records
  linked_records JSONB DEFAULT '[]', -- [{type: 'task', id: 'uuid'}, ...]
  
  -- Mentions
  mentioned_user_ids UUID[] DEFAULT '{}',
  
  is_pinned BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON chat_messages(channel_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);
```

### 1.7 Inbox/Notifications

```sql
-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN (
    'mention', 'task_assigned', 'task_due', 'task_overdue',
    'meeting_reminder', 'automation', 'ai_agent', 'system'
  )),
  
  title TEXT NOT NULL,
  body TEXT,
  
  -- Source reference
  source_type TEXT, -- 'task', 'meeting', 'message', 'automation', etc.
  source_id UUID,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  snoozed_until TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 1.8 Strategy Hub

```sql
-- ============================================
-- STRATEGIES (SOSTAC)
-- ============================================
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  
  -- SOSTAC sections (Tiptap JSON)
  situation_doc JSONB DEFAULT '{}',
  objectives_doc JSONB DEFAULT '{}',
  strategy_doc JSONB DEFAULT '{}',
  tactics_doc JSONB DEFAULT '{}',
  actions_doc JSONB DEFAULT '{}',
  control_doc JSONB DEFAULT '{}',
  
  owner_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategies_client ON strategies(client_id);
```

### 1.9 Brand Kit

```sql
-- ============================================
-- BRAND KITS
-- ============================================
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  
  -- Colors
  colors JSONB DEFAULT '{
    "primary": "#3b82f6",
    "secondary": "#64748b",
    "accent": "#f59e0b",
    "palette": []
  }',
  
  -- Typography
  typography JSONB DEFAULT '{
    "primary_font": "Inter",
    "secondary_font": "Inter",
    "guidelines": ""
  }',
  
  -- Guidelines (Tiptap)
  guidelines_doc JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BRAND ASSETS
-- ============================================
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_kit_id UUID NOT NULL REFERENCES brand_kits(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('logo', 'icon', 'image', 'video', 'document', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_assets_kit ON brand_assets(brand_kit_id);
```

### 1.10 Ads Module

```sql
-- ============================================
-- ADS ACCOUNTS
-- ============================================
CREATE TABLE ads_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'twitter', 'linkedin')),
  account_id TEXT NOT NULL, -- External platform account ID
  account_name TEXT,
  
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'disconnected')),
  
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  last_synced_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, platform, account_id)
);

-- ============================================
-- ADS CAMPAIGNS (synced from platforms)
-- ============================================
CREATE TABLE ads_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ads_account_id UUID NOT NULL REFERENCES ads_accounts(id) ON DELETE CASCADE,
  
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  objective TEXT,
  
  -- Metrics (updated on sync)
  spend DECIMAL(12, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  cpa DECIMAL(10, 2),
  roas DECIMAL(10, 2),
  
  -- Notes (internal)
  notes_doc JSONB DEFAULT '{}',
  
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ads_account_id, external_id)
);

CREATE INDEX idx_campaigns_account ON ads_campaigns(ads_account_id);

-- ============================================
-- ADS ALERTS
-- ============================================
CREATE TABLE ads_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  rule_type TEXT NOT NULL CHECK (rule_type IN ('spend_spike', 'roas_drop', 'no_conversions', 'custom')),
  rule_config JSONB NOT NULL, -- {threshold: 20, period_hours: 24}
  
  campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

> **يتبع في Part 2: Dojo, Automations, Properties System, Views System, Activity Log, RLS Policies**

