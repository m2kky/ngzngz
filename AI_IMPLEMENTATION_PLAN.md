# 🤖 AI Agent Implementation Plan – Ninja Gen Z

> خطة تفصيلية لدمج قوة الـ AI في المنصة وخلي الـ Agent يعمل كل حاجة تقريبًا

---

## 📋 نظرة عامة

**الهدف**: بناء Agent ذكي يفهم context الـ workspace ويقدر ينفّذ أوامر فعلية (إنشاء مهام، جدولة اجتماعات، تحليل بيانات، إلخ).

**المدة الكلية**: 4-5 ساعات  
**الصعوبة**: متوسطة  
**المتطلبات**: معرفة بـ TypeScript + Next.js + Supabase

---

## 🎯 المراحل الرئيسية

### المرحلة 1: البنية الأساسية (1-2 ساعة)
- ✅ إنشاء ملفات الـ utilities
- ✅ كتابة دوال جلب البيانات من Supabase
- ✅ بناء System Prompt ذكي

### المرحلة 2: الـ Tools والـ Actions (1.5-2 ساعة)
- ✅ تعريف كل الـ Tools
- ✅ تطبيق Tool Calling في الـ API
- ✅ معالجة النتائج والأخطاء

### المرحلة 3: التحسينات والـ Testing (1-1.5 ساعة)
- ✅ تحسين الـ Widget
- ✅ Security والـ Validation
- ✅ Testing والـ Refinement

---

## 📁 الملفات اللي هنحتاج نعملها/نعدّلها

```
d:\prjects\s\ninja-gen-z\
├── lib/
│   ├── ai/                          [جديد]
│   │   ├── system-prompt.ts         [جديد]
│   │   └── tools.ts                 [جديد - مع execute logic مدمج]
│   ├── supabase/
│   │   ├── queries.ts               [جديد]
│   │   └── client.ts                [موجود - قد نحتاج نعدّل]
├── app/
│   └── api/
│       └── chat/
│           └── route.ts             [تحسين موجود - streaming]
└── components/
    └── sensei/
        └── sensei-widget.tsx        [تحسين موجود]
```

**ملاحظة**: ❌ لا نحتاج `tool-executor.ts` - Vercel AI SDK يدعم `execute` مدمج في كل tool

---

## 🔧 الخطوات التفصيلية

---

# PHASE 1: البنية الأساسية

## Step 1.1: إنشاء `/lib/supabase/queries.ts`

**الملف**: `d:\prjects\s\ninja-gen-z\lib\supabase\queries.ts`

**الوظيفة**: دوال لجلب البيانات من Supabase (Projects, Tasks, Meetings, User Stats, Ads)

**المحتوى**:
```typescript
// دالة جلب workspace context
export async function getWorkspaceContext(userId: string, supabase: any)

// دالة جلب المشاريع
export async function getProjects(workspaceId: string, supabase: any)

// دالة جلب المهام
export async function getTasks(workspaceId: string, supabase: any, limit?: number)

// دالة جلب الاجتماعات القادمة
export async function getUpcomingMeetings(workspaceId: string, supabase: any)

// دالة جلب إحصائيات المستخدم (XP, Level)
export async function getUserStats(userId: string, supabase: any)

// دالة جلب ترتيب الفريق
export async function getTeamLeaderboard(workspaceId: string, supabase: any)

// دالة جلب بيانات الإعلانات
export async function getAdsPerformance(workspaceId: string, supabase: any, metric?: string)
```

**الأولوية**: 🔴 عالية جدًا  
**المدة**: 45 دقيقة

---

## Step 1.2: إنشاء `/lib/ai/system-prompt.ts`

**الملف**: `d:\prjects\s\ninja-gen-z\lib\ai\system-prompt.ts`

**الوظيفة**: بناء System Prompt ذكي يفهم الـ context

**المحتوى**:
```typescript
// دالة بناء System Prompt
export function buildSystemPrompt(context: WorkspaceContext, user: User): string

// دالة تنسيق البيانات للـ prompt
export function formatContextForPrompt(context: WorkspaceContext): string

// دالة إضافة تعليمات خاصة
export function addSpecialInstructions(): string
```

**الأولوية**: 🔴 عالية جدًا  
**المدة**: 30 دقيقة

---

## Step 1.3: إنشاء `/lib/ai/tools.ts` (Vercel AI SDK Core - Modern Pattern)

