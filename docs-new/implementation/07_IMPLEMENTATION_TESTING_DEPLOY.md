# Ninjawy vNext - Implementation Plan (Part 7)

> **Testing + Deployment + CI/CD + Monitoring**

---

## Phase 31: Unit Testing (Vitest)

### 31.1 Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

### 31.2 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### 31.3 Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  }
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ar', changeLanguage: vi.fn() }
  })
}))
```

### 31.4 Example Tests

```typescript
// src/features/tasks/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'

const mockTask = {
  id: '1',
  title: 'Test Task',
  status: 'in_progress',
  priority: 'high',
  due_date: '2024-01-15'
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('shows priority badge', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('tasks.priorities.high')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<TaskCard task={mockTask} onClick={onClick} />)
    
    await userEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledWith('1')
  })
})

// src/hooks/useTasks.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTasks } from './useTasks'

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useTasks', () => {
  it('fetches tasks for workspace', async () => {
    const { result } = renderHook(() => useTasks('workspace-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

---

## Phase 32: E2E Testing (Playwright)

### 32.1 Setup

```bash
cd e2e
npm install @playwright/test
npx playwright install
```

### 32.2 Playwright Config

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

### 32.3 E2E Test Examples

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('تسجيل الدخول')).toBeVisible()
  })

  test('should send OTP and verify', async ({ page }) => {
    await page.goto('/login')
    
    // Enter email
    await page.getByPlaceholder('البريد الإلكتروني').fill('test@example.com')
    await page.getByRole('button', { name: 'المتابعة بالبريد' }).click()

    // Should show OTP input
    await expect(page.getByText('أدخل الكود')).toBeVisible()
    
    // Enter OTP (mock in test env)
    await page.getByRole('textbox').first().fill('1')
    await page.getByRole('textbox').nth(1).fill('2')
    await page.getByRole('textbox').nth(2).fill('3')
    await page.getByRole('textbox').nth(3).fill('4')
    await page.getByRole('textbox').nth(4).fill('5')
    await page.getByRole('textbox').nth(5).fill('6')

    // Should redirect to onboarding
    await expect(page).toHaveURL(/onboarding/)
  })
})

// e2e/tests/tasks.spec.ts
test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login')
    // ... login steps
  })

  test('should create a new task', async ({ page }) => {
    await page.goto('/tasks')
    
    await page.getByRole('button', { name: 'مهمة جديدة' }).click()
    
    // Fill form
    await page.getByPlaceholder('عنوان المهمة').fill('مهمة تجريبية')
    await page.getByRole('button', { name: 'حفظ' }).click()

    // Should see the new task
    await expect(page.getByText('مهمة تجريبية')).toBeVisible()
  })

  test('should drag task to change status (Kanban)', async ({ page }) => {
    await page.goto('/tasks')
    
    // Switch to Board view
    await page.getByRole('tab', { name: 'Board' }).click()

    // Drag task from "Backlog" to "In Progress"
    const task = page.getByText('مهمة موجودة')
    const targetColumn = page.getByText('قيد التنفيذ').locator('..')

    await task.dragTo(targetColumn)

    // Verify status changed
    await expect(task).toBeVisible()
  })
})

// e2e/tests/mobile.spec.ts
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('should show bottom bar on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('button', { name: 'المزيد' })).toBeVisible()
  })

  test('should open More sheet', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'المزيد' }).click()
    
    await expect(page.getByText('الإعلانات')).toBeVisible()
    await expect(page.getByText('الأتمتة')).toBeVisible()
  })
})
```

---

## Phase 33: Deployment

### 33.1 Vercel Deployment (Frontend)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 33.2 Environment Variables (Vercel)

```
# Production
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_META_APP_ID=123456
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_APP_URL=https://app.ninjawy.com

# Preview (per branch)
VITE_SUPABASE_URL=https://yyy.supabase.co  # Staging project
```

### 33.3 Supabase Deployment

```bash
# Login to Supabase CLI
npx supabase login

# Link to project
npx supabase link --project-ref your-project-ref

# Push database migrations
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy send-notification
npx supabase functions deploy run-automation
npx supabase functions deploy calculate-xp
npx supabase functions deploy sync-ads
npx supabase functions deploy meta-oauth-callback
npx supabase functions deploy gmail-oauth-callback
```

---

## Phase 34: CI/CD (GitHub Actions)

### 34.1 CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: coverage
          path: coverage/

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: e2e/playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### 34.2 Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-supabase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase db push
      - run: supabase functions deploy --all

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-supabase
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Phase 35: Monitoring & Error Tracking

### 35.1 Sentry Setup

```bash
npm install @sentry/react
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

### 35.2 Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-2xl font-bold">حدث خطأ</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={resetError}>إعادة المحاولة</Button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
```

### 35.3 Analytics (optional)

```typescript
// src/lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  // PostHog / Mixpanel / etc.
  if (window.posthog) {
    window.posthog.capture(name, properties)
  }
}

// Usage:
// trackEvent('task_created', { client_id: '...', has_due_date: true })
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "functions:deploy": "supabase functions deploy --all"
  }
}
```

---

## Updated Task Checklist

```markdown
## Phase 31: Unit Testing
- [ ] 31.1 Setup Vitest
- [ ] 31.2 Test setup file (mocks)
- [ ] 31.3 Component tests (TaskCard, etc.)
- [ ] 31.4 Hook tests (useTasks, useAuth)
- [ ] 31.5 API tests
- [ ] 31.6 Coverage > 70%

## Phase 32: E2E Testing
- [ ] 32.1 Setup Playwright
- [ ] 32.2 Auth flow tests
- [ ] 32.3 Task CRUD tests
- [ ] 32.4 Mobile navigation tests
- [ ] 32.5 Keyboard navigation tests

## Phase 33: Deployment
- [ ] 33.1 Vercel project setup
- [ ] 33.2 Environment variables
- [ ] 33.3 Supabase production project
- [ ] 33.4 Deploy Edge Functions
- [ ] 33.5 Custom domain setup

## Phase 34: CI/CD
- [ ] 34.1 GitHub Actions CI workflow
- [ ] 34.2 GitHub Actions Deploy workflow
- [ ] 34.3 Branch protection rules
- [ ] 34.4 Preview deployments

## Phase 35: Monitoring
- [ ] 35.1 Sentry setup
- [ ] 35.2 Error boundary
- [ ] 35.3 Performance monitoring
- [ ] 35.4 Analytics (optional)
```

