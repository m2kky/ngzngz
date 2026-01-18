# Meetings (تفصيلي) — Calendar + Record (Notion-like)

الهدف من Meetings:
- إدارة المواعيد داخل الـ Workspace وربطها بالـ Clients/Projects/Tasks
- تحويل الاجتماع إلى قرارات + Action Items قابلة للتنفيذ
- نفس تجربة الـ Record الموحدة (Properties + Body + Comments/Activity)

---

## 1) Meetings Database Page

### 1.1 Desktop Layout
- **Header**
  - Title: Meetings
  - Actions: New Meeting + Saved Views
- **Toolbar**
  - View selector: Calendar / List / Table
  - Search
  - Filter
  - Sort
  - Date range (Calendar)
  - Columns (Table)
- **Content**
  - Calendar view افتراضي (الأكثر منطقية)
  - List/Table للمتابعة التشغيلية
- **Right Sheet**
  - click على meeting → يفتح Meeting Sheet
  - Open as page

### 1.2 Mobile Layout
- **Header**
  - Title + view dropdown + filter icon
- **Default**
  - Calendar + Day agenda drawer
- **FAB**
  - Create meeting
- **Open record**
  - full page افتراضيًا

---

## 2) Views

### 2.1 Calendar View
- Month/Week/Day toggle (desktop)
- Tap/Click على يوم:
  - يظهر Day agenda panel (desktop side panel / mobile bottom sheet)
- Drag to reschedule (desktop)
- Visual indicators:
  - meetings linked لعميل معيّن لون chip حسب client color (اختياري)

### 2.2 List View
- Grouping:
  - by date (default)
  - by client
  - by project
- Quick actions:
  - mark as done (لو عندنا status للmeeting)
  - join link (لو online)

### 2.3 Table View
- Columns = properties (Client/Project/Owner/Start/End/Attendees)
- Inline edit للوقت والمكان والعميل

---

## 3) Meeting Record (Sheet/Page)

### 3.1 Properties (System defaults)
- Title (required)
- Start time / End time (required)
- Location (link أو عنوان)
- Client (relation)
- Project (relation)
- Attendees (persons)
- Owner (person)
- Status (Scheduled/Done/Cancelled) (اختياري MVP)
- Tags (optional)

### 3.2 Body (Tiptap)
Sections مقترحة (templates):
- Agenda
- Notes
- Decisions
- Action Items (قائمة)

### 3.3 Create tasks from meeting (Flow)
- من داخل قسم Action Items:
  - Add action item (سطر)
  - Convert to Task
  - يفتح Create Task Sheet (desktop) / Full page (mobile)
- Default mapping:
  - Task title = نص الـ action item
  - Linked meeting = current meeting
  - Client/Project = لو موجودين على الـ meeting، يتورّثوا تلقائيًا
  - Assignee = اختيار سريع من Attendees (اختياري)
  - Due date = نفس يوم الاجتماع (اختياري)
- Post-create:
  - action item يتحول إلى task reference chip
  - يظهر activity event “Task created from meeting”

### 3.4 Comments + Activity
- Comments thread داخل Meeting (مثل باقي الـ Records)
- Activity:
  - created/rescheduled
  - attendee added/removed
  - linked client/project changed
  - tasks created from meeting

---

## 4) Automations (Meetings)

### 4.1 Triggers
- Meeting created
- Meeting time changed
- Meeting marked Done
- Attendee added

### 4.2 Actions (أمثلة)
- Send inbox notification للـ Attendees قبلها بـ X
- Create follow-up task تلقائيًا عند “Done”
- Post system message في Chat channel الخاص بالـ Client/Project (لو متاح)

---

## 5) Templates (اختياري MVP)
- Template: “Weekly Status”
  - Agenda ثابتة
  - Metrics checklist
  - Decisions + Action Items
- Template: “Client Kickoff”
  - Goals
  - Scope
  - Timeline
  - Risks

---

## 6) Permissions (RBAC)
- View meetings:
  - Members داخل الـ Workspace حسب visibility policy
- Create/Edit meeting:
  - Member (افتراضيًا) أو Manager+ (لو محتاجين ضبط)
- Delete meeting:
  - Owner/Admin أو creator (اختياري)
- Edit attendees:
  - Owner/Organizer + Manager+

---

## 7) Edge Cases
- Overlapping meetings:
  - warning chip في record (بدون منع كامل)
- Timezones:
  - display حسب user timezone + تخزين UTC
- Online meeting link:
  - لو موجود “Join” button في sheet/header
