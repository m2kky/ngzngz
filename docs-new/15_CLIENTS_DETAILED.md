# Clients (تفصيلي) — Database + Client Record (Tabs)

الهدف من Clients:
- يكون “CRM خفيف” داخل الـ workspace
- كل Client يبقى container للـ Strategy/Brand/Ads/Projects/Meetings
- نفس Notion-like record pattern (properties + body + embeds)

---

## 1) Clients Database Page

### 1.1 Desktop Layout
- Header:
  - Title: Clients
  - Actions: New Client + Saved Views
- Toolbar:
  - View selector: Gallery / Table
  - Search
  - Filter (Status, Owner, Tags, Last activity)
  - Sort (Name, Created, Last activity)
- Content:
  - Gallery default (cards)
  - Table للـ ops
- Open record:
  - sheet جانبي (default)
  - open as page

### 1.2 Mobile Layout
- Header + Search/Filter
- Default: List/Gallery مبسط
- Open record: full page

---

## 2) Client Card (Gallery)
- Logo/Avatar
- Client name
- Health badge (اختياري)
- Small stats:
  - Active projects count
  - Overdue tasks count
  - Next meeting date
- Quick actions (desktop hover):
  - Open
  - New project
  - New task

---

## 3) Client Record (Tabs) — Desktop/Mobile

### Tabs الأساسية
- Overview
- Strategy Hub
- Brand Kit
- Ads
- Emails
- Drive
- Related

### 3.1 Overview Tab
- Client header:
  - name + status
  - primary contact (name/email/phone)
  - social links
- Quick stats:
  - tasks open/overdue
  - projects active
  - meetings upcoming
- Notes (Tiptap):
  - “Client Notes” body
- Quick actions:
  - Create project for this client
  - Create task linked to this client
  - Schedule meeting
  - Connect ads account

### 3.2 Strategy Hub Tab
- Strategy index داخل العميل:
  - list/table للـ strategies
  - create new strategy
- Strategy record:
  - SOSTAC sections
  - linked projects/tasks
  - attachments
- AI actions (لو enabled):
  - propose objectives
  - summarize situation

### 3.3 Brand Kit Tab
- Colors:
  - primary/secondary/accent + palette
- Typography:
  - fonts + usage
- Assets library:
  - logos + brand assets
  - upload + tag
- Guidelines:
  - Tiptap doc
- Share (later):
  - public link read-only

### 3.4 Ads Tab
- Accounts:
  - connected platforms
  - status (ok/expired)
- Campaigns snapshot:
  - KPIs cards (spend, clicks, conversions, roas)
  - top campaigns table (virtualized)
- Actions:
  - open ads workspace page filtered by this client
  - refresh data (role-based)

### 3.5 Emails Tab
- Threads list (virtualized)
- Link email to:
  - project
  - task
- Create task from email

### 3.6 Drive Tab
- Root folder link
- File list (virtualized) + search
- Attach file to:
  - task/project/meeting

### 3.7 Related Tab (Embedded Views)
داخل client record تعرض database views جاهزة ومفلترة:
- Projects (table/board)
- Tasks (table/board)
- Meetings (list/calendar)
- Assets (gallery)

---

## 4) Client Properties (System defaults)
- Name (required)
- Logo/Avatar (image)
- Status (Active/Inactive)
- Primary contact name/email
- Website
- Social links
- Owner (person)
- Tags (multi-select)

Custom properties:
- SLA level
- Contract type
- Industry
- Budget range

---

## 5) Saved Views في Clients
- Active clients (default)
- Inactive clients
- By owner
- Needs attention (overdue tasks > 0)

---

## 6) UX Flows (أمثلة)

### Flow: من Client إلى كل الشغل المرتبط
- افتح client
- Related tab
- شوف Projects/Tasks/Meetings مفلترة تلقائيًا

### Flow: إنشاء Project من داخل Client
- Quick action → New project
- يفتح create sheet
- Client relation متحدد تلقائيًا

### Flow: Ads deep link
- Ads tab → Open in Ads workspace
- يفتح Ads page مع filter client=this

### Flow: Invite client-scoped member
- Settings → Invites
- Create invite:
  - Role (مثلاً Guest/Client)
  - Scope = Client-scoped
  - Allowed clients = [Client A]
- بعد قبول الدعوة:
  - المستخدم يشوف Client A فقط
  - Related/Tasks/Projects كلها auto-filtered
