# ✅ Implementation Checklist – ملفات ومعلومات مهمة

> قبل ما نبدأ بـ التنفيذ، هنا كل الحاجات اللي نحتاج نعرفها

---

## 📋 الملفات الموجودة والحالية

### ✅ موجود بالفعل

#### 1. `/app/api/chat/route.ts` (موجود وشغّال!)
- **الحالة**: ✅ موجود وفيه بنية جيدة جدًا
- **الـ Pattern**: استخدم `streamText()` + `tool()` + Zod (الحديث!)
- **الـ Tools الموجودة**:
  - `get_tasks`: جلب المهام مع فلاتر
  - `create_task`: إنشاء مهمة جديدة
- **Security**: ✅ فيه check على `allowedWorkspaces` (RLS)
- **Model**: `gemini-1.5-flash`
- **maxSteps**: 5

**الملاحظات**:
- الـ route موجود وشغّال، لكن نحتاج نضيف tools أكتر (meetings, leaderboard, ads...)
- الـ system prompt موجود بس نحتاج نحسّنه مع context من Supabase
- استخدم `supabaseAdmin` (Service Role) - تأكد من `SUPABASE_SERVICE_ROLE_KEY` موجود في `.env.local`

#### 2. `/lib/supabase/client.ts` (موجود)
- Browser client للـ frontend
- استخدم `createBrowserClient` من `@supabase/ssr`
- يحتاج: `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. `/lib/supabase/server.ts` (موجود)
- Server client للـ backend
- استخدم `createServerClient` من `@supabase/ssr`
- يدير الـ cookies تلقائيًا

#### 4. `/lib/supabase/middleware.ts` (موجود)
- Middleware للـ auth

---

## 🔴 الملفات اللي نحتاج ننشئها

### 1. `/lib/supabase/queries.ts` (جديد)
**الوظيفة**: دوال لجلب البيانات من Supabase

**الدوال المطلوبة**:
```typescript
export async function getWorkspaceContext(userId: string, supabase: any)
export async function getProjects(workspaceId: string, supabase: any)
export async function getTasks(workspaceId: string, supabase: any, limit?: number)
export async function getUpcomingMeetings(workspaceId: string, supabase: any)
export async function getUserStats(userId: string, supabase: any)
export async function getTeamLeaderboard(workspaceId: string, supabase: any)
export async function getAdsPerformance(workspaceId: string, supabase: any, metric?: string)
```

---

### 2. `/lib/ai/system-prompt.ts` (جديد)
**الوظيفة**: بناء System Prompt ذكي مع context

**الدوال المطلوبة**:
```typescript
export function buildSystemPrompt(context: WorkspaceContext, user: User): string
export function formatContextForPrompt(context: WorkspaceContext): string
export function addSpecialInstructions(): string
```

---

### 3. `/lib/ai/tools.ts` (جديد - أو تحسين الموجود)
**الوظيفة**: تعريف كل الـ Tools مع `execute` مدمج

**الـ Tools المطلوبة**:
1. `get_tasks` (موجود بالفعل في route.ts)
2. `create_task` (موجود بالفعل)
3. `update_task_status` (جديد)
4. `delete_task` (جديد)
5. `create_meeting` (جديد)
6. `update_meeting` (جديد)
7. `get_team_leaderboard` (جديد)
8. `analyze_ads_performance` (جديد)
9. `get_project_progress` (جديد)
10. `get_upcoming_deadlines` (جديد)

---

## 🗄️ جداول Supabase المهمة

### جداول موجودة (نحتاج نتأكد من الأعمدة):

#### 1. `workspace_members`
```sql
- id (uuid)
- user_id (uuid)
- workspace_id (uuid)
- xp_total (integer)
- xp_weekly (integer)
- level (integer)
- created_at (timestamp)
```

#### 2. `content_items` (أو `tasks`)
```sql
- id (uuid)
- workspace_id (uuid)
- project_id (uuid)
- title (text)
- description (text/json)
- status (enum: 'todo', 'in_progress', 'done')
- priority (enum: 'low', 'medium', 'high')
- assignee_id (uuid)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. `projects`
```sql
- id (uuid)
- workspace_id (uuid)
- name (text)
- status (text)
- progress (integer)
- created_at (timestamp)
```