**الملف**: `d:\prjects\s\ninja-gen-z\lib\ai\tools.ts`

**الوظيفة**: تعريف كل الـ Tools مع `tool()` helper + Zod schemas + execute logic مدمج

**الـ Pattern الصحيح**:
- ✅ استخدام `tool()` من `ai` library
- ✅ استخدام `z` من `zod` للـ type safety
- ✅ `execute` function مدمج في كل tool (لا نحتاج `tool-executor.ts`)
- ✅ User/Workspace context يتم جلبه **داخل** execute function
- ✅ يدعم streaming بشكل native

**المحتوى الصحيح**:
```typescript
import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { 
  getProjects, 
  getTasks, 
  getTeamLeaderboard,
  getAdsPerformance 
} from '@/lib/supabase/queries'

// قائمة الـ Tools:
// 1. create_task
// 2. update_task_status
// 3. delete_task
// 4. get_tasks_by_project
// 5. create_meeting
// 6. update_meeting
// 7. get_team_leaderboard
// 8. analyze_ads_performance
// 9. get_project_progress
// 10. get_upcoming_deadlines

export const tools = {
  create_task: tool({
    description: 'إنشاء مهمة جديدة في Content Studio',
    parameters: z.object({
      workspace_name: z.string().describe('اسم الـ workspace'),
      project_id: z.string().describe('معرّف المشروع'),
      title: z.string().describe('عنوان المهمة'),
      description: z.string().optional().describe('وصف المهمة'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    }),
    execute: async ({ workspace_name, project_id, title, description, priority, status }) => {
      // 1. إنشاء Supabase client داخل execute
      const supabase = createClient()
      
      // 2. جلب workspace_id من الاسم (أو من context)
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('name', workspace_name)
        .single()
      
      if (!workspace) {
        return { success: false, error: `Workspace "${workspace_name}" not found` }
      }
      
      // 3. إنشاء المهمة
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          workspace_id: workspace.id,
          project_id,
          title,
          description: description || '',
          priority,
          status,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // 3. رجّع النتيجة
      return {
        success: true,
        message: `✅ تم إنشاء المهمة "${title}" بنجاح!`,
        data: data,
      }
    },
  }),
  
  // ... باقي الـ tools بنفس الـ pattern
}
```

**ملاحظات مهمة**:
- ❌ **لا نستخدم** `context` parameter من execute
- ✅ **نجلب** workspace/user info **داخل** execute function
- ✅ **نرجّع** object بـ `{ success, message, data }` أو `{ success, error }`
- ✅ كل tool مستقل تماماً

**الأولوية**: 🔴 عالية جدًا  
**المدة**: 1 ساعة

---

# PHASE 2: الـ Tools والـ Actions

## Step 2.1: تحسين `/app/api/chat/route.ts` (مع Streaming)

**الملف**: `d:\prjects\s\ninja-gen-z\app\api\chat\route.ts`

**الوظيفة**: الربط الكامل مع streaming و tool execution مدمج

**الفرق عن القديم**:
- ✅ استخدام `streamText()` بدل `generateText()` للـ streaming
- ✅ `tools` object (لا array) مع `execute` مدمج
- ✅ context يتم تمريره تلقائيًا للـ tools عبر `toolChoice`
- ✅ native streaming response

**التعديلات المطلوبة**:
```typescript
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/supabase/queries'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { tools } from '@/lib/ai/tools'

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      )
    }

    // 1. إنشاء Supabase client
    const supabase = createClient()

    // 2. جيب workspace context
    const context = await getWorkspaceContext(userId, supabase)

    // 3. جيب user info
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    // 4. بنّي system prompt
    const systemPrompt = buildSystemPrompt(context, user)

    // 5. استخدم streamText مع tools
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      tools: tools,
      messages: messages,
      maxTokens: 1024,
      // تمرير context للـ tools
      toolChoice: 'auto',
      // معالجة tool calls تلقائيًا
    })

    // 6. رجّع streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500 }
    )
  }
}
```

**ملاحظات**:
- `streamText()` يدعم streaming native
- `tools` object (ليس array)
- `context` يتم تمريره عبر `toolChoice` أو يمكن تمريره في `tools` execute
- لا نحتاج معالجة يدوية للـ tool calls

**الأولوية**: 🔴 عالية جدًا  
**المدة**: 45 دقيقة

---

# PHASE 3: التحسينات والـ Testing

## Step 3.1: تحسين `/components/sensei/sensei-widget.tsx`

