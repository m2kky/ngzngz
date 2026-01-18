# Ninjawy vNext - Implementation Plan (Part 4)

> **Auth + Onboarding + Edge Functions + Realtime**

---

## Phase 2: Auth (تفصيلي)

### 2.1 Supabase Auth Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 2.2 OTP Authentication Flow

#### Email OTP

```typescript
// src/features/auth/api/authApi.ts

// Step 1: Send OTP to email
export async function sendEmailOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Auto-create user if not exists
    }
  })
  if (error) throw error
  return { success: true }
}

// Step 2: Verify OTP
export async function verifyEmailOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  if (error) throw error
  return data
}
```

#### Phone OTP

```typescript
// Phone OTP (requires Twilio setup in Supabase)

// Step 1: Send OTP to phone
export async function sendPhoneOTP(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({
    phone, // Format: +201234567890
  })
  if (error) throw error
  return { success: true }
}

// Step 2: Verify Phone OTP
export async function verifyPhoneOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  if (error) throw error
  return data
}
```

### 2.3 Auth Pages UI

#### LoginPage.tsx

```
src/features/auth/pages/LoginPage.tsx

States:
1. Initial: Email/Phone input + "Continue" button
2. OTP Sent: OTP input (6 digits) + "Verify" button + Resend timer
3. Loading: Show spinner
4. Error: Show error message + retry

Components needed:
- OTPInput (6 digit boxes)
- CountdownTimer (resend after 60s)
- PhoneInput (with country code picker)
```

```typescript
// src/features/auth/pages/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

type AuthStep = 'input' | 'otp' | 'loading'
type AuthMethod = 'email' | 'phone'

export function LoginPage() {
  const [step, setStep] = useState<AuthStep>('input')
  const [method, setMethod] = useState<AuthMethod>('email')
  const [identifier, setIdentifier] = useState('') // email or phone
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendOTP = async () => {
    setStep('loading')
    try {
      if (method === 'email') {
        await sendEmailOTP(identifier)
      } else {
        await sendPhoneOTP(identifier)
      }
      setStep('otp')
    } catch (err) {
      setError(err.message)
      setStep('input')
    }
  }

  const handleVerifyOTP = async () => {
    setStep('loading')
    try {
      if (method === 'email') {
        await verifyEmailOTP(identifier, otp)
      } else {
        await verifyPhoneOTP(identifier, otp)
      }
      navigate({ to: '/onboarding' })
    } catch (err) {
      setError(err.message)
      setStep('otp')
    }
  }

  // ... UI rendering
}
```

#### OTPInput Component

```typescript
// src/features/auth/components/OTPInput.tsx
interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const inputRefs = useRef<HTMLInputElement[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return // Only digits
    
    const newValue = value.split('')
    newValue[index] = char
    onChange(newValue.join(''))

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-2xl border rounded-lg"
        />
      ))}
    </div>
  )
}
```

---

## Phase 2.3: Onboarding Wizard (تفصيلي)

### Database

```sql
-- Track onboarding progress
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN onboarding_step INTEGER DEFAULT 0;
```

### Onboarding Steps

```
Step 1: Welcome + Choose Role
Step 2: Create/Join Workspace
Step 3: Invite Team (optional, skip)
Step 4: Create First Client (optional, skip)
Step 5: Connect Integrations (optional, skip)
Step 6: Setup Complete
```

### Files Structure

```
src/features/onboarding/
├── pages/
│   └── OnboardingPage.tsx
├── components/
│   ├── OnboardingProgress.tsx
│   ├── steps/
│   │   ├── WelcomeStep.tsx
│   │   ├── RoleStep.tsx
│   │   ├── WorkspaceStep.tsx
│   │   ├── InviteTeamStep.tsx
│   │   ├── FirstClientStep.tsx
│   │   ├── IntegrationsStep.tsx
│   │   └── CompleteStep.tsx
│   └── OnboardingLayout.tsx
├── hooks/
│   └── useOnboarding.ts
└── types.ts
```

### OnboardingPage.tsx

```typescript
// src/features/onboarding/pages/OnboardingPage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 'welcome', component: WelcomeStep },
  { id: 'role', component: RoleStep },
  { id: 'workspace', component: WorkspaceStep },
  { id: 'invite', component: InviteTeamStep, skippable: true },
  { id: 'client', component: FirstClientStep, skippable: true },
  { id: 'integrations', component: IntegrationsStep, skippable: true },
  { id: 'complete', component: CompleteStep },
]

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({})

  const StepComponent = STEPS[currentStep].component
  const isSkippable = STEPS[currentStep].skippable

  const handleNext = (stepData?: Partial<OnboardingData>) => {
    if (stepData) setData(prev => ({ ...prev, ...stepData }))
    setCurrentStep(prev => prev + 1)
  }

  const handleSkip = () => setCurrentStep(prev => prev + 1)
  const handleBack = () => setCurrentStep(prev => prev - 1)

  return (
    <OnboardingLayout>
      <OnboardingProgress current={currentStep} total={STEPS.length} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <StepComponent
            data={data}
            onNext={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
            onSkip={isSkippable ? handleSkip : undefined}
          />
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  )
}
```

