# Information Architecture (Pages)

## 0) Auth & Onboarding
- Login / Signup
- Onboarding Wizard
  - اختيار Role
  - إنشاء Workspace
  - (اختياري) Invite team
  - (اختياري) إنشاء أول Client
  - (اختياري) ربط Integrations

## 1) Dashboard (Workspace Home)
- Widgets: Overdue Tasks, Upcoming Meetings, Active Projects
- Quick Add: Task / Meeting / Client / Project
- Recent Activity + Notifications
- Entry points: Inbox / Chat / AI Assistant

## 2) Inbox (Notifications Center)
- كل التنبيهات في مكان واحد:
  - Mentions
  - Task assignments
  - Due/Overdue alerts
  - Automation alerts
  - Ads alerts (later)
- Views: All / Mentions / Tasks / System / Automations
- Actions: Mark as read / Snooze / Go to source

## 3) Chat (Workspace Chat)
- Channels / Direct messages (حسب تصميم MVP)
- ربط الرسائل بعناصر:
  - Mention لعميل/مشروع/مهمة
  - Attachments / Drive links
- أزرار سريعة:
  - Create task from message
  - Pin / Save message

## 4) Clients (Database)
- Views: Gallery / Table
- Client Record (Sheet/Page)
  - Tabs: Overview / Strategy Hub / Brand Kit / Ads / Emails / Drive / Related

## 5) Projects (Database)
- Views: Board / Table / Timeline / Calendar
- Project Record
  - Embedded: Project Tasks / Meetings / Ads (اختياري)

## 6) Tasks (Database)
- Views: Board / List / Table / Calendar / Timeline
- Task Record
  - Properties + Brief/Checklist/Links/Assets + Comments/Activity

## 7) Meetings (Database)
- Views: Calendar / List / Table
- Meeting Record
  - Agenda / Notes / Action Items (تحويل Tasks)

## 8) Ads (Workspace + Client)
- Workspace Overview: فلترة client/platform
- Campaigns/Adsets/Ads/Creatives
- Live KPIs + Alerts + (اختياري) Controls

## 9) Strategy Hub (Index + Client tab)
- Strategy list + Strategy record (SOSTAC)

## 10) Brand Kit (Index + Client tab)
- Brand kits list + Brand record

## 10.1) Dojo (XP + تحفيز)
- My Progress: level/xp/streak + XP history
- Quests: daily/weekly missions مرتبطة بالشغل الحقيقي
- Achievements: badges حسب إنجازات واضحة
- Leaderboard: داخل الـ Workspace (ممكن يتقفل من الإعدادات)

## 11) Automations
- Automations list + Builder + Runs history

## 12) AI Assistant (Chat + Agent)
- AI Chat: محادثة عادية مع الـ AI (سؤال/تلخيص/اقتراح)
- Agent Mode: تنفيذ أوامر داخل النظام حسب الدور
- History: سجل الأوامر والنتائج + approvals

## 12.1) Client Portal (Public)
- Portal خاص لكل Client (أو token) لعرض مهام “Client Review”
- Actions: Accept / Request changes + comment
- أي وصول يكون Client-scoped تلقائيًا (لا يشوف غير العميل المصرّح)

## 13) Settings
- Workspace: Members/Roles
- Properties manager (per entity type)
- Views manager (defaults/shared)
- Integrations
- AI settings (Policy/Permissions/Approvals)
- Audit log (اختياري)