**الملف**: `d:\prjects\s\ninja-gen-z\components\sensei\sensei-widget.tsx`

**التحسينات المطلوبة**:
- ✅ عرض loading state أفضل (مثل typing indicator)
- ✅ عرض نتائج الـ actions (✅ تم إنشاء المهمة)
- ✅ معالجة الأخطاء بشكل ودود
- ✅ إضافة أيقونات وتنسيق أفضل
- ✅ عرض الـ Tool Calls (اختياري)

**الأولوية**: 🟡 متوسطة  
**المدة**: 30 دقيقة

---

## Step 3.2: Security والـ Validation

**الملفات المتأثرة**: كل الملفات الجديدة

**المتطلبات**:
- ✅ التحقق من RLS في كل query
- ✅ التحقق من صلاحيات المستخدم
- ✅ معالجة الأخطاء بشكل آمن
- ✅ عدم كشف sensitive data

**الأولوية**: 🔴 عالية جدًا  
**المدة**: 30 دقيقة

---

## Step 3.3: Testing والـ Refinement

**الاختبارات المطلوبة**:
- ✅ اختبار كل Tool بشكل منفصل
- ✅ اختبار الـ Multi-turn conversations
- ✅ اختبار معالجة الأخطاء
- ✅ اختبار الـ Edge cases

**الأولوية**: 🟡 متوسطة  
**المدة**: 1 ساعة

---

## 📝 تفاصيل كل ملف

### 1️⃣ `/lib/supabase/queries.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export interface WorkspaceContext {
  workspace_id: string
  projects: any[]
  tasks: any[]
  meetings: any[]
  userStats: any
  teamLeaderboard: any[]
}

export async function getWorkspaceContext(
  userId: string,
  supabase: any
): Promise<WorkspaceContext> {
  // 1. جيب workspace_id
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()

  if (!member) throw new Error('User not in any workspace')

  const workspaceId = member.workspace_id

  // 2. جيب كل البيانات بالتوازي
  const [projects, tasks, meetings, userStats, leaderboard] = await Promise.all([
    getProjects(workspaceId, supabase),
    getTasks(workspaceId, supabase, 10),
    getUpcomingMeetings(workspaceId, supabase),
    getUserStats(userId, supabase),
    getTeamLeaderboard(workspaceId, supabase),
  ])

  return {
    workspace_id: workspaceId,
    projects,
    tasks,
    meetings,
    userStats,
    teamLeaderboard: leaderboard,
  }
}

