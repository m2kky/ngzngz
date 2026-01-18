# Ninjawy vNext - Implementation Plan (Part 5)

> **Storage + Integrations (Meta, Gmail, Drive)**

---

## Phase 23: File Storage (Supabase Storage)

### 23.1 Storage Buckets Setup

```sql
-- Create storage buckets via Supabase Dashboard or SQL

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Workspace assets (logos, backgrounds)
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-assets', 'workspace-assets', true);

-- Client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true);

-- Brand assets (private per workspace)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', false);

-- Task attachments (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

-- Chat attachments (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', false);
```

### 23.2 Storage RLS Policies

```sql
-- Avatars: Anyone can view, only owner can upload/delete
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Attachments: Only workspace members can access
CREATE POLICY "Workspace members can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments'
  AND EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.workspace_id::text = (storage.foldername(name))[1]
      AND wm.status = 'active'
  )
);

CREATE POLICY "Workspace members can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments'
  AND EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.workspace_id::text = (storage.foldername(name))[1]
      AND wm.status = 'active'
  )
);
```

### 23.3 File Upload Hook

```typescript
// src/hooks/useFileUpload.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadOptions {
  bucket: 'avatars' | 'attachments' | 'brand-assets' | 'chat-files'
  folder?: string // e.g., workspace_id/task_id
  maxSizeMB?: number
  allowedTypes?: string[]
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, options: UploadOptions) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Validate file size
      const maxSize = (options.maxSizeMB || 10) * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${options.maxSizeMB}MB limit`)
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed')
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = options.folder ? `${options.folder}/${filename}` : filename

      // Upload
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path)

      setProgress(100)
      return { path: data.path, url: publicUrl }

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  const remove = async (bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
  }

  return { upload, remove, uploading, progress, error }
}
```

### 23.4 FileUpload Component

```typescript
// src/components/ui/FileUpload.tsx
interface FileUploadProps {
  bucket: 'avatars' | 'attachments' | 'brand-assets' | 'chat-files'
  folder?: string
  accept?: string
  maxSizeMB?: number
  onUpload: (url: string, path: string) => void
  onError?: (error: string) => void
}

export function FileUpload({ bucket, folder, accept, maxSizeMB = 10, onUpload, onError }: FileUploadProps) {
  const { upload, uploading, progress } = useFileUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await upload(file, { bucket, folder, maxSizeMB })
      onUpload(result.url, result.path)
    } catch (err) {
      onError?.(err.message)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            {progress}%
          </>
        ) : (
          <>
            <Upload className="mr-2" />
            Upload File
          </>
        )}
      </Button>
    </div>
  )
}
```

---

## Phase 24: Meta Ads Integration

### 24.1 Database

```sql
-- Already in ads_accounts table
-- Adding OAuth tokens table for better security

CREATE TABLE integration_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('meta', 'google', 'tiktok')),
  
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  scopes TEXT[],
  account_id TEXT, -- Platform's account ID
  account_name TEXT,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, provider, account_id)
);
```

### 24.2 Meta OAuth Flow

```typescript
// src/features/integrations/api/metaApi.ts

const META_APP_ID = import.meta.env.VITE_META_APP_ID
const META_REDIRECT_URI = import.meta.env.VITE_META_REDIRECT_URI

// Step 1: Redirect to Meta OAuth
export function getMetaAuthUrl(workspaceId: string) {
  const state = btoa(JSON.stringify({ workspaceId }))
  const scopes = [
    'ads_management',
    'ads_read',
    'business_management',
    'pages_read_engagement'
  ].join(',')

  return `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}` +
    `&scope=${scopes}` +
    `&state=${state}` +
    `&response_type=code`
}

// Step 2: Exchange code for token (Edge Function)
// supabase/functions/meta-oauth-callback/index.ts
```

### 24.3 Meta OAuth Callback Edge Function

```typescript
// supabase/functions/meta-oauth-callback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  
  if (!code || !state) {
    return new Response('Missing code or state', { status: 400 })
  }

  const { workspaceId } = JSON.parse(atob(state))

  // Exchange code for token
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${Deno.env.get('META_APP_ID')}` +
    `&client_secret=${Deno.env.get('META_APP_SECRET')}` +
    `&redirect_uri=${Deno.env.get('META_REDIRECT_URI')}` +
    `&code=${code}`
  )

  const { access_token, expires_in } = await tokenResponse.json()

  // Get long-lived token
  const longTokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${Deno.env.get('META_APP_ID')}` +
    `&client_secret=${Deno.env.get('META_APP_SECRET')}` +
    `&fb_exchange_token=${access_token}`
  )

  const { access_token: longToken, expires_in: longExpires } = await longTokenResponse.json()

  // Get ad accounts
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/adaccounts?` +
    `fields=id,name,account_status` +
    `&access_token=${longToken}`
  )

  const { data: accounts } = await accountsResponse.json()

  // Save to database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  for (const account of accounts) {
    await supabase.from('ads_accounts').upsert({
      workspace_id: workspaceId,
      platform: 'meta',
      account_id: account.id,
      account_name: account.name,
      access_token_encrypted: longToken, // TODO: Encrypt properly
      token_expires_at: new Date(Date.now() + longExpires * 1000).toISOString(),
      status: 'connected'
    }, { onConflict: 'workspace_id,platform,account_id' })
  }

  // Redirect back to app
  return Response.redirect(`${Deno.env.get('APP_URL')}/settings/integrations?meta=success`)
})
```

