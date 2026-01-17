import { useState, useEffect, useRef } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccountSettings() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with profile data whenever profile changes or editing is toggled off
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNickname(profile.nickname || '');
      setTitle(profile.title || ''); 
    }
  }, [profile]);

  const handleAvatarClick = () => {
    if (!isEditing) return; 
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File too large. Max 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      alert('Avatar updated successfully! 📸');
    } catch (err) {
      console.error(err);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        full_name: fullName,
        nickname: nickname,
        title: title,
      });
      alert('Changes saved successfully! ✅');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset fields to original profile values
    if (profile) {
      setFullName(profile.full_name || '');
      setNickname(profile.nickname || '');
      setTitle(profile.title || '');
    }
  };

  if (loading && !profile) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-6 h-6 animate-spin text-primary" />
       </div>
     );
  }

  const initials = (profile?.full_name || profile?.email || '??').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">My Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your personal information.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-[#2c2c2c]">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={!isEditing}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#2c2c2c] border-[#3c3c3c]"
            onClick={handleAvatarClick}
            disabled={isUploading || !isEditing}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isUploading ? 'Uploading...' : 'Change Avatar'}
          </Button>
          <div className="text-xs text-muted-foreground">Recommended size 256x256px</div>
        </div>
      </div>

      <Separator className="bg-[#2c2c2c]" />

      <div className="space-y-4 max-w-md">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isEditing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input 
            id="nickname" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isEditing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Job Title / Role</Label>
          <Input 
            id="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Product Designer"
            className="bg-[#2c2c2c] border-[#3c3c3c] text-white disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isEditing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="text-sm text-muted-foreground p-2 bg-[#2c2c2c]/50 rounded-md border border-[#3c3c3c] cursor-not-allowed truncate overflow-hidden">
            {profile?.email}
          </div>
          <p className="text-xs text-muted-foreground">Contact support to change email.</p>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="ghost" disabled={isSaving}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