export async function getProjects(workspaceId: string, supabase: any) {
  const { data } = await supabase
    .from('projects')
    .select('id, name, status, progress, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getTasks(
  workspaceId: string,
  supabase: any,
  limit: number = 10
) {
  const { data } = await supabase
    .from('content_items')
    .select('id, title, status, priority, project_id, assignee_id')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function getUpcomingMeetings(workspaceId: string, supabase: any) {
  const { data } = await supabase
    .from('meetings')
    .select('id, title, scheduled_at, project_id, status')
    .eq('workspace_id', workspaceId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  return data || []
}

export async function getUserStats(userId: string, supabase: any) {
  const { data } = await supabase
    .from('workspace_members')
    .select('xp_total, xp_weekly, level')
    .eq('user_id', userId)
    .single()

  return data || { xp_total: 0, xp_weekly: 0, level: 1 }
}

export async function getTeamLeaderboard(workspaceId: string, supabase: any) {
  const { data } = await supabase
    .from('workspace_members')
    .select('user_id, xp_weekly, level')
    .eq('workspace_id', workspaceId)
    .order('xp_weekly', { ascending: false })
    .limit(10)

  return data || []
}

export async function getAdsPerformance(
  workspaceId: string,
  supabase: any,
  metric?: string
) {
  let query = supabase
    .from('ad_reports')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (metric) {
    query = query.order(metric, { ascending: false })
  }

  const { data } = await query.limit(10)
  return data || []
}
```

---

### 2️⃣ `/lib/ai/system-prompt.ts`

```typescript
import { WorkspaceContext } from '@/lib/supabase/queries'

export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    nickname?: string
  }
}

export function buildSystemPrompt(context: WorkspaceContext, user: User): string {
  const formattedContext = formatContextForPrompt(context)
  const specialInstructions = addSpecialInstructions()

  return `
أنت Sensei، مساعد ذكي لمنصة Ninja Gen Z.
أنت تساعد في إدارة الوكالات والتسويق الرقمي بذكاء واحترافية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**معلومات المستخدم الحالي:**
- الاسم: ${user.user_metadata?.name || user.email}
- البريد: ${user.email}

${formattedContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**قدراتك (Tools المتاحة):**
1. 📝 إنشاء/تحديث/حذف مهام
2. 📅 جدولة اجتماعات جديدة
3. 📊 تحليل أداء الحملات الإعلانية
4. 🏆 عرض ترتيب الفريق الأسبوعي
5. 📈 عرض تقدم المشاريع
6. ⏰ عرض المواعيد النهائية القادمة

${specialInstructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**نمط الرد:**
- كن ودود وإيجابي 😊
- استخدم emojis بشكل مناسب
- رد بالعربية دائمًا
- كن مختصرًا (لا تتجاوز 3-4 أسطر عادة)
- عند تنفيذ أوامر، أخبر المستخدم بالنتيجة بوضوح
- اقترح إجراءات ذكية عند الحاجة
`
}

export function formatContextForPrompt(context: WorkspaceContext): string {
  const projectsList = context.projects
    .slice(0, 5)
    .map(p => `  • ${p.name} (${p.status})`)
    .join('\n')

  const tasksList = context.tasks
    .slice(0, 5)
    .map(t => `  • ${t.title} (${t.status})`)
    .join('\n')

  const meetingsList = context.meetings
    .slice(0, 3)
    .map(m => `  • ${m.title} في ${new Date(m.scheduled_at).toLocaleDateString('ar-EG')}`)
    .join('\n')

  return `
**المشاريع الحالية:**
${projectsList || '  (لا توجد مشاريع)'}

**آخر المهام:**
${tasksList || '  (لا توجد مهام)'}

**الاجتماعات القادمة:**
${meetingsList || '  (لا توجد اجتماعات قادمة)'}

**إحصائياتك:**
- المستوى: ${context.userStats.level}
- XP الأسبوعي: ${context.userStats.xp_weekly}
- XP الإجمالي: ${context.userStats.xp_total}
`
}

export function addSpecialInstructions(): string {
  return `
**تعليمات مهمة:**
- عند إنشاء مهمة، اسأل عن المشروع إن لم يحدده المستخدم
- عند جدولة اجتماع، تأكد من الوقت والتاريخ
- عند تحليل الإعلانات، ركز على ROAS و CPC
- لا تحذف مهام بدون تأكيد من المستخدم
- إذا حدث خطأ، أخبر المستخدم بوضوح وقترح حل بديل
`
}
```

---

### 3️⃣ `/lib/ai/tools.ts`

```typescript
export const tools = [
  {
    name: 'create_task',
    description: 'إنشاء مهمة جديدة في Content Studio',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'عنوان المهمة (مثال: تصميم بنر إعلاني)',
        },
        description: {
          type: 'string',
          description: 'وصف تفصيلي للمهمة (اختياري)',
        },
        project_id: {
          type: 'string',
          description: 'معرّف المشروع (مثال: proj_123)',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'أولوية المهمة (منخفضة/متوسطة/عالية)',
          default: 'medium',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'حالة المهمة الأولية',
          default: 'todo',
        },
      },
      required: ['title', 'project_id'],
    },
  },
  {
    name: 'update_task_status',
    description: 'تحديث حالة مهمة موجودة',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'معرّف المهمة',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'الحالة الجديدة',
        },
      },
      required: ['task_id', 'status'],
    },
  },
  {
    name: 'delete_task',
    description: 'حذف مهمة (يتطلب تأكيد من المستخدم)',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'معرّف المهمة',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'get_tasks_by_project',
    description: 'الحصول على كل مهام مشروع معين',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'معرّف المشروع',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'فلترة حسب الحالة (اختياري)',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'create_meeting',
    description: 'جدولة اجتماع جديد',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'عنوان الاجتماع',
        },
        scheduled_at: {
          type: 'string',
          description: 'التاريخ والوقت (ISO format: 2025-12-10T14:00:00Z)',
        },
        project_id: {
          type: 'string',
          description: 'معرّف المشروع (اختياري)',
        },
        link: {
          type: 'string',
          description: 'رابط الاجتماع (Zoom/Meet)',
        },
      },
      required: ['title', 'scheduled_at'],
    },
  },
  {
    name: 'update_meeting',
    description: 'تحديث تفاصيل اجتماع',
    inputSchema: {
      type: 'object',
      properties: {
        meeting_id: {
          type: 'string',
          description: 'معرّف الاجتماع',
        },
        title: {
          type: 'string',
          description: 'العنوان الجديد (اختياري)',
        },
        scheduled_at: {
          type: 'string',
          description: 'الوقت الجديد (اختياري)',
        },
        link: {
          type: 'string',
          description: 'الرابط الجديد (اختياري)',
        },
      },
      required: ['meeting_id'],
    },
  },
  {
    name: 'get_team_leaderboard',
    description: 'الحصول على ترتيب الفريق الأسبوعي',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'analyze_ads_performance',
    description: 'تحليل أداء الحملات الإعلانية',
    inputSchema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: ['roas', 'cpc', 'impressions', 'conversions', 'spend'],
          description: 'المقياس المراد تحليله',
        },
        time_period: {
          type: 'string',
          enum: ['week', 'month', 'all'],
          description: 'الفترة الزمنية',
          default: 'week',
        },
      },
    },
  },
  {
    name: 'get_project_progress',
    description: 'الحصول على تقدم مشروع معين',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'معرّف المشروع',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_upcoming_deadlines',
    description: 'الحصول على المواعيد النهائية القادمة',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'عدد الأيام للبحث عنها (مثال: 7 أيام)',
          default: 7,
        },
      },
    },
  },
]
```

---

### 4️⃣ `/lib/ai/tool-executor.ts`

```typescript
import { WorkspaceContext } from '@/lib/supabase/queries'

