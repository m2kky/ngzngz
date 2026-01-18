# Properties, Relations, Automations

## Properties (لكل Entity Type)
- System Properties (ثابتة)
  - Task: Status, Assignee, Due date, Priority, Client, Project
  - Project: Status, Owner, Start/End, Client
  - Meeting: Start/End, Attendees, Client/Project, Location
  - Client: Status, Primary contact, Links
  - User (Member): Name, Nickname, Title, Avatar, Role, Status
  - Workspace: Name, Theme, Background, Logo (اختياري)
- Custom Properties (يضيفها الـ workspace)
  - Text / Number / Date / Select / Multi-select / Checkbox
  - Person
  - Files (Uploads/Links/Drive)
  - Relation
  - Rollup (MVP-optional)
  - Formula (Later)

## Relations (Notion-like)
- Relation يربط بين:
  - Client ↔ Projects
  - Project ↔ Tasks
  - Client/Project ↔ Meetings
  - Strategy ↔ Projects/Tasks
  - Ads Campaign ↔ Project/Task
- عرض الـ relation داخل الـ Record كـ embedded view (Table/Board)

## Rollups (اختياري في MVP)
- Count tasks by status داخل project
- Sum hours/time-tracking داخل project
- Last meeting date داخل client

## Automations (Workspace-level)
- Trigger → Conditions → Actions

### Status Templates (Default)
- كل Workspace بيبدأ بـ Task Status workflow افتراضي (قابل للتعديل)
- علشان Client Portal يشتغل بشكل موحّد لازم نثبت:
  - “Client Review” status (اسم/ID)
  - Next status عند accept
  - Prev status عند comment/request changes

### Triggers (أمثلة)
- Task created/updated
- Status changed to Done
- Due date passed (overdue)
- Meeting ended
- Ads metric dropped (ROAS < X) (Later)
- Client portal: task accepted
- Client portal: comment/request changes

### Conditions (أمثلة)
- Client = X
- Priority = Urgent
- Assignee is empty
- Tag contains "Content"

### Actions (أمثلة)
- Create task
- Update property
- Notify (in-app)
- Send email (Gmail integration)
- Create calendar event (Later)
- Webhook (Later)
- Update status based on workflow rule

## Automation Runs
- سجل تشغيل (نجاح/فشل) + السبب + من نفّذ

---

## Client Review Workflow (Portal-driven)

### Statuses المقترحة (MVP)
- Working → Internal Review → Client Review → Approved/Done

### قواعد الانتقال (بالأتمتة)
- عند “Client Accept”:
  - Action: Update status إلى “المرحلة التالية” (configurable per workspace/client/project)
- عند “Client Comment / Request Changes”:
  - Action: Update status إلى “المرحلة السابقة” (configurable)
  - Action: Increment revision counter على الـ Task
  - Action: Notify assignee/owner في Inbox

### Metrics (للـ KPIs)
- على كل “Client Accept/Comment” نسجل event في Activity:
  - actor = client user
  - round number
  - status before/after
  - optional comment
