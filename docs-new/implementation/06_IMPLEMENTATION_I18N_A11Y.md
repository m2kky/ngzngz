# Ninjawy vNext - Implementation Plan (Part 6)

> **i18n + RTL + Accessibility + Search**

---

## Phase 27: Internationalization (i18n)

### 27.1 Setup

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 27.2 i18n Configuration

```typescript
// src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ar from '@/locales/ar.json'
import en from '@/locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en }
    },
    fallbackLng: 'ar', // Arabic as default
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
```

### 27.3 Arabic Translations

```json
// src/locales/ar.json
{
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "create": "إنشاء",
    "search": "بحث...",
    "loading": "جاري التحميل...",
    "noResults": "لا توجد نتائج",
    "confirm": "تأكيد",
    "back": "رجوع",
    "next": "التالي",
    "skip": "تخطي",
    "done": "تم",
    "close": "إغلاق",
    "more": "المزيد",
    "all": "الكل",
    "none": "لا شيء"
  },
  "nav": {
    "dashboard": "الرئيسية",
    "clients": "العملاء",
    "projects": "المشاريع",
    "tasks": "المهام",
    "meetings": "الاجتماعات",
    "inbox": "الوارد",
    "chat": "المحادثات",
    "ads": "الإعلانات",
    "strategy": "الاستراتيجية",
    "brandKit": "الهوية البصرية",
    "dojo": "الدوجو",
    "automations": "الأتمتة",
    "settings": "الإعدادات"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "signup": "إنشاء حساب",
    "logout": "تسجيل الخروج",
    "email": "البريد الإلكتروني",
    "phone": "رقم الهاتف",
    "password": "كلمة المرور",
    "continueWithEmail": "المتابعة بالبريد",
    "continueWithPhone": "المتابعة بالهاتف",
    "enterOTP": "أدخل الكود",
    "otpSent": "تم إرسال الكود إلى",
    "resendOTP": "إعادة الإرسال",
    "resendIn": "إعادة الإرسال بعد {{seconds}} ثانية",
    "verify": "تحقق"
  },
  "onboarding": {
    "welcome": "أهلاً بك في نينجاوي!",
    "welcomeDesc": "منصة إدارة وكالات التسويق",
    "chooseRole": "إيه دورك في الفريق؟",
    "roles": {
      "owner": "صاحب/مؤسس",
      "manager": "مدير حسابات",
      "creative": "مبدع/مصمم",
      "strategist": "استراتيجي",
      "analyst": "محلل بيانات"
    },
    "workspace": "مساحة العمل",
    "createWorkspace": "إنشاء مساحة جديدة",
    "joinWorkspace": "الانضمام بدعوة",
    "workspaceName": "اسم الوكالة/الفريق",
    "inviteCode": "كود الدعوة",
    "inviteTeam": "دعوة الفريق",
    "inviteTeamDesc": "أضف أعضاء فريقك الآن أو لاحقاً",
    "firstClient": "أول عميل",
    "firstClientDesc": "أضف أول عميل أو تخطى للإعدادات",
    "integrations": "الربط بالتطبيقات",
    "integrationsDesc": "اربط حساباتك الإعلانية والبريد",
    "complete": "جاهز!",
    "completeDesc": "ابدأ العمل الآن"
  },
  "tasks": {
    "title": "المهام",
    "newTask": "مهمة جديدة",
    "taskTitle": "عنوان المهمة",
    "status": "الحالة",
    "priority": "الأولوية",
    "assignee": "المسؤول",
    "assignees": "المسؤولين",
    "dueDate": "تاريخ التسليم",
    "client": "العميل",
    "project": "المشروع",
    "tags": "التصنيفات",
    "statuses": {
      "backlog": "قائمة الانتظار",
      "in_progress": "قيد التنفيذ",
      "internal_review": "مراجعة داخلية",
      "client_review": "مراجعة العميل",
      "approved": "مُعتمد",
      "done": "منتهي",
      "archived": "مؤرشف"
    },
    "priorities": {
      "low": "منخفضة",
      "medium": "متوسطة",
      "high": "عالية",
      "urgent": "عاجلة"
    },
    "views": {
      "all": "كل المهام",
      "myTasks": "مهامي",
      "overdue": "متأخرة",
      "thisWeek": "هذا الأسبوع",
      "byClient": "حسب العميل"
    },
    "empty": "لا توجد مهام",
    "emptyDesc": "أنشئ أول مهمة للبدء"
  },
  "clients": {
    "title": "العملاء",
    "newClient": "عميل جديد",
    "clientName": "اسم العميل",
    "status": "الحالة",
    "contact": "جهة الاتصال",
    "email": "البريد",
    "phone": "الهاتف",
    "website": "الموقع",
    "tabs": {
      "overview": "نظرة عامة",
      "strategy": "الاستراتيجية",
      "brandKit": "الهوية",
      "ads": "الإعلانات",
      "emails": "البريد",
      "drive": "الملفات",
      "related": "المرتبط"
    }
  },
  "meetings": {
    "title": "الاجتماعات",
    "newMeeting": "اجتماع جديد",
    "meetingTitle": "عنوان الاجتماع",
    "startTime": "وقت البداية",
    "endTime": "وقت النهاية",
    "location": "المكان",
    "attendees": "الحضور",
    "agenda": "جدول الأعمال",
    "notes": "الملاحظات",
    "actionItems": "المهام الناتجة"
  },
  "dojo": {
    "title": "الدوجو",
    "myProgress": "تقدمي",
    "quests": "المهمات",
    "achievements": "الإنجازات",
    "leaderboard": "لوحة المتصدرين",
    "level": "المستوى",
    "xp": "نقاط الخبرة",
    "streak": "التتابع",
    "days": "يوم"
  },
  "settings": {
    "title": "الإعدادات",
    "workspace": "مساحة العمل",
    "members": "الأعضاء",
    "roles": "الأدوار",
    "properties": "الخصائص",
    "views": "العروض",
    "appearance": "المظهر",
    "integrations": "الربط",
    "invites": "الدعوات",
    "portal": "بوابة العملاء"
  },
  "errors": {
    "generic": "حدث خطأ، حاول مرة أخرى",
    "notFound": "الصفحة غير موجودة",
    "unauthorized": "غير مصرح لك بالوصول",
    "networkError": "خطأ في الاتصال"
  }
}
```