### Step Components

#### RoleStep.tsx

```typescript
const ROLES = [
  { value: 'owner', label: 'Owner / Founder', icon: Crown, desc: 'أنا صاحب الوكالة' },
  { value: 'manager', label: 'Account Manager', icon: Users, desc: 'بدير حسابات العملاء' },
  { value: 'creative', label: 'Creative', icon: Palette, desc: 'بشتغل على المحتوى والتصميم' },
  { value: 'strategist', label: 'Strategist', icon: Target, desc: 'بخطط الاستراتيجيات' },
  { value: 'analyst', label: 'Analyst', icon: BarChart, desc: 'بحلل البيانات والإعلانات' },
]

export function RoleStep({ onNext }: StepProps) {
  const [selected, setSelected] = useState<string>()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">إيه دورك في الفريق؟</h2>
        <p className="text-muted-foreground">هنخصص التجربة حسب شغلك</p>
      </div>

      <div className="grid gap-3">
        {ROLES.map(role => (
          <button
            key={role.value}
            onClick={() => setSelected(role.value)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              selected === role.value && "border-primary bg-primary/5"
            )}
          >
            <role.icon className="w-8 h-8" />
            <div className="text-right flex-1">
              <div className="font-medium">{role.label}</div>
              <div className="text-sm text-muted-foreground">{role.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={() => onNext({ role: selected })} disabled={!selected}>
        التالي
      </Button>
    </div>
  )
}
```

#### WorkspaceStep.tsx

```typescript
export function WorkspaceStep({ data, onNext }: StepProps) {
  const [mode, setMode] = useState<'create' | 'join'>()
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreate = async () => {
    const workspace = await createWorkspace(name, data.role)
    onNext({ workspace })
  }

  const handleJoin = async () => {
    const workspace = await joinWorkspaceByInvite(inviteCode)
    onNext({ workspace })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">مساحة العمل</h2>

      {!mode ? (
        <div className="grid gap-4">
          <Button variant="outline" onClick={() => setMode('create')}>
            <Plus /> إنشاء مساحة جديدة
          </Button>
          <Button variant="outline" onClick={() => setMode('join')}>
            <Users /> الانضمام بدعوة
          </Button>
        </div>
      ) : mode === 'create' ? (
        <div className="space-y-4">
          <Input
            placeholder="اسم الوكالة/الفريق"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={!name}>
            إنشاء
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="كود الدعوة"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
          />
          <Button onClick={handleJoin} disabled={!inviteCode}>
            انضمام
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

## Edge Functions

### Directory Structure

```
supabase/
├── functions/
│   ├── send-notification/
│   │   └── index.ts
│   ├── run-automation/
│   │   └── index.ts
│   ├── sync-ads/
│   │   └── index.ts
│   ├── calculate-xp/
│   │   └── index.ts
│   ├── send-email/
│   │   └── index.ts
│   └── _shared/
│       ├── supabase.ts
│       ├── cors.ts
│       └── types.ts
└── migrations/
    └── ... (SQL files)
```

### send-notification Edge Function

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  workspace_id: string
  type: 'mention' | 'task_assigned' | 'task_due' | 'task_overdue' | 'meeting_reminder' | 'automation' | 'system'
  title: string
  body?: string
  source_type?: string
  source_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: NotificationPayload = await req.json()

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        workspace_id: payload.workspace_id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        source_type: payload.source_type,
        source_id: payload.source_id,
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send push notification (FCM/APNs)
    // TODO: Send email if user preferences allow

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### run-automation Edge Function

```typescript
// supabase/functions/run-automation/index.ts
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { automation_id, trigger_data } = await req.json()

  // Get automation
  const { data: automation } = await supabase
    .from('automations')
    .select('*')
    .eq('id', automation_id)
    .single()

  if (!automation?.is_enabled) {
    return new Response(JSON.stringify({ skipped: true }))
  }

  // Check conditions
  const conditionsMet = evaluateConditions(automation.conditions, trigger_data)
  if (!conditionsMet) {
    await logRun(supabase, automation_id, 'skipped', trigger_data)
    return new Response(JSON.stringify({ skipped: true }))
  }

  // Execute actions
  try {
    const results = await executeActions(supabase, automation.actions, trigger_data)
    await logRun(supabase, automation_id, 'success', trigger_data, results)
    return new Response(JSON.stringify({ success: true, results }))
  } catch (error) {
    await logRun(supabase, automation_id, 'failed', trigger_data, null, error.message)
    throw error
  }
})

