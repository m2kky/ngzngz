# Ninjawy vNext - Implementation Tasks

## Phase 0: Project Foundation
- [x] 0.1 ~~Initialize Vite + React + TypeScript~~ (موجود في `web/`)
- [ ] 0.2 Install and configure all dependencies (TanStack Router, Query, Zustand, etc.)
- [ ] 0.3 Setup Tailwind CSS + shadcn/ui + design tokens
- [ ] 0.4 Configure Supabase client + environment variables
- [ ] 0.5 Create folder structure (features, components, hooks, lib, types)


## Phase 1: Database Schema (Supabase)
- [ ] 1.1 Core tables: workspaces, users, workspace_members
- [ ] 1.2 Clients module tables
- [ ] 1.3 Projects module tables
- [ ] 1.4 Tasks module tables (with status workflow)
- [ ] 1.5 Meetings module tables
- [ ] 1.6 Chat module tables (channels, messages)
- [ ] 1.7 Inbox/Notifications tables
- [ ] 1.8 Strategy Hub tables
- [ ] 1.9 Brand Kit tables
- [ ] 1.10 Ads module tables
- [ ] 1.11 Dojo (XP/Gamification) tables
- [ ] 1.12 Automations tables
- [ ] 1.13 Properties system tables (custom properties)
- [ ] 1.14 Views system tables (saved views)
- [ ] 1.15 Activity/Audit log tables
- [ ] 1.16 RLS Policies for all tables
- [ ] 1.17 Database functions and triggers

## Phase 2: Auth & Onboarding (تفصيلي)
- [ ] 2.1 Auth pages (Login with Email/Phone)
- [ ] 2.2 OTP input component (6 digits)
- [ ] 2.3 OTP verification flow (email + phone)
- [ ] 2.4 Protected routes setup
- [ ] 2.5 Onboarding wizard layout
- [ ] 2.6 Step 1: Welcome + Role selection
- [ ] 2.7 Step 2: Create/Join Workspace
- [ ] 2.8 Step 3: Invite Team (skippable)
- [ ] 2.9 Step 4: First Client (skippable)
- [ ] 2.10 Step 5: Integrations (skippable)
- [ ] 2.11 Step 6: Complete + redirect


## Phase 3: Shell & Navigation
- [ ] 3.1 Desktop Sidebar component
- [ ] 3.2 Mobile Bottom Bar component
- [ ] 3.3 Header component
- [ ] 3.4 Layout wrapper (responsive shell)
- [ ] 3.5 Workspace switcher
- [ ] 3.6 User menu/profile dropdown

## Phase 4: Core UI Components
- [ ] 4.1 Record Sheet (side panel for desktop)
- [ ] 4.2 Record Page (full page for mobile)
- [ ] 4.3 Properties Row component
- [ ] 4.4 Property editor by type (text, select, date, person, etc.)
- [ ] 4.5 Comments/Activity section
- [ ] 4.6 Tiptap Editor setup with blocks

## Phase 5: Database Views Engine
- [ ] 5.1 Table View component (TanStack Table + Virtual)
- [ ] 5.2 Board View component (Kanban with dnd-kit)
- [ ] 5.3 List View component
- [ ] 5.4 Calendar View component
- [ ] 5.5 Gallery View component
- [ ] 5.6 View Toolbar (search, filter, sort, group)
- [ ] 5.7 Filter Builder UI
- [ ] 5.8 Saved Views management

## Phase 6: Tasks Module
- [ ] 6.1 Tasks database page
- [ ] 6.2 Task record (sheet/page)
- [ ] 6.3 Task properties (system + custom)
- [ ] 6.4 Status workflow system
- [ ] 6.5 Quick edit (mobile bottom sheet)
- [ ] 6.6 Bulk actions (desktop)

## Phase 7: Clients Module
- [ ] 7.1 Clients database page
- [ ] 7.2 Client record with tabs
- [ ] 7.3 Overview tab
- [ ] 7.4 Related tab (embedded views)

## Phase 8: Projects Module
- [ ] 8.1 Projects database page
- [ ] 8.2 Project record
- [ ] 8.3 Embedded Tasks/Meetings views

## Phase 9: Meetings Module
- [ ] 9.1 Meetings database page (Calendar default)
- [ ] 9.2 Meeting record
- [ ] 9.3 Action Items → Create Task flow

## Phase 10: Inbox Module
- [ ] 10.1 Inbox page with filters
- [ ] 10.2 Notification item component
- [ ] 10.3 Mark read/Snooze actions
- [ ] 10.4 Go to source navigation

## Phase 11: Chat Module
- [ ] 11.1 Channels sidebar
- [ ] 11.2 Messages thread
- [ ] 11.3 Message composer with mentions
- [ ] 11.4 Create task from message
- [ ] 11.5 Record linking

## Phase 12: Dashboard
- [ ] 12.1 Dashboard layout
- [ ] 12.2 Widgets (Overdue Tasks, Upcoming Meetings, etc.)
- [ ] 12.3 Quick actions
- [ ] 12.4 Recent activity

## Phase 13: Strategy Hub
- [ ] 13.1 Strategies index page
- [ ] 13.2 Strategy record (SOSTAC sections)
- [ ] 13.3 Client Strategy Hub tab

## Phase 14: Brand Kit
- [ ] 14.1 Brand kits index page
- [ ] 14.2 Brand record (colors, typography, assets)
- [ ] 14.3 Client Brand Kit tab