### 27.4 English Translations

```json
// src/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search...",
    "loading": "Loading...",
    "noResults": "No results",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "skip": "Skip",
    "done": "Done",
    "close": "Close",
    "more": "More",
    "all": "All",
    "none": "None"
  },
  "nav": {
    "dashboard": "Dashboard",
    "clients": "Clients",
    "projects": "Projects",
    "tasks": "Tasks",
    "meetings": "Meetings",
    "inbox": "Inbox",
    "chat": "Chat",
    "ads": "Ads",
    "strategy": "Strategy",
    "brandKit": "Brand Kit",
    "dojo": "Dojo",
    "automations": "Automations",
    "settings": "Settings"
  }
  // ... rest of translations
}
```

### 27.5 Usage

```typescript
// In components
import { useTranslation } from 'react-i18next'

export function TasksPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('tasks.title')}</h1>
      <Button>{t('tasks.newTask')}</Button>
    </div>
  )
}
```

---

## Phase 28: RTL Layout Support

### 28.1 HTML Direction

```typescript
// src/hooks/useDirection.ts
import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language, isRTL])

  return { isRTL, direction: isRTL ? 'rtl' : 'ltr' }
}
```

### 28.2 Tailwind RTL Config

```typescript
// tailwind.config.ts
export default {
  // ...
  plugins: [
    require('tailwindcss-animate'),
    // RTL plugin
    function({ addUtilities }) {
      addUtilities({
        '.start-0': { 'inset-inline-start': '0' },
        '.end-0': { 'inset-inline-end': '0' },
        '.start-auto': { 'inset-inline-start': 'auto' },
        '.end-auto': { 'inset-inline-end': 'auto' },
        '.ms-auto': { 'margin-inline-start': 'auto' },
        '.me-auto': { 'margin-inline-end': 'auto' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
      })
    }
  ]
}
```

### 28.3 RTL-Aware Components

```typescript
// src/components/layout/DesktopSidebar.tsx
export function DesktopSidebar() {
  const { isRTL } = useDirection()

  return (
    <aside className={cn(
      "w-64 border-e bg-card h-screen",
      isRTL ? "border-l" : "border-r"
    )}>
      {/* Content */}
    </aside>
  )
}

// Use logical properties
// ❌ ml-4, mr-4, pl-4, pr-4, left-0, right-0
// ✅ ms-4, me-4, ps-4, pe-4, start-0, end-0
```

### 28.4 CSS Logical Properties

```css
/* src/index.css */

/* Use logical properties for RTL support */
.sidebar {
  border-inline-end: 1px solid var(--border);
  padding-inline-start: 1rem;
}

.icon-with-text {
  gap: 0.5rem;
}

.icon-with-text svg {
  /* Icon always on the "start" side */
  order: -1;
}

/* Flip specific icons for RTL */
[dir="rtl"] .icon-flip {
  transform: scaleX(-1);
}
```

---

## Phase 29: Accessibility (a11y)

### 29.1 Focus Management

```typescript
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive])

  return containerRef
}
```

### 29.2 Skip to Content

```typescript
// src/components/layout/SkipToContent.tsx
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  )
}
```

### 29.3 ARIA Labels

```typescript
// Example: TaskCard with proper ARIA
export function TaskCard({ task }: { task: Task }) {
  const { t } = useTranslation()

  return (
    <article
      role="article"
      aria-labelledby={`task-title-${task.id}`}
      className="p-4 border rounded-lg"
    >
      <h3 id={`task-title-${task.id}`}>{task.title}</h3>
      
      <div role="group" aria-label={t('tasks.status')}>
        <StatusBadge status={task.status} />
      </div>

      <div role="group" aria-label={t('tasks.assignees')}>
        {task.assignees.map(user => (
          <Avatar key={user.id} user={user} />
        ))}
      </div>

      <Button
        aria-label={`${t('common.edit')} ${task.title}`}
        onClick={() => openTask(task.id)}
      >
        <Edit className="w-4 h-4" aria-hidden="true" />
      </Button>
    </article>
  )
}
```

