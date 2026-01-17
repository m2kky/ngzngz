import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video, ExternalLink, Paperclip, Loader2, FileIcon, Download, Trash2 } from 'lucide-react';
import type { Meeting } from '../../hooks/useMeetings';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MeetingAssetsProps {
  meeting: Meeting;
  onAssetUploaded?: () => void;
}

export function MeetingAssets({ meeting, onAssetUploaded }: MeetingAssetsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${meeting.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      // 3. Insert into meeting_assets table
      const { error: insertError } = await supabase
        .from('meeting_assets')
        .insert({
          meeting_id: meeting.id,
          name: file.name,
          url: publicUrl,
          file_type: file.type,
          size_bytes: file.size
        });

      if (insertError) throw insertError;

      toast.success('Asset uploaded successfully');
      onAssetUploaded?.();
    } catch (error) {
      console.error('Error uploading asset:', error);
      toast.error('Failed to upload asset');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="m-0 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Meeting Assets</h3>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
      
      <div className="grid gap-3">
        {meeting.recording_link && (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Meeting Recording</div>
                <div className="text-[10px] text-muted-foreground">Video Cloud Link</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => window.open(meeting.recording_link!, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Real Assets List */}
        {meeting.meeting_assets && meeting.meeting_assets.length > 0 ? (
          meeting.meeting_assets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{asset.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {asset.size_bytes ? formatSize(asset.size_bytes) : 'Unknown size'} • {new Date(asset.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(asset.url, '_blank')}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : !meeting.recording_link && (
          <div className="flex items-center justify-center py-12 border rounded-lg border-dashed">
            <div className="text-center space-y-2">
              <Paperclip className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
              <p className="text-sm text-muted-foreground">No documents attached yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
