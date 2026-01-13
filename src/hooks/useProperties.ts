import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

export type PropertyType = 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url' | 'email';

export type PropertyOption = {
  value: string;
  label: string;
  color?: string;
};

export type PropertyDefinition = {
  id: string;
  workspace_id: string;
  entity_type: 'task' | 'project' | 'client';
  name: string;
  key: string;
  property_type: PropertyType;
  config: {
    options?: PropertyOption[];
  };
  is_required: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
};

export type CreatePropertyInput = {
  entity_type: 'task' | 'project' | 'client';
  name: string;
  key: string;
  property_type: PropertyType;
  config?: {
    options?: PropertyOption[];
  };
  is_required?: boolean;
};

export function useProperties(entityType: 'task' | 'project' | 'client') {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [properties, setProperties] = useState<PropertyDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await (supabase
        .from('property_definitions') as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('entity_type', entityType)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProperties(data as PropertyDefinition[]);
    } catch (err: unknown) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [workspace, entityType]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = useCallback(async (input: CreatePropertyInput) => {
    if (!user || !workspace) throw new Error('Not authenticated');

    try {
      setError(null);
      const { data, error } = await (supabase
        .from('property_definitions') as any)
        .insert({
          workspace_id: workspace.id,
          entity_type: input.entity_type,
          name: input.name,
          key: input.key,
          property_type: input.property_type,
          config: input.config || {},
          is_required: input.is_required || false,
        })
        .select()
        .single();

      if (error) throw error;

      setProperties(prev => [...prev, data as PropertyDefinition]);
      return data as PropertyDefinition;
    } catch (err: unknown) {
      console.error('Error creating property:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [user, workspace]);

  const updateProperty = useCallback(async (
    propertyId: string, 
    updates: Partial<Pick<PropertyDefinition, 'name' | 'config' | 'is_required' | 'is_visible' | 'sort_order'>>
  ) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setError(null);
      const { data, error } = await (supabase
        .from('property_definitions') as any)
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, ...data } : p
      ));
      return data as PropertyDefinition;
    } catch (err: unknown) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [user]);

  const deleteProperty = useCallback(async (propertyId: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setError(null);
      const { error } = await (supabase
        .from('property_definitions') as any)
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err: unknown) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [user]);

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refresh: fetchProperties,
  };
}