## Phase 15: Ads Module
- [ ] 15.1 Ads overview page
- [ ] 15.2 Accounts page
- [ ] 15.3 Campaigns page with drilldown
- [ ] 15.4 Client Ads tab
- [ ] 15.5 KPIs and alerts

## Phase 16: Dojo (Gamification)
- [ ] 16.1 Dojo page with tabs
- [ ] 16.2 My Progress section
- [ ] 16.3 Quests system
- [ ] 16.4 Achievements
- [ ] 16.5 Leaderboard
- [ ] 16.6 XP calculation logic

## Phase 17: Automations
- [ ] 17.1 Automations list page
- [ ] 17.2 Automation builder (trigger → conditions → actions)
- [ ] 17.3 Runs history

## Phase 18: Settings
- [ ] 18.1 Workspace settings
- [ ] 18.2 Members & Roles management
- [ ] 18.3 Properties manager
- [ ] 18.4 Views manager
- [ ] 18.5 Appearance settings (theme, background)
- [ ] 18.6 Invites management
- [ ] 18.7 Client Portal settings

## Phase 19: AI Assistant
- [ ] 19.1 AI Chat interface
- [ ] 19.2 Agent mode with approvals
- [ ] 19.3 Agent history

## Phase 20: Client Portal
- [ ] 20.1 Public portal layout
- [ ] 20.2 Review tasks list
- [ ] 20.3 Accept/Request changes flow

## Phase 21: Edge Functions (Supabase)
- [ ] 21.1 send-notification function
- [ ] 21.2 run-automation function
- [ ] 21.3 calculate-xp function
- [ ] 21.4 sync-ads function (Meta API)
- [ ] 21.5 send-email function (Resend/SendGrid)
- [ ] 21.6 Database triggers for automations

## Phase 22: Realtime Subscriptions
- [ ] 22.1 Realtime notifications
- [ ] 22.2 Realtime chat messages
- [ ] 22.3 Realtime task updates (Kanban)
- [ ] 22.4 Realtime presence (who's online)

## Phase 23: File Storage
- [ ] 23.1 Create storage buckets
- [ ] 23.2 Storage RLS policies
- [ ] 23.3 useFileUpload hook
- [ ] 23.4 FileUpload component
- [ ] 23.5 Image preview/gallery
- [ ] 23.6 Drag & Drop upload

## Phase 24: Meta Ads Integration
- [ ] 24.1 Meta OAuth flow
- [ ] 24.2 meta-oauth-callback Edge Function
- [ ] 24.3 sync-ads Edge Function
- [ ] 24.4 Ads refresh/sync UI
- [ ] 24.5 Token refresh logic

## Phase 25: Gmail Integration
- [ ] 25.1 Gmail OAuth flow
- [ ] 25.2 gmail-oauth-callback Edge Function
- [ ] 25.3 List emails Edge Function
- [ ] 25.4 Send email Edge Function
- [ ] 25.5 Client Emails tab UI

## Phase 26: Google Drive Integration
- [ ] 26.1 Drive OAuth flow
- [ ] 26.2 drive-oauth-callback Edge Function
- [ ] 26.3 List files Edge Function
- [ ] 26.4 Client Drive tab UI
- [ ] 26.5 Link file to task/project

## Phase 27: Internationalization (i18n)
- [ ] 27.1 Setup i18next
- [ ] 27.2 Arabic translations (full)
- [ ] 27.3 English translations
- [ ] 27.4 Language switcher
- [ ] 27.5 Save language preference

## Phase 28: RTL Layout
- [ ] 28.1 useDirection hook
- [ ] 28.2 Tailwind RTL utilities
- [ ] 28.3 Update components to logical properties
- [ ] 28.4 Test all layouts in RTL

## Phase 29: Accessibility (a11y)
- [ ] 29.1 Skip to content link
- [ ] 29.2 Focus trap for modals
- [ ] 29.3 ARIA labels
- [ ] 29.4 Keyboard navigation
- [ ] 29.5 Screen reader live region
- [ ] 29.6 Color contrast check

## Phase 30: Global Search
- [ ] 30.1 Full-text search setup
- [ ] 30.2 search_workspace function
- [ ] 30.3 GlobalSearch component (Cmd+K)
- [ ] 30.4 Search results UI
- [ ] 30.5 Recent searches

## Phase 31: Unit Testing
- [ ] 31.1 Setup Vitest
- [ ] 31.2 Test setup file (mocks)
- [ ] 31.3 Component tests
- [ ] 31.4 Hook tests
- [ ] 31.5 API tests
- [ ] 31.6 Coverage > 70%

## Phase 32: E2E Testing (Playwright)
- [ ] 32.1 Setup Playwright
- [ ] 32.2 Auth flow tests
- [ ] 32.3 Task CRUD tests
- [ ] 32.4 Mobile navigation tests
- [ ] 32.5 Keyboard navigation tests

## Phase 33: Deployment
- [ ] 33.1 Vercel project setup
- [ ] 33.2 Environment variables
- [ ] 33.3 Supabase production project
- [ ] 33.4 Deploy Edge Functions
- [ ] 33.5 Custom domain setup

## Phase 34: CI/CD (GitHub Actions)
- [ ] 34.1 CI workflow (lint, test, build)
- [ ] 34.2 Deploy workflow
- [ ] 34.3 Branch protection rules
- [ ] 34.4 Preview deployments

## Phase 35: Monitoring
- [ ] 35.1 Sentry setup
- [ ] 35.2 Error boundary
- [ ] 35.3 Performance monitoring
- [ ] 35.4 Analytics (optional)
