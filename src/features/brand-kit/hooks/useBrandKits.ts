import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Database } from '@/types/database.types';

export type BrandKit = Database['public']['Tables']['brand_kits']['Row'] & {
  clients?: { name: string } | null;
};

export type CreateBrandKitInput = Omit<
  Database['public']['Tables']['brand_kits']['Insert'],
  'id' | 'workspace_id' | 'created_at' | 'updated_at'
>;

export type UpdateBrandKitInput = Partial<CreateBrandKitInput>;

export function useBrandKits() {
  const { workspace } = useWorkspace();
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrandKits = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_kits')
        .select(`
          *,
          clients:client_id (name)
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrandKits(data as BrandKit[]);
    } catch (err: any) {
      console.error('Error fetching brand kits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandKits();
  }, [workspace?.id]);

  const createBrandKit = async (input: CreateBrandKitInput) => {
    if (!workspace) throw new Error('No workspace selected');

    try {
      const { data, error } = await supabase
        .from('brand_kits')
        .insert({
          ...input,
          workspace_id: workspace.id,
        })
        .select(`
          *,
          clients:client_id (name)
        `)
        .single();

      if (error) throw error;

      // Log activity for brand kit creation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          record_type: 'brand_kit',
          record_id: data.id,
          action_type: 'created',
          metadata: { name: input.name },
        });
      }

      // Update local state
      setBrandKits(prev => [data as BrandKit, ...prev]);
      return data as BrandKit;
    } catch (err: unknown) {
      console.error('Error creating brand kit:', err);
      throw err;
    }
  };

  const updateBrandKit = async (brandKitId: string, updates: UpdateBrandKitInput) => {
    if (!workspace) return;

    try {
      // Optimistic update
      setBrandKits(prev => prev.map(b => 
        b.id === brandKitId ? { ...b, ...updates } : b
      ));

      const { error } = await supabase
        .from('brand_kits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandKitId)
        .eq('workspace_id', workspace.id);

      if (error) throw error;
      
      // Refresh to get updated client relation
      fetchBrandKits();
    } catch (err: any) {
      console.error('Error updating brand kit:', err);
      fetchBrandKits();
      throw err;
    }
  };

  const deleteBrandKit = async (brandKitId: string) => {
    if (!workspace) return;

    try {
      const { error } = await supabase
        .from('brand_kits')
        .delete()
        .eq('id', brandKitId)
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      // Update local state
      setBrandKits(prev => prev.filter(b => b.id !== brandKitId));
    } catch (err: any) {
      console.error('Error deleting brand kit:', err);
      throw err;
    }
  };

  return { 
    brandKits, 
    loading, 
    error, 
    createBrandKit, 
    updateBrandKit, 
    deleteBrandKit,
    refresh: fetchBrandKits 
  };
}