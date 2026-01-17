import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function WorkspaceSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your workspace preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            N
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">Upload Logo</Button>
            <p className="text-xs text-muted-foreground">Recommended 256x256px PNG/JPG</p>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <Input defaultValue="Ninjawy" className="bg-[#2c2c2c] border-[#3c3c3c] text-white" />
          </div>
          
          <div className="space-y-2">
            <Label>Workspace URL</Label>
            <div className="flex items-center">
              <span className="bg-[#2c2c2c]/50 border border-[#3c3c3c] border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground h-10 flex items-center">
                ngz.app/
              </span>
              <Input defaultValue="ninjawy" className="rounded-l-none bg-[#2c2c2c] border-[#3c3c3c] text-white focus-visible:ring-0" />
            </div>
          </div>
        </div>

        <Separator className="bg-[#2c2c2c]" />

        <div className="space-y-4">
          <Label className="text-destructive">Danger Zone</Label>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
             <div>
                <h4 className="font-medium text-destructive mb-1">Delete Workspace</h4>
                <p className="text-xs text-muted-foreground">Permanently delete this workspace and all data.</p>
             </div>
             <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
