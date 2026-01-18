# Ninjawy vNext - Implementation Plan (Part 3)

> **Frontend Implementation Guide**

---

## Phase 2: Auth & Onboarding

### 2.1 Files to Create

```
src/features/auth/
├── pages/
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── components/
│   ├── AuthForm.tsx
│   └── SocialLoginButtons.tsx
├── hooks/
│   └── useAuth.ts
└── index.ts
```

### 2.2 Auth Implementation

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// src/features/auth/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password })
  }

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signUp, signOut }
}
```

### 2.3 Onboarding Wizard

```
src/features/onboarding/
├── pages/OnboardingPage.tsx
├── components/
│   ├── RoleStep.tsx
│   ├── WorkspaceStep.tsx
│   ├── InviteTeamStep.tsx
│   └── FirstClientStep.tsx
└── hooks/useOnboarding.ts
```

---

## Phase 3: Shell & Navigation

### 3.1 Files to Create

```
src/components/layout/
├── AppShell.tsx           # Main wrapper
├── DesktopSidebar.tsx     # Collapsible sidebar
├── MobileBottomBar.tsx    # 5-tab bottom nav
├── Header.tsx             # Top header
├── WorkspaceSwitcher.tsx  # Dropdown for workspaces
├── UserMenu.tsx           # Profile dropdown
└── MoreSheet.tsx          # Mobile "More" bottom sheet
```

### 3.2 Key Components

```typescript
// src/components/layout/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <div className="flex h-screen bg-background">
      {!isMobile && <DesktopSidebar />}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        {isMobile && <MobileBottomBar />}
      </div>
    </div>
  )
}

// Navigation items
const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Meetings', path: '/meetings' },
  { icon: TrendingUp, label: 'Ads', path: '/ads' },
  { icon: Target, label: 'Strategy', path: '/strategy' },
  { icon: Palette, label: 'Brand Kit', path: '/brand-kits' },
  { icon: Zap, label: 'Automations', path: '/automations' },
  { icon: Trophy, label: 'Dojo', path: '/dojo' },
]

const mobileBottomItems = ['Dashboard', 'Clients', 'Tasks', 'Meetings', 'More']
```

---

## Phase 4: Core UI Components

### 4.1 Record Sheet/Page

```
src/components/records/
├── RecordSheet.tsx        # Side panel (desktop)
├── RecordPage.tsx         # Full page (mobile)
├── RecordHeader.tsx       # Icon + title + breadcrumbs
├── PropertiesRow.tsx      # System + custom properties
├── RecordBody.tsx         # Tiptap editor wrapper
└── CommentsActivity.tsx   # Comments thread + activity
```

```typescript
// src/components/records/RecordSheet.tsx
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface RecordSheetProps {
  open: boolean
  onClose: () => void
  entityType: string
  entityId: string
}

export function RecordSheet({ open, onClose, entityType, entityId }: RecordSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] p-0">
        <RecordHeader entityType={entityType} entityId={entityId} />
        <PropertiesRow entityType={entityType} entityId={entityId} />
        <RecordBody entityType={entityType} entityId={entityId} />
        <CommentsActivity entityType={entityType} entityId={entityId} />
      </SheetContent>
    </Sheet>
  )
}
```

### 4.2 Property Editors

```
src/components/properties/
├── PropertyRow.tsx
├── PropertyEditor.tsx     # Main dispatcher
├── editors/
│   ├── TextEditor.tsx
│   ├── NumberEditor.tsx
│   ├── DateEditor.tsx
│   ├── SelectEditor.tsx
│   ├── MultiSelectEditor.tsx
│   ├── PersonEditor.tsx
│   ├── CheckboxEditor.tsx
│   └── RelationEditor.tsx
└── PropertyManager.tsx    # Add/edit property definitions
```

### 4.3 Tiptap Editor

```
src/components/editor/
├── TiptapEditor.tsx
├── EditorMenuBar.tsx
├── SlashCommand.tsx
├── extensions/
│   ├── MentionExtension.ts
│   ├── RecordLinkExtension.ts
│   └── EmbedViewExtension.ts
└── nodes/
    ├── TaskListNode.tsx
    └── EmbedViewNode.tsx
```

---

## Phase 5: Database Views Engine

### 5.1 Files Structure

```
src/components/views/
├── ViewContainer.tsx      # Main wrapper with toolbar
├── ViewToolbar.tsx        # Search, filter, sort, etc.
├── ViewSelector.tsx       # Tabs/dropdown for views
├── FilterBuilder.tsx      # Filter rules UI
├── TableView/
│   ├── TableView.tsx
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   └── TableCell.tsx
├── BoardView/
│   ├── BoardView.tsx
│   ├── BoardColumn.tsx
│   └── BoardCard.tsx
├── ListView/
│   ├── ListView.tsx
│   └── ListItem.tsx
├── CalendarView/
│   ├── CalendarView.tsx
│   └── DayAgenda.tsx
└── GalleryView/
    ├── GalleryView.tsx
    └── GalleryCard.tsx
