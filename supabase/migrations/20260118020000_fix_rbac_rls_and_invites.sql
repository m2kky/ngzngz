-- Fix RLS on roles table
DROP POLICY IF EXISTS "Admins can manage roles" ON "public"."roles";

CREATE POLICY "Admins can manage roles" ON "public"."roles"
    FOR ALL USING (
        workspace_id IN (
            SELECT wm.workspace_id 
            FROM workspace_members wm
            LEFT JOIN roles r ON wm.role_id = r.id
            WHERE wm.user_id = auth.uid()
            AND (r.name = 'Owner' OR (r.permissions->'settings'->>'manage')::boolean = true)
        )
    );

-- Add role_id to invites table
ALTER TABLE "public"."invites" 
ADD COLUMN IF NOT EXISTS "role_id" UUID REFERENCES "public"."roles"("id");

-- Optional: Drop the old 'role' enum column constraint or make it nullable if strict
ALTER TABLE "public"."invites" ALTER COLUMN "role" DROP NOT NULL;
ALTER TABLE "public"."invites" ALTER COLUMN "role" SET DEFAULT NULL;
