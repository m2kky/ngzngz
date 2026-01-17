import { useState, useEffect } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { usePermission } from '@/features/auth/context/RBACContext';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Shield, Users, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const RESOURCES = ['tasks', 'ads', 'finance', 'strategy', 'settings'] as const;
const ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'] as const;

export function TeamSettingsPage() {
  const { workspace } = useWorkspace();
  const { can } = usePermission();
  
  if (!can('view', 'settings')) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Shield className="w-12 h-12 mb-4 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p>You do not have permission to view team settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground">Manage roles, permissions, and team members.</p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles">
          <RolesManager />
        </TabsContent>
        
        <TabsContent value="members">
          <MembersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RolesManager() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRoles = async () => {
    if (!workspace) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, [workspace?.id]);

  const handleSaveRole = async (role: any) => {
    if (!workspace) return;

    try {
      if (role.id) {
        // Update
        const { error } = await supabase
          .from('roles')
          .update({
            name: role.name,
            description: role.description,
            permissions: role.permissions
          })
          .eq('id', role.id);
        if (error) throw error;
        toast({ title: "Role Updated", description: "Permissions saved successfully." });
      } else {
        // Create
        const { error } = await supabase
          .from('roles')
          .insert({
            workspace_id: workspace.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            is_system: false
          });
        if (error) throw error;
        toast({ title: "Role Created", description: "New role added successfully." });
      }
      setIsDialogOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error: any) {
      console.error("Failed to save role:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save role. Please check console for details.", 
        variant: "destructive" 
      });
    }
  };

  if (loading) return <div>Loading roles...</div>;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Defined Roles</h3>
        <Button onClick={() => {
            setEditingRole({ 
                name: '', 
                description: '', 
                permissions: {} 
            });
            setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {role.name}
                {role.is_system && <span className="text-xs bg-muted px-2 py-1 rounded font-normal text-muted-foreground">System</span>}
              </CardTitle>
              <CardDescription>{role.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {Object.keys(role.permissions).length} modules configured
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  setEditingRole(role);
                  setIsDialogOpen(true);
              }}>
                Edit Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <RoleEditorDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
}

function RoleEditorDialog({ open, onOpenChange, role, onSave }: any) {
  const [formData, setFormData] = useState<any>(role);

  useEffect(() => {
    setFormData(role || { name: '', description: '', permissions: {} });
  }, [role]);

  if (!formData) return null;

  const togglePermission = (resource: string, action: string) => {
    const currentPerms = formData.permissions[resource] || {};
    const newValue = !currentPerms[action];
    
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [resource]: {
          ...currentPerms,
          [action]: newValue
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role?.id ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>Configure granular permissions for this role.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={role?.is_system} // Prevent renaming system roles
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Resource</TableHead>
                  {ACTIONS.map(action => (
                    <TableHead key={action} className="text-center capitalize">{action}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESOURCES.map(resource => (
                  <TableRow key={resource}>
                    <TableCell className="font-medium capitalize">{resource}</TableCell>
                    {ACTIONS.map(action => {
                      const isChecked = formData.permissions?.[resource]?.[action] || false;
                      return (
                        <TableCell key={action} className="text-center">
                          <Switch 
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(resource, action)}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MembersManager() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!workspace) return;
    setLoading(true);

    // Fetch Roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('id, name')
      .eq('workspace_id', workspace.id);
    
    setRoles(rolesData || []);

    // Fetch Members with Role
    const { data: membersData, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        user_id,
        role_id,
        users:user_id (full_name, email, avatar_url),
        roles:role_id (name)
      `)
      .eq('workspace_id', workspace.id);

    if (error) {
      toast({ title: "Error", description: "Failed to fetch members", variant: "destructive" });
    } else {
      setMembers(membersData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [workspace?.id]);

  const handleRoleChange = async (memberId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role_id: roleId })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({ title: "Updated", description: "Member role updated successfully." });
      fetchData(); // Refresh to show updated role name if needed
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="mt-4 border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead className="w-[200px]">Assign Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {member.users?.full_name || "Unknown"}
                </div>
              </TableCell>
              <TableCell>{member.users?.email}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {member.roles?.name || "No Role"}
                </span>
              </TableCell>
              <TableCell>
                <Select 
                  value={member.role_id || ""} 
                  onValueChange={(val) => handleRoleChange(member.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
