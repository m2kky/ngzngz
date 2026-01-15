import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Database } from '@/types/database.types';

// Updating type definition to use 'users' table instead of 'profiles'
// Ideally this should be imported from Database types if 'users' is properly defined there
// But for now we can infer it or use 'any' if types are not perfectly generated yet.
// Based on previous reads, 'users' is in Database types.
export type UserProfile = Database['public']['Tables']['users']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Changed 'profiles' to 'users'
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data as UserProfile);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setLoading(true);
      // Changed 'profiles' to 'users'
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data as UserProfile);
      return data as UserProfile;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setLoading(true);
      
      // 1. Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update profile - Changed 'profiles' to 'users'
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data as UserProfile);
      return data as UserProfile;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}
