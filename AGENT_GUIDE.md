# 🥷 Ninja Gen Z – Agent Guide

> دليل تقني مختصر لأي Agent أو مطوّر عايز يفهم المشروع ويشتغل عليه بسرعة.

## 1. نظرة سريعة على الـ Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript / React
- **UI**: TailwindCSS + shadcn/ui + Radix + Lucide Icons
- **State / Data**:
  - Supabase (Postgres + Auth + RLS + Storage)
  - بعض المواضع تستخدم React state فقط
- **AI**:
  - Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/google`)
  - Endpoint رئيسي: `/api/chat`

## 2. أهم الموديولات + أين توجد في الكود

### 2.1 Dashboard (اللوحة الرئيسية)
- **Routes تقريبية**:
  - `app/(dashboard)/dashboard` أو ما يعادله
- **Components**:
  - `components/dashboard/*`
  - Widgets صغيرة لعرض: الإحصائيات، النشاط، Ninja Status
- **وظيفة الموديول**:
  - عرض snapshot عن: المشاريع، المهام، XP، النشاط الأخير، الخ.

### 2.2 Content Studio (إدارة المحتوى والمهام)
- **Routes**:
  - `app/(dashboard)/content/*`
- **Components**:
  - `components/content/*`
  - قد يتضمن: KanbanBoard, GalleryView, ListView, TaskDrawer, TaskForm
- **Database (تقريبي حسب الـ migrations)**:
  - جدول للمهام/المحتوى مثل: `content_items` أو ضمن جدول `projects_tasks`
  - الحقول المعتادة: `id`, `workspace_id`, `project_id`, `title`, `description (JSON/Tiptap)`, `status`, `priority`, `assignee_id`, `created_at`, `updated_at`
- **Features**:
  - 3 طرق عرض: Kanban, Gallery, List
  - محرر Tiptap في كل مهمة
  - فلاتر حسب المشروع / الحالة / المسؤول / الأولوية

### 2.3 Projects (المشاريع)
- **Routes**:
  - `app/(dashboard)/projects/*`
- **Components**:
  - `components/projects/*`
- **Database**:
  - جدول `projects`
  - علاقات مع: `tasks/content_items`, `meetings`, `ads_reports`
- **Features**:
  - بطاقات Projects بتصميم Neon
  - تتبع تقدّم بصري
  - ربط كل مهام/محتوى بالمشروع

### 2.4 Meetings – The Meeting Dojo
- **Routes**:
  - `app/(dashboard)/meetings/*`
- **Components**:
  - `components/meetings/*`
- **Database** (من migrations مثل `create_meetings_tables.sql`):
  - `meetings`: الأساس (title, scheduled_at, project_id, status, link, workspace_id...)
  - `meeting_attendees`: ربط meetings بالأعضاء
  - `meeting_notes` أو حقل JSON لمحتوى Tiptap
- **Features**:
  - جدولة اجتماعات مع: تاريخ/وقت/رابط/مشاركين/ربط بمشروع
  - صفحة تفاصيل بمحرر Tiptap للملاحظات
  - تحويل الملاحظات إلى Tasks في Content Studio
  - أرشيف للاجتماعات + تبويب القادمة/المؤرشفة

### 2.5 Ad Center (الإعلانات والتحليلات)
- **Routes**:
  - `app/(dashboard)/ads/*`
  - APIs مساعدة في `app/api/...` (للـ proxy للمنصات)
- **Components**:
  - `components/ads/*`
  - `components/integrations/*`
- **Database** (من SQL في الروت + `supabase/migrations`):
  - `ad_integrations` أو `integrations`: حفظ بيانات الاتصال (tokens, account ids)
  - `ad_campaigns` / `ad_reports` / `trends`: بيانات الحملات والمؤشرات
- **Features**:
  - Connection Wizard لربط Meta / TikTok / Google Ads
  - تخزين الـ tokens آمنًا في Supabase (مع RLS)
  - جداول حملات ببيانات `mock` حاليًا لكن جاهزة لـ real APIs
  - تنسيق شرطي (ROAS وغيرها)
  - Offline Mode عندما لا يكون هناك أي Integration مفعّل

### 2.6 The Dojo – Gamification / XP / Leaderboard
- **Components**:
  - `components/gamification/*`
  - Widgets في `components/dashboard` لعرض Ninja Status
- **Database** (من `gamification.sql`, `add_gamification_fields.sql`, `xp_trigger.sql` وغيرها):
  - حقول في users/members: `xp_total`, `xp_weekly`, `level`
  - `achievements`: تعريف الإنجازات
  - `user_achievements`: حالة إنجاز كل عضو
  - Triggers: زيادة XP عند أحداث مثل إغلاق مهمة
- **Features**:
  - XP system مع Level Up كل فترة
  - Weekly Leaderboard مع تمييز المراكز الثلاثة الأولى
  - شاشة Achievements بإنجازات وتقدم لكل Badge
  - Widget في Dashboard لعرض المستوى، الترتيب، والإنجاز القادم

### 2.7 Brand Kit & Strategy Hub
- **Brand**:
  - Routes تقريبية: `app/(dashboard)/brand/*`
  - Components: `components/brand/*`
  - Features: إدارة ألوان البراند، مكتبة أصول، Style Guide بصري
- **Strategy**:
  - Routes: `app/(dashboard)/strategy/*`
  - Components: `components/strategy/*`
  - Features: SOSTAC templates، تخطيط الحملات والاستراتيجيات على المدى الطويل

### 2.8 Squad / Workspace / Invites
- **Components**:
  - `components/workspace/*`
  - `components/invites/*`
- **Database**:
  - `workspaces`
  - `workspace_members`
  - `invites`
- **Features**:
  - إدارة Workspace (اسم، هوية)
  - دعوات بالـ Email للانضمام
  - أدوار وصلاحيات للأعضاء

### 2.9 Profile & Settings
- **Routes**:
  - `app/(dashboard)/settings/*`
- **Components**:
  - `components/profile/*`
- **Database**:
  - جدول users/ profiles مع حقول إضافية (avatar, bio, birthday, nickname, theme color)
- **Features**:
  - صفحة ملف شخصي كاملة
  - اختيار Ninja Theme Color ينعكس على الواجهة عبر CSS variables

### 2.10 Sensei – AI Assistant داخل الواجهة
- **Frontend**:
  - `components/sensei/sensei-widget.tsx`
  - يستخدم:
    - `useChat` من `@ai-sdk/react`
    - API: `/api/chat`
  - يبعث `userId` في body → لربط المحادثة بالمستخدم
- **Backend**:
  - route: `app/api/chat/route.ts` (أو مشابه)
  - يستخدم Vercel AI SDK + مزوّد (مثل Google Generative AI عبر `@ai-sdk/google`)
- **Role**:
  - مساعد لاستخدام الأداة
  - قابل للتوسعة ليقرأ بيانات من Supabase (مشاريع، مهام، Ads…)

## 3. Supabase – طبقة البيانات

### 3.1 مكان الـ SQL
- ملفات SQL في الروت:
  - `create_*_table.sql` (projects, invites, reports, trends, user_views, workspace_members...)
  - `gamification.sql`, `setup_auth_triggers.sql`, `supabase_schema.sql`, الخ.
- مigrations منظمة في:
  - `supabase/migrations/*`

### 3.2 مفاهيم أساسية
- **Workspaces**: كل بيانات تقريبًا مربوطة بـ `workspace_id`.
- **RLS**:
  - سياسات تمنع أي مستخدم من رؤية بيانات Workspace غير خاصته.
- **Integrations**:
  - Tokens مخزّنة في جداول مخصصة.
  - لا يتم كشفها للـ frontend مباشرة.

## 4. طبقة الـ API

### 4.1 Next.js API Routes
- `app/api/*` يحتوي على:
  - `/api/chat` → Sensei
  - `/api/...` أخرى للـ Ads/Reports/Proxies حسب تنظيم المشروع

### 4.2 نمط العمل
- Frontend (Next.js) → يضرب API داخلية
- API → تتعامل مع:
  - Supabase (قراءة/كتابة)
  - منصات خارجية (Ads APIs) لو/عندما يتم تفعيلها فعليًا

## 5. Patterns مهمة لـ Agents

- **كل Feature رئيسية لها 4 طبقات تقريبًا**:
  1. Route في `app/(dashboard)/...`
  2. Components في `components/<feature>/*`
  3. جداول في Supabase (مذكورة في SQL / migrations)
  4. أحيانًا API في `app/api/...`

- **الـ Gamification** معتمد على:
  - تريجرات في DB + واجهة Gamification Components.

- **Ad Center**:
  - Data flows: Integrations (tokens) → Fetch → Reports/Trends → UI Tables/Charts.

- **Sensei**:
  - نقطة الدخول لأي Agent هو `/api/chat` + محتوى المشروع (READ-ONLY من Supabase أو من ملفات معينة حسب ما يحدد المطوّر).

## 6. كيف يستخدم Agent هذا المشروع

- لو Agent عايز يجاوب على أسئلة عن **استخدام الأداة**:
  - يعتمد بقوة على `README.md` + هذا `AGENT_GUIDE.md`.

- لو Agent عايز يجاوب على أسئلة عن **بيانات فعلية** (مشاريع، مهام، إعلانات...):
  - لازم يكون موصول بـ Supabase (URL + anon key عبر env).
  - يستعلم عن الجداول المناسبة:
    - Projects → جدول `projects`
    - Tasks/Content → جداول المحتوى ذات الصلة
    - Meetings → `meetings` + `meeting_notes`
    - Ads → `ad_*` tables (reports / trends / accounts)

- لو Agent عايز **يعدّل أو يضيف Features**:
  - يحدد أولًا: أي موديول؟
  - يدور في:
    - `app/(dashboard)/<module>` للـ routes
    - `components/<module>` للـ UI
    - `supabase/migrations` لأي تعديل Schema لو لزم

---

هذا الملف مختصر لكنه شامل للبنية العامة. لو احتجت جزء أعمق (مثلاً mapping دقيق لكل جدول/عمود في Supabase، أو وصف دقيق لكل Route)، أقدر أضيف قسم تفصيلي لكل واحدة منهم.