#### 4. `meetings`
```sql
- id (uuid)
- workspace_id (uuid)
- project_id (uuid)
- title (text)
- scheduled_at (timestamp)
- link (text)
- status (enum: 'upcoming', 'live', 'past')
- created_at (timestamp)
```

#### 5. `ad_reports` (للإعلانات)
```sql
- id (uuid)
- workspace_id (uuid)
- campaign_name (text)
- roas (float)
- cpc (float)
- impressions (integer)
- conversions (integer)
- spend (float)
- created_at (timestamp)
```

#### 6. `users`
```sql
- id (uuid)
- email (text)
- full_name (text)
- avatar_url (text)
- created_at (timestamp)
```

---

## 🔐 Environment Variables المطلوبة

### موجود بالفعل:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_AI_API_KEY=...
```

### نحتاج نتأكد موجود:
```env
SUPABASE_SERVICE_ROLE_KEY=...  # مهم جدًا للـ API route
```

---

## 📦 Dependencies (موجودة بالفعل)

✅ `ai` (^5.0.108) - Vercel AI SDK
✅ `@ai-sdk/google` (^2.0.44) - Google AI provider
✅ `@supabase/supabase-js` (^2.86.0) - Supabase client
✅ `zod` (^4.1.13) - Schema validation
✅ `@supabase/ssr` (^0.8.0) - SSR support

**لا نحتاج نثبت حاجات جديدة!** 🎉

---

## 🎯 الخطة المحدّثة

### Phase 1: البنية الأساسية
- [ ] إنشاء `/lib/supabase/queries.ts`
- [ ] إنشاء `/lib/ai/system-prompt.ts`
- [ ] إنشاء `/lib/ai/tools.ts` (أو نقل الـ tools من route.ts)

### Phase 2: تحسين الـ API
- [ ] تحسين `/app/api/chat/route.ts`:
  - إضافة import من `queries.ts` و `system-prompt.ts`
  - استخدام `getWorkspaceContext()` لجلب البيانات
  - استخدام `buildSystemPrompt()` لبناء الـ prompt
  - إضافة الـ tools الجديدة

### Phase 3: التحسينات
- [ ] تحسين `/components/sensei/sensei-widget.tsx` (streaming)
- [ ] Testing والـ Refinement

---

## ⚠️ نقاط مهمة

### 1. Security
- ✅ الـ route الموجود بالفعل فيه check على `allowedWorkspaces`
- ✅ استخدام `SUPABASE_SERVICE_ROLE_KEY` للـ backend (آمن)
- ⚠️ تأكد من RLS policies على كل الجداول

### 2. Database Schema
- ⚠️ نحتاج نتأكد من أسماء الجداول والأعمدة:
  - هل الجدول اسمه `tasks` أو `content_items`؟
  - هل الـ status values صحيحة؟
  - هل الـ columns موجودة؟

### 3. Supabase Admin Client
- ⚠️ الـ route الموجود يستخدم `supabaseAdmin` (Service Role)
- ⚠️ تأكد من `SUPABASE_SERVICE_ROLE_KEY` موجود في `.env.local`

### 4. Model Choice
- الـ route الموجود يستخدم `gemini-1.5-flash`
- الخطة قالت `gemini-2.0-flash`
- ⚠️ نحتاج نقرر: أي model نستخدم؟

---

## 📝 ملاحظات إضافية

### الـ route الموجود بالفعل ممتاز!
- ✅ استخدم الـ pattern الحديث (tool + execute)
- ✅ فيه security checks
- ✅ استخدم streaming (`toDataStreamResponse()`)

### ما نحتاج نعمله:
1. **إضافة tools أكتر** (meetings, leaderboard, ads…)
2. **تحسين الـ system prompt** مع context من DB
3. **تنظيم الـ code** (نقل الـ tools لملف منفصل)

---

## 🚀 الخطوة الجاية

اختر:
1. **نبدأ بـ `queries.ts`** (جلب البيانات)
2. **ولا نبدأ بـ `system-prompt.ts`** (بناء الـ prompt)
3. **ولا نبدأ بـ تحسين `route.ts`** (إضافة tools جديدة)

أي واحد تحب نبدأ بيه؟