export async function executeTool(
  toolName: string,
  args: any,
  context: WorkspaceContext,
  supabase: any
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    switch (toolName) {
      case 'create_task':
        return await createTask(args, context, supabase)
      case 'update_task_status':
        return await updateTaskStatus(args, context, supabase)
      case 'delete_task':
        return await deleteTask(args, context, supabase)
      case 'get_tasks_by_project':
        return await getTasksByProject(args, context, supabase)
      case 'create_meeting':
        return await createMeeting(args, context, supabase)
      case 'update_meeting':
        return await updateMeeting(args, context, supabase)
      case 'get_team_leaderboard':
        return await getTeamLeaderboard(args, context, supabase)
      case 'analyze_ads_performance':
        return await analyzeAdsPerformance(args, context, supabase)
      case 'get_project_progress':
        return await getProjectProgress(args, context, supabase)
      case 'get_upcoming_deadlines':
        return await getUpcomingDeadlines(args, context, supabase)
      default:
        return { success: false, message: `Tool ${toolName} not found` }
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error)
    return {
      success: false,
      message: `حدث خطأ عند تنفيذ الأمر: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
    }
  }
}

async function createTask(args: any, context: WorkspaceContext, supabase: any) {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      workspace_id: context.workspace_id,
      title: args.title,
      description: args.description || '',
      project_id: args.project_id,
      priority: args.priority || 'medium',
      status: args.status || 'todo',
      created_at: new Date().toISOString(),
    })
    .select()

  if (error) throw error

  return {
    success: true,
    message: `✅ تم إنشاء المهمة "${args.title}" بنجاح!`,
    data: data?.[0],
  }
}

async function updateTaskStatus(args: any, context: WorkspaceContext, supabase: any) {
  const { data, error } = await supabase
    .from('content_items')
    .update({ status: args.status })
    .eq('id', args.task_id)
    .eq('workspace_id', context.workspace_id)
    .select()

  if (error) throw error
  if (!data || data.length === 0) throw new Error('Task not found')

  const statusMap = { todo: '📝 قيد الانتظار', in_progress: '⚙️ قيد العمل', done: '✅ مكتملة' }

  return {
    success: true,
    message: `تم تحديث حالة المهمة إلى ${statusMap[args.status as keyof typeof statusMap]}`,
    data: data[0],
  }
}

async function deleteTask(args: any, context: WorkspaceContext, supabase: any) {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', args.task_id)
    .eq('workspace_id', context.workspace_id)

  if (error) throw error

  return {
    success: true,
    message: '✅ تم حذف المهمة بنجاح',
  }
}

async function getTasksByProject(args: any, context: WorkspaceContext, supabase: any) {
  let query = supabase
    .from('content_items')
    .select('*')
    .eq('workspace_id', context.workspace_id)
    .eq('project_id', args.project_id)

  if (args.status) {
    query = query.eq('status', args.status)
  }

  const { data, error } = await query

  if (error) throw error

  return {
    success: true,
    message: `وجدت ${data?.length || 0} مهام`,
    data: data || [],
  }
}

async function createMeeting(args: any, context: WorkspaceContext, supabase: any) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      workspace_id: context.workspace_id,
      title: args.title,
      scheduled_at: args.scheduled_at,
      project_id: args.project_id || null,
      link: args.link || null,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    })
    .select()

  if (error) throw error

  return {
    success: true,
    message: `📅 تم جدولة الاجتماع "${args.title}" بنجاح!`,
    data: data?.[0],
  }
}

async function updateMeeting(args: any, context: WorkspaceContext, supabase: any) {
  const updates: any = {}
  if (args.title) updates.title = args.title
  if (args.scheduled_at) updates.scheduled_at = args.scheduled_at
  if (args.link) updates.link = args.link

  const { data, error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', args.meeting_id)
    .eq('workspace_id', context.workspace_id)
    .select()

  if (error) throw error
  if (!data || data.length === 0) throw new Error('Meeting not found')

  return {
    success: true,
    message: '✅ تم تحديث الاجتماع بنجاح',
    data: data[0],
  }
}

async function getTeamLeaderboard(args: any, context: WorkspaceContext, supabase: any) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('user_id, xp_weekly, level')
    .eq('workspace_id', context.workspace_id)
    .order('xp_weekly', { ascending: false })
    .limit(10)

  if (error) throw error

  const leaderboard = data?.map((member: any, index: number) => {
    const medals = ['🥇', '🥈', '🥉']
    const medal = medals[index] || `${index + 1}.`
    return `${medal} المستوى ${member.level} - ${member.xp_weekly} XP`
  })

  return {
    success: true,
    message: '🏆 ترتيب الفريق الأسبوعي:\n' + leaderboard?.join('\n'),
    data: data || [],
  }
}

async function analyzeAdsPerformance(args: any, context: WorkspaceContext, supabase: any) {
  let query = supabase
    .from('ad_reports')
    .select('*')
    .eq('workspace_id', context.workspace_id)

  if (args.metric) {
    query = query.order(args.metric, { ascending: false })
  }

  const { data, error } = await query.limit(5)

  if (error) throw error

  const analysis = data?.map((report: any) => {
    return `📊 ${report.campaign_name}: ROAS ${report.roas || 'N/A'} | CPC ${report.cpc || 'N/A'}`
  })

  return {
    success: true,
    message: '📈 تحليل الحملات:\n' + (analysis?.join('\n') || 'لا توجد بيانات'),
    data: data || [],
  }
}

async function getProjectProgress(args: any, context: WorkspaceContext, supabase: any) {
  const { data, error } = await supabase
    .from('projects')
    .select('name, progress, status')
    .eq('id', args.project_id)
    .eq('workspace_id', context.workspace_id)
    .single()

  if (error) throw error
  if (!data) throw new Error('Project not found')

  return {
    success: true,
    message: `📊 المشروع "${data.name}": ${data.progress}% مكتمل (${data.status})`,
    data: data,
  }
}

async function getUpcomingDeadlines(args: any, context: WorkspaceContext, supabase: any) {
  const daysFromNow = new Date()
  daysFromNow.setDate(daysFromNow.getDate() + (args.days || 7))

  const { data, error } = await supabase
    .from('content_items')
    .select('title, project_id')
    .eq('workspace_id', context.workspace_id)
    .eq('status', 'todo')
    .order('created_at', { ascending: true })
    .limit(5)

  if (error) throw error

  const deadlines = data?.map((task: any) => `⏰ ${task.title}`)

  return {
    success: true,
    message: deadlines && deadlines.length > 0 
      ? `المواعيد النهائية القادمة:\n${deadlines.join('\n')}`
      : '✅ لا توجد مواعيد نهائية قادمة',
    data: data || [],
  }
}
```

---

### 5️⃣ `/app/api/chat/route.ts` (محسّن)

```typescript
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceContext } from '@/lib/supabase/queries'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { tools } from '@/lib/ai/tools'
import { executeTool } from '@/lib/ai/tool-executor'

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      )
    }

    // 1. إنشاء Supabase client
    const supabase = createClient()

    // 2. جيب workspace context
    const context = await getWorkspaceContext(userId, supabase)

    // 3. جيب user info
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    // 4. بنّي system prompt
    const systemPrompt = buildSystemPrompt(context, user)

    // 5. استدعِ AI مع tools
    const response = await generateText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      tools: tools,
      messages: messages,
      maxTokens: 1024,
    })

    // 6. معالجة tool calls
    let toolResults: any[] = []
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        const result = await executeTool(
          toolCall.toolName,
          toolCall.args,
          context,
          supabase
        )
        toolResults.push({
          toolName: toolCall.toolName,
          result: result.message,
        })
      }
    }

    // 7. رجّع الرد
    return new Response(
      JSON.stringify({
        content: response.text,
        toolResults: toolResults,
        toolCalls: response.toolCalls?.map(tc => ({
          name: tc.toolName,
          args: tc.args,
        })),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500 }
    )
  }
}
```

---

## 🚀 خطوات التنفيذ العملية

### الأسبوع الأول:

**اليوم 1-2:**
- [ ] إنشاء `/lib/supabase/queries.ts`
- [ ] إنشاء `/lib/ai/system-prompt.ts`
- [ ] إنشاء `/lib/ai/tools.ts`

**اليوم 3:**
- [ ] إنشاء `/lib/ai/tool-executor.ts`

**اليوم 4:**
- [ ] تحسين `/app/api/chat/route.ts`

**اليوم 5:**
- [ ] تحسين `/components/sensei/sensei-widget.tsx`
- [ ] Testing والـ Refinement

---

## ✅ Checklist النهائي

- [ ] `/lib/supabase/queries.ts` تم إنشاؤه
- [ ] `/lib/ai/system-prompt.ts` تم إنشاؤه
- [ ] `/lib/ai/tools.ts` تم إنشاؤه (مع `tool()` helper و `execute` مدمج)
- [ ] `/app/api/chat/route.ts` تم تحديثه (مع `streamText()`)
- [ ] كل الـ Tools تعمل بشكل صحيح
- [ ] RLS والـ Security تم التحقق منها
- [ ] الـ Widget يعرض النتائج بشكل صحيح (streaming)
- [ ] اختبار multi-turn conversations
- [ ] اختبار معالجة الأخطاء
- [ ] الـ Prompt يعطي نتائج ذكية

---

## 📞 ملاحظات مهمة

1. **Google AI API Key**:
   - تأكد إنه موجود في `.env.local`
   - `GOOGLE_AI_API_KEY=...`

2. **Supabase RLS**:
   - كل الـ queries محمية بـ RLS
   - تأكد من الـ policies قبل التنفيذ

3. **Error Handling**:
   - كل الأخطاء يجب تكون user-friendly
   - لا تكشف sensitive data

4. **Performance**:
   - استخدم `Promise.all()` لجلب البيانات بالتوازي
   - حدّد `limit` للـ queries الكبيرة

---

## 🔄 الفروقات بين الـ Pattern القديم والحديث

### القديم (Outdated):
```typescript
// tool-executor.ts - معالجة يدوية
async function executeTool(toolName, args, context, supabase) {
  switch(toolName) {
    case 'create_task':
      // logic هنا
  }
}

// route.ts - generateText + معالجة يدوية
const response = await generateText({ tools: toolsArray })
for (const toolCall of response.toolCalls) {
  await executeTool(toolCall.toolName, ...)
}
```

### الحديث (Modern - Vercel AI SDK):
```typescript
// tools.ts - execute مدمج
export const tools = {
  create_task: tool({
    parameters: z.object({ ... }),
    execute: async (args, { context }) => {
      // logic هنا مباشرة
    }
  })
}

// route.ts - streamText + automatic handling
const result = streamText({
  tools: tools, // object, not array
  // tool execution يحصل تلقائيًا
})
return result.toDataStreamResponse()
```

### الفوائد:
- ✅ **أقل كود**: لا نحتاج `tool-executor.ts`
- ✅ **Type Safety**: Zod schemas مدمجة
- ✅ **Streaming Native**: `streamText()` يدعم streaming من الأساس
- ✅ **Cleaner**: Logic قريب من التعريف
- ✅ **Better DX**: Vercel AI SDK يتطور بسرعة

---

## 📚 Resources إضافية

- [Vercel AI SDK - Tools](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tool)
- [Zod Documentation](https://zod.dev/)
- [Streaming with Vercel AI](https://sdk.vercel.ai/docs/concepts/streaming)

---

**هذه الخطة جاهزة للتنفيذ الفوري! 🚀**
 