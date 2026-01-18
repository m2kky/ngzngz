# Inbox + Chat (تفصيلي) — تشغيل يومي + ربط بالسجلات

---

## 1) Inbox (Notifications Center)

### الهدف
كل “التفاعل التشغيلي” في مكان واحد:
- Mentions
- Task assignments
- Due/Overdue
- Automation alerts
- Ads alerts (later)
- AI agent runs (success/fail)

### 1.1 Inbox Page — Desktop
- Left rail:
  - All
  - Mentions
  - Tasks
  - Automations
  - System
  - AI
- Center list (virtualized):
  - icon + title + snippet
  - source badge (Task/Meeting/Chat/Automation/Ads)
  - timestamp + unread dot
- Right preview panel (optional MVP):
  - preview للعنصر
  - quick actions

### 1.2 Inbox Page — Mobile
- Tabs أعلى (scrollable)
- List (virtualized)
- Tap item:
  - open details sheet/page
  - Go to source

### 1.3 Actions
- Mark as read (single/bulk desktop)
- Snooze:
  - 1h / today / tomorrow / custom
- Go to source:
  - يفتح record page أو chat thread مع scroll لمكان الرسالة

### 1.4 Notification Settings (MVP)
- Per workspace:
  - Mentions: on/off
  - Task assigned: on/off
  - Due/Overdue: on/off
  - Automation/AI: on/off
- Quiet hours (اختياري):
  - mute التنبيهات خارج نطاق وقت العمل

### 1.5 Search + Bulk (Desktop)
- Search داخل inbox list (title/snippet/source)
- Bulk actions:
  - mark read
  - snooze
  - archive (اختياري MVP)

---

## 2) Chat (Workspace Chat)

### الهدف
محادثات مرتبطة مباشرة بالشغل:
- mention user
- link record
- create task from message

### 2.1 Chat Layout — Desktop
- Left: channels list (+ search)
- Center: messages thread
  - day separators
  - reply threads
  - attachments preview
- Composer:
  - mention picker (@)
  - record link picker (#)
  - attach file / drive link
- Right panel:
  - pinned messages
  - linked records
  - members

### 2.2 Chat Layout — Mobile
- Channels list
- Thread page
- Composer fixed bottom
- Message actions via long press:
  - Reply
  - Copy
  - Create task
  - Link to record
  - Pin (role-based)

### 2.3 Message Types
- Text
- Attachments
- Record link message (rich preview)
- System message (automation/agent)

### 2.4 Search + Jump (MVP)
- Search messages:
  - by keyword
  - by @mention
  - by linked record
- Jump to message:
  - يفتح thread ويعمل scroll/highlight للرسالة

### 2.5 AI Agent داخل Chat
- Agent message:
  - واضح إنه system/agent (badge)
  - يحتوي “What changed / What will happen”
- Safe actions:
  - Create task draft
  - Suggest automation
  - Summarize thread
- High-risk actions:
  - لا تتنفّذ من غير صلاحيات + confirmation

---

## 3) Create Task from Message (Flow)

### Desktop
- message menu → Create task
- open create sheet:
  - title prefilled from message snippet
  - auto link back to message
  - choose client/project (optional)

### Mobile
- long press → Create task
- full-screen create form (minimal fields)

---

## 4) Record Linking داخل Chat

### UX
- كتابة # تفتح record picker:
  - Client/Project/Task/Meeting
- اختيار record:
  - يظهر inline chip + preview

### Behavior
- click chip:
  - desktop open as sheet
  - mobile open record page

---

## 5) Role-based Moderation (Policy)
- Delete message:
  - صاحب الرسالة خلال window زمنية (اختياري)
  - Admin/Owner دائمًا
- Create channels:
  - Manager+ أو Admin
- Pin messages:
  - Manager+ أو Admin
