# Tasks (تفصيلي) — Database + Record (Notion-like)

الهدف من صفحة Tasks:
- تكون “قاعدة البيانات” الأساسية لكل شغل الـ Workspace
- تديك Views/Filters قوية جدًا بدون ما تضيع السياق
- تفتح الـ Record بسرعة (Sheet على الديسكتوب / Full Page على الموبايل)

---

## 1) Tasks Database Page

### 1.1 Desktop Layout
- **Top Header (Page Header)**
  - Title: Tasks
  - Subtitle: workspace name / count
  - Primary actions:
    - New Task
    - Saved Views (dropdown)
    - Share View (لو shared)
- **Toolbar**
  - View selector (Tabs): Table / Board / List / Calendar / Timeline
  - Search (global داخل tasks)
  - Filter (builder)
  - Sort
  - Group (يتفعل حسب view)
  - Columns (Table فقط)
  - Density (اختياري: Comfortable/Compact)
- **Content**
  - حسب الـ view المختار
  - Virtualization تلقائيًا في Table/List
- **Right Sheet**
  - عند الضغط على أي row/card يفتح Task sheet
  - زر Open as page يفتح route كاملة

### 1.2 Mobile Layout
- **Mobile Header**
  - Title: Tasks
  - Actions: Search icon + Filter icon + View switcher (dropdown)
- **Chips row (sticky تحت الهيدر)**
  - chips للفلاتر النشطة (Client: X, Assignee: Me, Status: Doing…)
  - Clear all
- **Content**
  - Default = List (أسرع)
  - Board/Calendar اختيارية من view dropdown
- **FAB**
  - Create task
- **Open record**
  - full page افتراضيًا
  - Quick edit bottom sheet للـ properties الأساسية

---

## 2) Views (أنواع العرض) + تفاصيل UI

### 2.1 Table View
- Columns = properties
- Inline edit:
  - Status, Priority, Assignee, Dates, Selects
  - Title editable (single line)
- Row interactions:
  - click = open record
  - multi-select + bulk actions (desktop فقط في MVP)
- Performance:
  - virtualization + sticky header

### 2.2 Board View (Kanban)
- Group by:
  - Status (default)
  - أي Select/Status property
  - Client (اختياري)
- Drag & Drop:
  - نقل card بين الأعمدة يغيّر property
  - reorder داخل العمود
- Column header:
  - اسم المجموعة + count
  - column menu (collapse, color, sort)

### 2.3 List View
- Grouping:
  - by status / by client / by assignee / none
- Expand/Collapse لكل group
- Quick actions:
  - checkbox done (لو status workflow)
  - due date inline

### 2.4 Calendar View
- Date property:
  - due date (default)
  - أو أي date property
- Drag to reschedule (desktop)
- Day detail drawer (mobile) يطلع tasks في اليوم

### 2.5 Timeline View (اختياري في MVP)
- يعتمد على start_date + end_date
- مناسب للمشاريع الكبيرة

---

## 3) Filter System (MVP spec)

### 3.1 Filter Builder UI (Desktop)
- Button “Filter” يفتح popover/panel:
  - Add rule
  - Add group (AND/OR)
  - Apply / Reset
- Rule شكلها:
  - Property → Operator → Value

### 3.2 Filter Builder UI (Mobile)
- Full-screen sheet:
  - Step 1: Quick filters
  - Step 2: Rules + Groups
  - Apply / Clear

### 3.3 Quick Filters (متاحة في كل views)
- Assigned to me
- Unassigned
- Due today / This week
- Overdue
- By client (client picker)
- By project (project picker)

### 3.4 Operators حسب property type
- Text: contains / not contains / is empty
- Number: = / > / < / between
- Select/Status: is / is not / in
- Multi-select: contains any / contains all
- Person: is / is not / includes
- Date: before / after / between / next N days / past N days
- Checkbox: checked / unchecked
- Relation: contains / does not contain

---

## 4) Saved Views (سلوك)

### أنواع الـ View
- Private: للمستخدم فقط
- Shared: للـ workspace
- Default: default view للـ Tasks

### ما الذي يتم حفظه داخل Saved View؟
- layout: table/board/list/calendar/timeline
- filters (rules + groups)
- sorts
- groupBy (إن وجد)
- columns visibility/order (table)
- calendar date property (calendar)
- timeline range (timeline)

### Permissions
- Owner/Admin:
  - إنشاء shared views
  - تعيين default
- Member:
  - private views
  - shared views لو عنده permission (later)

---

## 5) Task Record (Sheet/Page) — تفاصيل UI

