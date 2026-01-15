# Troubleshooting Guide

## Activity Logs & Comments Not Loading (404 Error)

### Problem Description

When opening task details, users encounter errors:
- ❌ "Error loading activity"
- ❌ "Error loading comments"

Browser console shows:
```
GET https://[project].supabase.co/rest/v1/users?select=*&id=eq.[user-id] 404 (Not Found)
Error: {
  code: 'PGRST205',
  message: "Could not find the table 'public.users' in the schema cache"
}
```

### Root Cause

PostgREST (Supabase's API layer) maintains a schema cache that needs to be refreshed when:
1. New RLS (Row Level Security) policies are added
2. New tables are created
3. Table permissions are modified

The 404 error occurs because PostgREST cannot find the tables in its cached schema, even though they exist in the database.

### Affected Tables

- `users` (user profiles)
- `comments` (task comments)  
- `activity_logs` (audit trail)

### Solution Steps

#### Option 1: Verify Supabase Project ID (CRITICAL)

**⚠️ MOST COMMON ISSUE**: Working on wrong project!

1. Check your `.env` file:
   ```bash
   cat web/.env | grep VITE_SUPABASE_URL
   ```

2. Extract project ID from URL:
   ```
   https://[PROJECT_ID].supabase.co
   ```

3. **Verify this matches** the project you're applying migrations to!

#### Option 2: Apply RLS Policies

If policies are missing, apply them using Supabase SQL Editor:

```sql
-- RLS Policies for users table
CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for comments table
CREATE POLICY "Users can view comments in their workspace"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    AND archived_at IS NULL
  );

CREATE POLICY "Users can create comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for activity_logs table
CREATE POLICY "Users can view activity logs in their workspace"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Grant explicit permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.activity_logs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;
```

#### Option 3: Force PostgREST Schema Reload

**Method 1: Using SQL Notify**
```sql
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
```

**Method 2: Pause/Resume Project**

1. Go to Supabase Dashboard → Project Settings → General
2. Click "Pause project"
3. Wait 1-2 minutes
4. Click "Resume project"
5. Wait another 1-2 minutes for services to start

**Method 3: Restart API (if available)**

Some Supabase projects have a "Restart" button in:
- Dashboard → Settings → API
- Look for "PostgREST Server" or "API Settings"

#### Option 4: Verify Table Names

Check actual table names in database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (table_name LIKE '%user%' 
    OR table_name LIKE '%comment%' 
    OR table_name LIKE '%activity%')
ORDER BY table_name;
```

Common naming discrepancies:
- `users` vs `profiles`
- `comments` vs `task_comments`
- `activity_log` vs `activity_logs` (singular vs plural)

Update your code to match the actual table names.

#### Option 5: Check Exposed Schemas

1. Go to Supabase Dashboard → Settings → API
2. Verify "Exposed schemas" includes `PUBLIC`
3. If not, add it and save

### Verification

After applying the fix:

1. **Wait 10 seconds** for changes to propagate
2. **Hard refresh** browser (Ctrl+Shift+R)
3. **Open a task** from DataTable or Kanban
4. **Check Comments & Activity tabs** load without errors

### Prevention

To avoid this issue in the future:

1. ✅ Always verify project ID before running migrations
2. ✅ Apply RLS policies immediately after creating tables
3. ✅ Grant explicit permissions to `anon` and `authenticated` roles
4. ✅ Test API access after any schema changes
5. ✅ Document table naming conventions

### Still Not Working?

If the issue persists:

1. **Check browser console** for exact error message
2. **Verify RLS is enabled** on the tables:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('users', 'comments', 'activity_logs');
   ```

3. **Check policies exist**:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies
   WHERE tablename IN ('users', 'comments', 'activity_logs')
   ORDER BY tablename, policyname;
   ```

4. **Test direct API access** using curl:
   ```bash
   curl 'https://[PROJECT_ID].supabase.co/rest/v1/users?select=*' \
     -H "apikey: [ANON_KEY]" \
     -H "Authorization: Bearer [USER_JWT]"
   ```

5. **Contact Supabase support** if PostgREST continues to return 404 after all steps

## Other Common Issues

### Issue: Tasks not displaying in views

**Solution**: Check workspace membership and refresh data.

### Issue: Drag & drop not working in Kanban

**Solution**: Verify `onUpdateTask` callback is properly connected.

---

**Last Updated**: 2026-01-15
**Maintainer**: m2kky