### 24.4 Sync Ads Data Edge Function

```typescript
// supabase/functions/sync-ads/index.ts
serve(async (req) => {
  const { account_id } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get account with token
  const { data: account } = await supabase
    .from('ads_accounts')
    .select('*')
    .eq('id', account_id)
    .single()

  if (!account) throw new Error('Account not found')

  // Fetch campaigns from Meta
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${account.account_id}/campaigns?` +
    `fields=id,name,status,objective,insights{spend,impressions,clicks,conversions}` +
    `&access_token=${account.access_token_encrypted}`
  )

  const { data: campaigns } = await response.json()

  // Upsert campaigns
  for (const campaign of campaigns) {
    const insights = campaign.insights?.data?.[0] || {}
    
    await supabase.from('ads_campaigns').upsert({
      ads_account_id: account.id,
      external_id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      objective: campaign.objective,
      spend: insights.spend || 0,
      impressions: insights.impressions || 0,
      clicks: insights.clicks || 0,
      conversions: insights.conversions || 0,
      last_synced_at: new Date().toISOString()
    }, { onConflict: 'ads_account_id,external_id' })
  }

  // Update account last sync
  await supabase
    .from('ads_accounts')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', account_id)

  return new Response(JSON.stringify({ synced: campaigns.length }))
})
```

---

## Phase 25: Gmail Integration

### 25.1 Gmail OAuth

```typescript
// src/features/integrations/api/gmailApi.ts

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI

export function getGmailAuthUrl(workspaceId: string, clientId: string) {
  const state = btoa(JSON.stringify({ workspaceId, clientId }))
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ].join(' ')

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}` +
    `&response_type=code` +
    `&access_type=offline` +
    `&prompt=consent`
}
```

### 25.2 Gmail Callback Edge Function

```typescript
// supabase/functions/gmail-oauth-callback/index.ts
serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const { workspaceId, clientId } = JSON.parse(atob(state!))

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code!,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URI')!,
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenResponse.json()

  // Get user email
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  )
  const user = await userResponse.json()

  // Save integration
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  await supabase.from('integration_tokens').upsert({
    workspace_id: workspaceId,
    provider: 'google',
    account_id: user.email,
    account_name: user.name,
    access_token_encrypted: tokens.access_token,
    refresh_token_encrypted: tokens.refresh_token,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scopes: ['gmail.readonly', 'gmail.send']
  }, { onConflict: 'workspace_id,provider,account_id' })

  return Response.redirect(`${Deno.env.get('APP_URL')}/clients/${clientId}?gmail=success`)
})
```

---

## Phase 26: Google Drive Integration

```typescript
// Similar to Gmail, but with Drive scopes:
const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
]

// Fetch files from Drive
export async function listDriveFiles(accessToken: string, folderId?: string) {
  const query = folderId 
    ? `'${folderId}' in parents`
    : `'root' in parents`

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
    `q=${encodeURIComponent(query)}` +
    `&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  return response.json()
}
```

---

## Environment Variables (.env)

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Meta (Facebook) Ads
VITE_META_APP_ID=123456789
VITE_META_REDIRECT_URI=https://xxx.supabase.co/functions/v1/meta-oauth-callback
META_APP_SECRET=xxx # Edge Function only

# Google (Gmail + Drive)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://xxx.supabase.co/functions/v1/google-oauth-callback
GOOGLE_CLIENT_SECRET=xxx # Edge Function only

# App
VITE_APP_URL=https://app.ninjawy.com
APP_URL=https://app.ninjawy.com # Edge Function
```

---

## Updated Task Checklist

```markdown
## Phase 23: File Storage
- [ ] 23.1 Create storage buckets
- [ ] 23.2 Storage RLS policies
- [ ] 23.3 useFileUpload hook
- [ ] 23.4 FileUpload component
- [ ] 23.5 Image preview/gallery component
- [ ] 23.6 Drag & Drop upload

## Phase 24: Meta Ads Integration
- [ ] 24.1 Meta OAuth flow
- [ ] 24.2 meta-oauth-callback Edge Function
- [ ] 24.3 sync-ads Edge Function
- [ ] 24.4 Ads refresh/sync UI
- [ ] 24.5 Token refresh logic

## Phase 25: Gmail Integration
- [ ] 25.1 Gmail OAuth flow
- [ ] 25.2 gmail-oauth-callback Edge Function
- [ ] 25.3 List emails Edge Function
- [ ] 25.4 Send email Edge Function
- [ ] 25.5 Client Emails tab UI

## Phase 26: Google Drive Integration
- [ ] 26.1 Drive OAuth flow
- [ ] 26.2 drive-oauth-callback Edge Function
- [ ] 26.3 List files Edge Function
- [ ] 26.4 Client Drive tab UI
- [ ] 26.5 Link file to task/project
```