```

### 5.2 Key Hooks

```typescript
// src/hooks/useDataView.ts
export function useDataView(entityType: string, viewId?: string) {
  const [view, setView] = useState<SavedView | null>(null)
  const [filters, setFilters] = useState<FilterConfig>({ rules: [], groups: [] })
  const [sorts, setSorts] = useState<SortConfig[]>([])
  const [groupBy, setGroupBy] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: [entityType, 'list', filters, sorts],
    queryFn: () => fetchEntities(entityType, filters, sorts)
  })

  return {
    data, isLoading, view,
    filters, setFilters,
    sorts, setSorts,
    groupBy, setGroupBy
  }
}
```

---

## Phase 6-9: Feature Modules

### Module Structure Pattern

```
src/features/[module]/
├── pages/
│   ├── [Module]Page.tsx       # Database page
│   └── [Module]RecordPage.tsx # Full page record (mobile)
├── components/
│   ├── [Module]Card.tsx       # For gallery/board
│   ├── [Module]Row.tsx        # For table
│   └── [Module]Sheet.tsx      # Record in side sheet
├── hooks/
│   ├── use[Module].ts         # Single record
│   └── use[Module]s.ts        # List with filters
├── api/
│   └── [module]Api.ts         # Supabase queries
└── types.ts
```

### 6. Tasks Module

```
src/features/tasks/
├── pages/TasksPage.tsx
├── components/
│   ├── TaskCard.tsx
│   ├── TaskRow.tsx
│   ├── TaskSheet.tsx
│   ├── TaskQuickEdit.tsx      # Mobile bottom sheet
│   └── StatusBadge.tsx
├── hooks/
│   ├── useTask.ts
│   └── useTasks.ts
└── api/tasksApi.ts
```

### 7. Clients Module

```
src/features/clients/
├── pages/
│   ├── ClientsPage.tsx
│   └── ClientRecordPage.tsx
├── components/
│   ├── ClientCard.tsx
│   ├── ClientSheet.tsx
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── StrategyTab.tsx
│       ├── BrandKitTab.tsx
│       ├── AdsTab.tsx
│       ├── EmailsTab.tsx
│       ├── DriveTab.tsx
│       └── RelatedTab.tsx
└── hooks/useClient.ts
```

---

## Phase 10-12: Communication

### 10. Inbox

```
src/features/inbox/
├── pages/InboxPage.tsx
├── components/
│   ├── NotificationItem.tsx
│   ├── NotificationPreview.tsx
│   └── InboxFilters.tsx
└── hooks/useNotifications.ts
```

### 11. Chat

```
src/features/chat/
├── pages/ChatPage.tsx
├── components/
│   ├── ChannelsList.tsx
│   ├── MessageThread.tsx
│   ├── MessageItem.tsx
│   ├── MessageComposer.tsx
│   ├── MentionPicker.tsx
│   └── RecordLinkPicker.tsx
└── hooks/
    ├── useChannels.ts
    └── useMessages.ts
```

### 12. Dashboard

```
src/features/dashboard/
├── pages/DashboardPage.tsx
├── components/
│   ├── OverdueTasksWidget.tsx
│   ├── UpcomingMeetingsWidget.tsx
│   ├── ActiveProjectsWidget.tsx
│   ├── RecentActivityWidget.tsx
│   └── QuickActions.tsx
└── hooks/useDashboardData.ts
```

---

## Phase 13-17: Advanced Modules

### 16. Dojo

```
src/features/dojo/
├── pages/DojoPage.tsx
├── components/
│   ├── tabs/
│   │   ├── MyProgressTab.tsx
│   │   ├── QuestsTab.tsx
│   │   ├── AchievementsTab.tsx
│   │   └── LeaderboardTab.tsx
│   ├── XPBar.tsx
│   ├── StreakBadge.tsx
│   ├── QuestCard.tsx
│   └── AchievementCard.tsx
└── hooks/
    ├── useUserXP.ts
    └── useQuests.ts
```

### 17. Automations

```
src/features/automations/
├── pages/
│   ├── AutomationsPage.tsx
│   └── AutomationBuilderPage.tsx
├── components/
│   ├── AutomationCard.tsx
│   ├── builder/
│   │   ├── TriggerStep.tsx
│   │   ├── ConditionsStep.tsx
│   │   └── ActionsStep.tsx
│   └── RunsHistory.tsx
└── hooks/useAutomations.ts
```

---

## Phase 18-20: Settings, AI, Portal

### 18. Settings

```
src/features/settings/
├── pages/SettingsPage.tsx
├── components/
│   ├── MembersSettings.tsx
│   ├── RolesSettings.tsx
│   ├── PropertiesManager.tsx
│   ├── ViewsManager.tsx
│   ├── AppearanceSettings.tsx
│   ├── InvitesManager.tsx
│   └── ClientPortalSettings.tsx
└── hooks/useSettings.ts
```

### 20. Client Portal (Separate Route)

```
src/features/portal/
├── pages/
│   ├── PortalLoginPage.tsx
│   └── PortalReviewPage.tsx
├── components/
│   ├── PortalLayout.tsx
│   ├── ReviewTaskCard.tsx
│   └── ReviewActions.tsx
└── hooks/usePortalAuth.ts
```

---

## Verification Checklist

كل Phase لازم يتأكد من:

1. **Database**: الـ migrations اشتغلت صح
2. **RLS**: الـ policies بتمنع الوصول غير المصرح
3. **Types**: التايبات متزامنة مع الـ schema
4. **API**: الـ hooks بترجع data صح
5. **UI**: الـ components بتعرض صح على Desktop و Mobile
6. **Responsive**: الـ layout بيتأقلم مع الشاشات
7. **Loading/Error**: فيه states واضحة
8. **Edge Cases**: بيتعامل مع empty states

---

## ملفات إضافية للنسخ

### Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... rest of shadcn colors
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config
```

### CSS Variables

```css
/* src/index.css */
@import "tailwindcss";

:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}

.light {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

---

## ترتيب التنفيذ المقترح

1. **Phase 0** → Project setup + dependencies
2. **Phase 1** → Run all SQL migrations
3. **Phase 3** → Shell & Navigation (يشتغل الـ layout)
4. **Phase 4** → Core UI Components
5. **Phase 2** → Auth (login/signup working)
6. **Phase 5** → Views Engine (TableView أولاً)
7. **Phase 6** → Tasks (الأهم)
8. **Phase 7** → Clients
9. **Phase 8** → Projects
10. باقي الـ Phases...

