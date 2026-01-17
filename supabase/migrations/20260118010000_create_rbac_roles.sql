-- Create roles table
CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "workspace_id" UUID NOT NULL REFERENCES "public"."workspaces"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "is_system" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("workspace_id", "name")
);

-- Add RLS to roles
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles in their workspace" ON "public"."roles"
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage roles" ON "public"."roles"
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') -- fallback to old role column for bootstrap
        )
    );

-- Add role_id to workspace_members
ALTER TABLE "public"."workspace_members" 
ADD COLUMN IF NOT EXISTS "role_id" UUID REFERENCES "public"."roles"("id");

-- Function to seed default Owner role for existing workspaces
DO $$
DECLARE
    w RECORD;
    owner_role_id UUID;
BEGIN
    FOR w IN SELECT id FROM workspaces LOOP
        -- Create Owner Role (Full Access)
        INSERT INTO roles (workspace_id, name, description, permissions, is_system)
        VALUES (
            w.id, 
            'Owner', 
            'Full access to all modules and settings', 
            '{
                "tasks": {"view": true, "create": true, "edit": true, "delete": true},
                "ads": {"view": true, "manage": true},
                "finance": {"view": true, "manage": true},
                "strategy": {"view": true, "edit": true},
                "settings": {"view": true, "manage": true}
            }'::jsonb,
            true
        )
        ON CONFLICT (workspace_id, name) DO UPDATE SET permissions = EXCLUDED.permissions
        RETURNING id INTO owner_role_id;

        -- Create Member Role (Restricted)
        INSERT INTO roles (workspace_id, name, description, permissions, is_system)
        VALUES (
            w.id, 
            'Member', 
            'Standard access to tasks and projects', 
            '{
                "tasks": {"view": true, "create": true, "edit": true, "delete": false},
                "ads": {"view": false, "manage": false},
                "finance": {"view": false, "manage": false},
                "strategy": {"view": true, "edit": false},
                "settings": {"view": false, "manage": false}
            }'::jsonb,
            true
        )
        ON CONFLICT (workspace_id, name) DO NOTHING;

        -- Migrate existing owners to the new Owner role
        -- Note: We are using the existing 'role' column in workspace_members or user_roles if it exists
        -- Assuming workspace_members has a 'role' string/enum for now based on audit
        UPDATE workspace_members 
        SET role_id = owner_role_id
        WHERE workspace_id = w.id AND (role = 'owner' OR role = 'admin' OR role = 'SYSTEM_ADMIN');
        
    END LOOP;
END $$;
