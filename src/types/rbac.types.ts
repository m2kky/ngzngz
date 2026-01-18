import { z } from 'zod';

// ============================================
// PERMISSION ACTIONS (matching DB structure)
// ============================================
export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'] as const;
export type PermissionAction = typeof PERMISSION_ACTIONS[number];

// ============================================
// RESOURCE MODULES
// ============================================
export const RESOURCE_MODULES = [
  'tasks',
  'clients', 
  'projects',
  'meetings',
  'reports',
  'ads',
  'brand_kits',
  'strategy',
  'settings',
  'members',
  'finance',
] as const;
export type ResourceModule = typeof RESOURCE_MODULES[number];

// ============================================
// PERMISSIONS OBJECT (DB uses {module: {action: boolean}})
// ============================================
export type ModulePermissions = {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  manage?: boolean;
};

export type Permissions = {
  [K in ResourceModule]?: ModulePermissions;
};

// Zod schema for validation
export const ModulePermissionsSchema = z.object({
  view: z.boolean().optional(),
  create: z.boolean().optional(),
  edit: z.boolean().optional(),
  delete: z.boolean().optional(),
  manage: z.boolean().optional(),
});

export const PermissionsSchema = z.record(
  z.string(), // We use string to allow flexibility but practically it's ResourceModule
  ModulePermissionsSchema
);

// ============================================
// ROLE (matches existing DB structure)
// ============================================
export interface Role {
  id: string;
  workspace_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  color: string | null;
  permissions: Permissions;
  is_system: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const RoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  permissions: PermissionsSchema,
});

export type CreateRoleInput = z.infer<typeof RoleSchema>;
export type UpdateRoleInput = Partial<CreateRoleInput> & { id: string };

// ============================================
// WORKSPACE MEMBER WITH ROLE
// ============================================
export interface WorkspaceMemberWithRole {
  id: string;
  workspace_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'invited';
  role_id: string | null;
  role?: Role | null;
  joined_at: string;
  // User info (from join)
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// ============================================
// ROLE TEMPLATES (for quick setup)
// ============================================
export const ROLE_TEMPLATES = {
  fullAccess: {
    name: 'Full Access',
    permissions: {
      tasks: { view: true, create: true, edit: true, delete: true },
      clients: { view: true, create: true, edit: true, delete: true },
      projects: { view: true, create: true, edit: true, delete: true },
      meetings: { view: true, create: true, edit: true, delete: true },
      ads: { view: true, manage: true },
      strategy: { view: true, edit: true },
      settings: { view: true, manage: true },
    } as Permissions,
  },
  contentCreator: {
    name: 'Content Creator',
    permissions: {
      tasks: { view: true, create: true, edit: true },
      clients: { view: true },
      projects: { view: true },
      strategy: { view: true },
    } as Permissions,
  },
  readOnly: {
    name: 'Read Only',
    permissions: {
      tasks: { view: true },
      clients: { view: true },
      projects: { view: true },
      meetings: { view: true },
      strategy: { view: true },
    } as Permissions,
  },
} as const;