### 5.1 Desktop Task Sheet
- Header:
  - icon + title editable
  - actions: open as page / duplicate / archive
- Properties row (editable):
  - Status, Priority, Assignee, Due date
  - Client, Project (relations)
  - Custom properties section
  - Add property
- Body:
  - Tiptap editor (brief + checklist + sections)
  - Embeds (Database view embed) داخل المهام (later)
- Comments + Activity:
  - تبويب: Comments | Activity

### 5.2 Mobile Task Page
- Top bar:
  - back + title + actions
- Properties:
  - horizontal scroll أو stacked compact
- Body:
  - Tiptap editor
- Comments/Activity:
  - accordion أو tabs

### 5.3 Quick Edit (Mobile)
- Bottom sheet لتعديل:
  - Status
  - Assignee
  - Due date
  - Priority

---

## 6) Task Properties (System defaults)
- Title (required)
- Status (workflow)
- Priority
- Assignee(s)
- Due date
- Client (relation)
- Project (relation)
- Tags (multi-select)

Properties إضافية (للـ Client Review + KPIs):
- Revision count (رقم): عدد مرات رجوع التاسك من العميل لتعديل
- Review round (رقم): رقم الجولة الحالية (1,2,3…)
- First submitted at (date-time) (اختياري)
- Last client response at (date-time) (اختياري)
- Last submitted by (person) (اختياري)

Custom properties يضيفها الـ workspace حسب احتياجه.

---

## 6.1 Status Workflow Template (قياسي للـ Workspace)

### الهدف
نثبت “قائمة statuses افتراضية” لكل Workspace بحيث:
- Client Portal يعرف يفلتر على “Client Review” بشكل موحّد
- Automations تبقى أبسط (Accept/Comment rules)
- KPIs تبقى قابلة للمقارنة (First-pass/Second-pass…)

### Default Status Set (MVP)
- Backlog
- In Progress
- Internal Review
- Client Review
- Approved
- Done
- Archived

### قواعد الانتقال المقترحة
- Team flow:
  - Backlog → In Progress → Internal Review → Client Review
- Client portal:
  - Accept على Client Review:
    - ينقل إلى Approved (أو أي status “next” متحدد في إعدادات الـ workflow)
  - Request changes + comment على Client Review:
    - يرجّع إلى Internal Review (أو أي status “prev” متحدد)
    - Revision count += 1
    - Review round += 1

### ملاحظة
الـ Workspace يقدر يغيّر أسماء الـ statuses أو يزيد/يقلّل، لكن لازم يحدد:
- أي status هو “Client Review”
- الـ next status عند accept
- الـ prev status عند comment

---

## 7) Client Review Workflow (Portal)

### 7.1 Statuses (مثال)
- Working → Internal Review → Client Review → Approved/Done

### 7.2 Portal Actions وتأثيرها
- Accept:
  - ينتقل للـ status التالية مباشرة (تعريفها بالأتمتة)
  - لو دي أول موافقة (Review round = 1) تتحسب “First pass accept”
- Request changes (Comment):
  - يرجع للـ status السابقة (تعريفها بالأتمتة)
  - Revision count += 1
  - Review round += 1
  - ينزل Notification للـ assignee/owner

### 7.3 UX داخل Task Record
- Badge واضح “Client Review”
- قسم “Client Feedback”:
  - آخر تعليق + timestamp
  - history للـ rounds (اختياري MVP)
- زر “Open in Client Portal” (للـ internal team فقط)

---

## 7) UX Flows (أمثلة)

### Flow: Workspace tasks → فلترة حسب Client
- افتح Tasks
- اضغط Client chip picker
- اختار Client A
- احفظ View باسم “Client A - Weekly”

### Flow: تحويل Message إلى Task
- من Chat: Message actions → Create task
- يفتح create modal/sheet
- يملأ title تلقائيًا + link message

### Flow: Bulk actions (Desktop)
- select rows
- action: change status / assign / add tag
- confirm لو عدد كبير

---

## 8) KPIs (Task-based)

### Team KPIs (per member)
- First-pass acceptance rate:
  - نسبة التاسكات اللي اتقبلت من أول مرة (Review round = 1)
- Second-pass acceptance rate:
  - نسبة اللي اتقبلت من تاني مرة (Review round = 2)
- Avg revisions per task:
  - متوسط Revision count لتاسكات العضو
- Avg review cycle time (اختياري):
  - الوقت بين “submitted” و “client response”

### Client KPIs
- Client friction index:
  - متوسط Revision count لتاسكات العميل
- Acceptance distribution:
  - % accepted on 1st/2nd/3rd+ rounds