async function executeActions(supabase, actions, data) {
  const results = []
  for (const action of actions) {
    switch (action.type) {
      case 'notify':
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
          body: JSON.stringify({ ...action.config, ...data })
        })
        break
      case 'update_property':
        await supabase
          .from(data.entity_type + 's')
          .update({ [action.config.field]: action.config.value })
          .eq('id', data.entity_id)
        break
      case 'create_task':
        await supabase.from('tasks').insert(action.config)
        break
    }
    results.push({ action: action.type, success: true })
  }
  return results
}
```

### Database Trigger for Automations

```sql
-- Trigger function to call automation edge function
CREATE OR REPLACE FUNCTION trigger_automations()
RETURNS TRIGGER AS $$
DECLARE
  automation RECORD;
  trigger_type TEXT;
BEGIN
  -- Determine trigger type
  IF TG_OP = 'INSERT' THEN
    trigger_type := TG_TABLE_NAME || '_created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      trigger_type := TG_TABLE_NAME || '_status_changed';
    ELSE
      trigger_type := TG_TABLE_NAME || '_updated';
    END IF;
  END IF;

  -- Find matching automations
  FOR automation IN
    SELECT * FROM automations
    WHERE is_enabled = true
      AND workspace_id = NEW.workspace_id
      AND trigger->>'type' = trigger_type
  LOOP
    -- Call edge function (async via pg_net)
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/run-automation',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'automation_id', automation.id,
        'trigger_data', jsonb_build_object(
          'entity_type', TG_TABLE_NAME,
          'entity_id', NEW.id,
          'old', to_jsonb(OLD),
          'new', to_jsonb(NEW)
        )
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to tasks
CREATE TRIGGER tasks_automation_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_automations();
```

### calculate-xp Edge Function

```typescript
// supabase/functions/calculate-xp/index.ts
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { user_id, workspace_id, action_type, source_id } = await req.json()

  // Get XP rule
  const { data: rule } = await supabase
    .from('dojo_xp_rules')
    .select('*')
    .eq('workspace_id', workspace_id)
    .eq('action_type', action_type)
    .eq('is_active', true)
    .single()

  if (!rule) return new Response(JSON.stringify({ xp: 0 }))

  // Check daily cap
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('dojo_xp_history')
    .select('*', { count: 'exact' })
    .eq('user_xp_id', `${workspace_id}_${user_id}`)
    .eq('action_type', action_type)
    .gte('created_at', today)

  if (count >= rule.daily_cap) {
    return new Response(JSON.stringify({ xp: 0, capped: true }))
  }

  // Add XP
  const { data: userXP } = await supabase
    .from('dojo_user_xp')
    .upsert({
      workspace_id,
      user_id,
      total_xp: supabase.sql`total_xp + ${rule.xp_amount}`,
      last_activity_date: today
    }, { onConflict: 'workspace_id,user_id' })
    .select()
    .single()

  // Log history
  await supabase.from('dojo_xp_history').insert({
    user_xp_id: userXP.id,
    action_type,
    xp_amount: rule.xp_amount,
    source_type: 'task',
    source_id
  })

  return new Response(JSON.stringify({ xp: rule.xp_amount }))
})
```

---

## Realtime Subscriptions

```typescript
// src/hooks/useRealtimeNotifications.ts
export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          
          // Show toast
          toast({
            title: payload.new.title,
            description: payload.new.body
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}

// src/hooks/useRealtimeChat.ts
export function useRealtimeChat(channelId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [channelId])
}
```

---

## Updated Task Checklist

أضف للـ `00_TASKS_CHECKLIST.md`:

```markdown
## Phase 2: Auth & Onboarding (تفصيلي)
- [ ] 2.1 Auth pages (Login with Email/Phone)
- [ ] 2.2 OTP input component
- [ ] 2.3 OTP verification flow
- [ ] 2.4 Protected routes setup
- [ ] 2.5 Onboarding wizard layout
- [ ] 2.6 Step 1: Welcome + Role selection
- [ ] 2.7 Step 2: Create/Join Workspace
- [ ] 2.8 Step 3: Invite Team (skippable)
- [ ] 2.9 Step 4: First Client (skippable)
- [ ] 2.10 Step 5: Integrations (skippable)
- [ ] 2.11 Step 6: Complete + redirect

## Phase 21: Edge Functions
- [ ] 21.1 send-notification function
- [ ] 21.2 run-automation function
- [ ] 21.3 calculate-xp function
- [ ] 21.4 sync-ads function (Meta API)
- [ ] 21.5 send-email function (Resend/SendGrid)
- [ ] 21.6 Database triggers for automations

## Phase 22: Realtime
- [ ] 22.1 Realtime notifications subscription
- [ ] 22.2 Realtime chat messages
- [ ] 22.3 Realtime task updates (for Kanban)
```

