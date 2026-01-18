# Page Specs (Desktop + Mobile)

الوثيقة دي بتحدد شكل كل صفحة، مكوناتها، ومميزات الـ MVP.

## 1) Dashboard

### Desktop
- Widgets grid:
  - Overdue Tasks
  - Upcoming Meetings
  - Active Projects
  - Client health (اختياري)
- Recent activity timeline
- Quick actions: Create Task / Meeting / Client / Project
- Entry: Inbox / Chat / AI

### Mobile
- نفس المحتوى لكن stacked cards
- CTA واضح أعلى الصفحة + FAB

## 2) Inbox

### Desktop
- Left: filters/tabs (All, Mentions, Tasks, Automations, System)
- Center: list of notifications (virtualized)
- Right (optional): preview panel للنوتيفيكيشن/الـ record
- Actions per item: Mark read, Snooze, Go to source

### Mobile
- Tabs أعلى + list
- فتح item → sheet/صفحة تعرض التفاصيل + زر Go to source

## 3) Chat

### Desktop
- Left: channels/DM
- Center: messages (virtualized) + composer
- Right: context panel (linked records / pinned / members)
- Message actions: reply thread, pin, create task, link to record

### Mobile
- Channels list → chat thread
- composer ثابت أسفل
- long-press actions

## 4) Clients (Database)

### Desktop
- View Tabs: Gallery/Table
- Toolbar: search + filters (status, owner, tags)
- Client card: logo + name + health + last activity
- Open record: sheet (tabs داخل sheet)

### Client Record (Tabs)
- Overview: contacts + links + quick stats
- Strategy Hub: strategies index + open strategy record
- Brand Kit: colors/fonts/assets
- Ads: accounts + campaigns snapshot
- Emails/Drive: linked threads/files
- Related: embedded views (projects/tasks/meetings) مفلترة على العميل

### Mobile
- Clients: gallery/list
- Client record: page tabs (segmented control) + scroll

## 5) Projects (Database)

### Desktop
- Views: Board/Table/Timeline/Calendar
- Project cards: status + dates + owner + client chip
- Open record:
  - properties
  - overview sections
  - embedded: tasks view + meetings view + assets

### Mobile
- Default view: List + quick filter chips
- Project record full page + embedded “Project Tasks” كقائمة قابلة للطي

## 6) Tasks (Database) — أهم صفحة

### Desktop
- Views: Board/List/Table/Calendar/Timeline
- Toolbar:
  - View selector
  - Search
  - Filters (AND/OR)
  - Sort
  - Group (Board/List)
  - Saved views (private/shared)
- Default views (MVP):
  - My Tasks
  - Overdue
  - This Week
  - By Client (board grouped)
- Open task:
  - Sheet: properties row + body editor + comments/activity
  - Open as page لعرض كامل

### Mobile
- Default: List view
- Top: view dropdown + filter icon + search
- Chips: client/assignee/status
- Open task: full page
- Quick edit: bottom sheet لتعديل status/assignee/due بسرعة

## 7) Meetings (Database)

### Desktop
- Views: Calendar/List/Table
- Meeting record:
  - properties (client/project/attendees/time)
  - agenda + notes (Tiptap)
  - action items → create tasks

### Mobile
- Calendar + list
- meeting page + زر “Create tasks from notes”

## 8) Strategy Hub (Index + Record)

### Desktop
- Strategy index: table/list + filters by client/status
- Strategy record:
  - sections: SOSTAC
  - linked projects/tasks
  - attachments

### Mobile
- index list + record tabs/accordion

## 9) Brand Kit (Index + Record)

### Desktop
- Brand kits list + search by client
- Brand record:
  - colors palette
  - typography
  - assets library
  - guidelines (Tiptap)

### Mobile
- simplified palette + assets list + guidelines

## 10) Ads

### Desktop
- Workspace Ads overview: filter client/platform
- Pages: accounts, campaigns, creatives
- KPIs cards + tables (virtualized)
- Live mode: refresh on demand + alerts

### Mobile
- Default: client picker + campaigns list + KPIs
- deep link من client record إلى ads tab

## 11) Dojo (XP + تحفيز)

### الهدف
- رفع الإنتاجية بشكل بسيط: XP على شغل حقيقي + وضوح مكافآت السلوك
- تقليل التسويف: streaks + daily missions
- تحسين الجودة: bonus على on-time + مراجعات + تعاون

### Desktop
- Header: Dojo + Tabs
  - My Progress
  - Quests
  - Achievements
  - Leaderboard
- My Progress:
  - Profile hero (Level + XP bar + rank + streak)
  - Cards: This week XP / Tasks completed / On-time rate (اختياري)
  - XP History list (آخر 20 حركة) + filters بسيطة
- Quests:
  - Daily (3–5 مهام)
  - Weekly (2–3 أهداف)
  - كل quest: progress + XP reward + زر “Go to source”
- Achievements:
  - grid + rarity + progress للـ locked
- Leaderboard:
  - داخل الـ Workspace
  - toggle (Month/Week) (اختياري)

### Mobile
- نفس التابات لكن كـ segmented control أعلى
- Default: My Progress
- Quests كقائمة cards + progress ring
- Achievements grid 2 columns

### قواعد XP (MVP)
- Task done: +X
- On-time bonus: +Y (لو خلص قبل/عند due)
- Overdue complete: +0 أو +low (حسب سياسة الـ Workspace)
- Collaboration: +Z (comment مفيد / mention resolve) (اختياري)
- Anti-abuse:
  - cap يومي للـ XP من نفس النوع
  - no XP على toggling status بسرعة

## 11) Automations

### Desktop
- list of automations (enabled/disabled)
- builder (stepper):
  - Trigger → Conditions → Actions
- runs history + error log

### Mobile
- list + simple builder (wizard) في MVP

## 12) Settings

### Desktop
- Workspace settings: members/roles
- Properties manager
- Views manager
- Integrations
- AI policy settings + agent history
- Dojo settings:
  - XP rules presets + caps
  - Leaderboard on/off
  - quest templates (اختياري MVP)
- Appearance:
  - Theme: dark/light/system
  - Background: color/gradient/image + overlay
- Members & Profiles:
  - member card: avatar + name + nickname + title + role + status
  - edit profile (name/nickname/title/avatar)
- Invites:
  - create invite (email/link)
  - set role + scope (workspace-wide أو client-scoped)
  - allowed clients picker (لو client-scoped)
  - expiry + revoke
- Client Portal:
  - define “Client Review” status
  - define accept-next-status + comment-prev-status (via automations)
  - review analytics (acceptance rate, revisions)
  - status template (اختياري): تطبيق قالب statuses جاهز للـ Tasks

### Mobile
- read-mostly + actions الأساسية

---

## 13) Client Portal (Public)

### الهدف
- العميل يشوف فقط الشغل المطلوب مراجعته (Client Review)
- يقدر يعمل Accept أو يطلب تعديل مع Comment

### Desktop/Mobile (Responsive)
- Header: Client logo + workspace name + user identity (client)
- Tabs:
  - Review Tasks (default)
  - History (اختياري MVP)
- Review Tasks list:
  - cards/table: title + due + assignee + last update + revision count
  - filter: All / Needs review / Done
- Task review view:
  - Deliverable preview (links/files/images) + description
  - Comment box
  - Actions:
    - Accept
    - Request changes
    - (اختياري) Suggest edit (محدود)