### 29.4 Keyboard Navigation

```typescript
// src/hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation(items: string[], onSelect: (id: string) => void) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        setActiveIndex(i => (i + 1) % items.length)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        setActiveIndex(i => (i - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect(items[activeIndex])
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(items.length - 1)
        break
    }
  }, [items, activeIndex, onSelect])

  return { activeIndex, handleKeyDown }
}
```

### 29.5 Screen Reader Announcements

```typescript
// src/components/ui/LiveRegion.tsx
import { useEffect, useState } from 'react'

let announceTimeout: number

export function announce(message: string) {
  const event = new CustomEvent('announce', { detail: message })
  window.dispatchEvent(event)
}

export function LiveRegion() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setMessage(e.detail)
      clearTimeout(announceTimeout)
      announceTimeout = window.setTimeout(() => setMessage(''), 1000)
    }

    window.addEventListener('announce', handler as EventListener)
    return () => window.removeEventListener('announce', handler as EventListener)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Usage:
// announce('تم حفظ المهمة بنجاح')
```

---

## Phase 30: Global Search

### 30.1 Database Full-Text Search

```sql
-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search vectors
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(body_doc->>'text', '')), 'B')
  ) STORED;

ALTER TABLE clients ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(primary_contact_name, '')), 'B')
  ) STORED;

-- Create indexes
CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);
CREATE INDEX idx_clients_search ON clients USING GIN(search_vector);

-- Search function
CREATE OR REPLACE FUNCTION search_workspace(
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  subtitle TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT 
      'task'::TEXT as entity_type,
      t.id as entity_id,
      t.title,
      COALESCE(c.name, '')::TEXT as subtitle,
      ts_rank(t.search_vector, plainto_tsquery('arabic', p_query)) as rank
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    WHERE t.workspace_id = p_workspace_id
      AND t.search_vector @@ plainto_tsquery('arabic', p_query)
    
    UNION ALL
    
    SELECT 
      'client'::TEXT,
      c.id,
      c.name,
      COALESCE(c.primary_contact_email, '')::TEXT,
      ts_rank(c.search_vector, plainto_tsquery('arabic', p_query))
    FROM clients c
    WHERE c.workspace_id = p_workspace_id
      AND c.search_vector @@ plainto_tsquery('arabic', p_query)
    
    UNION ALL
    
    SELECT 
      'project'::TEXT,
      p.id,
      p.name,
      COALESCE(c.name, '')::TEXT,
      ts_rank(to_tsvector('arabic', p.name), plainto_tsquery('arabic', p_query))
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    WHERE p.workspace_id = p_workspace_id
      AND to_tsvector('arabic', p.name) @@ plainto_tsquery('arabic', p_query)
  ) results
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 30.2 Search Component

```typescript
// src/components/search/GlobalSearch.tsx
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { workspaceId } = useWorkspace()
  const navigate = useNavigate()

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', workspaceId, query],
    queryFn: () => searchWorkspace(workspaceId, query),
    enabled: query.length >= 2
  })

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    navigate({ to: `/${result.entity_type}s/${result.entity_id}` })
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="بحث..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && <CommandLoading>جاري البحث...</CommandLoading>}
        {results?.length === 0 && <CommandEmpty>لا توجد نتائج</CommandEmpty>}
        
        <CommandGroup heading="المهام">
          {results?.filter(r => r.entity_type === 'task').map(result => (
            <CommandItem key={result.entity_id} onSelect={() => handleSelect(result)}>
              <CheckSquare className="me-2" />
              <span>{result.title}</span>
              {result.subtitle && (
                <span className="text-muted-foreground ms-2">{result.subtitle}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="العملاء">
          {results?.filter(r => r.entity_type === 'client').map(result => (
            <CommandItem key={result.entity_id} onSelect={() => handleSelect(result)}>
              <Users className="me-2" />
              <span>{result.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

---

## Updated Task Checklist

```markdown
## Phase 27: Internationalization (i18n)
- [ ] 27.1 Setup i18next
- [ ] 27.2 Arabic translations (full)
- [ ] 27.3 English translations
- [ ] 27.4 Language switcher
- [ ] 27.5 Save language preference

## Phase 28: RTL Layout
- [ ] 28.1 useDirection hook
- [ ] 28.2 Tailwind RTL utilities
- [ ] 28.3 Update all components to use logical properties
- [ ] 28.4 Test all layouts in RTL

## Phase 29: Accessibility
- [ ] 29.1 Skip to content link
- [ ] 29.2 Focus trap for modals
- [ ] 29.3 ARIA labels on all interactive elements
- [ ] 29.4 Keyboard navigation (lists, menus)
- [ ] 29.5 Screen reader live region
- [ ] 29.6 Color contrast check

## Phase 30: Global Search
- [ ] 30.1 Full-text search setup (PostgreSQL)
- [ ] 30.2 search_workspace function
- [ ] 30.3 GlobalSearch component (Cmd+K)
- [ ] 30.4 Search results UI
- [ ] 30.5 Recent searches
```

