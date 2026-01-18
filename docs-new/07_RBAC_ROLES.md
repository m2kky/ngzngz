# RBAC Roles & Permissions

## Roles (مقترح)
- Owner
- Admin
- Manager
- Strategist
- Creative
- Analyst
- HR
- Guest

## مبادئ
- Guest: قراءة محدودة + بدون أدوات إدارة
- Analyst: قراءة Ads/Analytics + تعليق/تنبيه
- Creative: إدارة Assets/Brand + قراءة/تنفيذ مهام حسب الصلاحية
- Strategist: إدارة Strategy + ربطها بالمهام
- Manager: إدارة Projects/Tasks/Meetings داخل العملاء
- Admin/Owner: كل شيء + Settings/Integrations/Permissions

## Access Scope (مهم)
الصلاحيات = Role + Scope
- Workspace-wide: يشوف كل العملاء وكل ما يتعلق بهم
- Client-scoped: يشوف Client واحد/أكثر فقط، وكل ما يتعلق بهم فقط:
  - Projects/Tasks/Meetings/Ads/Assets/Chat context المرتبط بالـ client
  - أي Views لازم تكون auto-filtered على الـ client المسموح
  - البحث (Search) لازم يكون داخل النطاق فقط

### Invites (Policy)
- Invite أنواع:
  - Team invite: role داخلي (Manager/Strategist/…)
  - Client/Guest invite: role محدود + scope client-scoped افتراضيًا
- شروط:
  - Expiry + single-use (اختياري)
  - revoke في أي وقت
  - تغيير scope بعد الانضمام (Owner/Admin فقط)

## AI Agent Permissions (مهم)
الـ AI Agent بيتعامل كأنه User داخل النظام، لكن:
- لا ينفّذ أي أكشن خارج صلاحيات المستخدم اللي طلب منه
- كل أوامر التنفيذ لازم تكون Role-based + قابلة للتدقيق (Audit)
- أوامر عالية الخطورة تتطلب Approval (حسب الإعدادات)

### مستويات تنفيذ الأوامر (Policy)
- Read-only: قراءة/تلخيص/استعلامات بدون أي تعديل
- Write-safe: إنشاء/تعديل عناصر منخفضة المخاطر (مثلاً create task / update title)
- Write-restricted: تغييرات حساسة تحتاج موافقة (مثلاً تغيير أدوار، حذف، تعديلات Ads، Integrations)
- Admin-only: إعدادات النظام، الصلاحيات، التوكينات

### أمثلة على قيود
- Guest: AI يقدر يشرح/يلخّص فقط، بدون إنشاء/تعديل
- Member/Creative: إنشاء مهام، تعديل خصائص ضمن نطاقه، بدون حذف شامل أو إعدادات
- Manager: تعديل مشاريع/تعيينات/تحويل رسالة لمهمة، بدون Integrations
- Admin/Owner: كل شيء + إدارة سياسات الـ AI

## Permissions Matrix (عناوين)
- Inbox/Chat: view / send / manage channels / delete message
- AI: chat / agent-execute / require-approval / view agent history
- Clients: view / edit / archive
- Projects: create / edit / delete
- Tasks: create / edit / assign / change status / delete
- Meetings: create / edit / invite / export
- Ads: view / controls (pause/resume/budget)
- Dojo: view / leaderboard / manage XP rules / manage quests
- Automations: create/edit/enable/disable
- Settings: members/roles/properties/views/integrations
- Invites: create / revoke / set scope / set role
- Client Portal: configure workflow / review analytics
