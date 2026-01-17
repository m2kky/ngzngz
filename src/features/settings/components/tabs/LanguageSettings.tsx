import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export function LanguageSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Language & Region</h2>
        <p className="text-sm text-muted-foreground">Customize your language and region preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select defaultValue="en">
            <SelectTrigger className="w-full max-w-sm bg-[#2c2c2c] border-[#3c3c3c] text-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="ar">Arabic (العربية)</SelectItem>
              <SelectItem value="fr">French (Français)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Change the language used in the user interface.</p>
        </div>

        <Separator className="bg-[#2c2c2c]" />

        <div className="space-y-2">
          <Label>First day of week</Label>
          <Select defaultValue="sat">
            <SelectTrigger className="w-full max-w-sm bg-[#2c2c2c] border-[#3c3c3c] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sat">Saturday</SelectItem>
              <SelectItem value="sun">Sunday</SelectItem>
              <SelectItem value="mon">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Use 24-hour time</Label>
            <p className="text-sm text-muted-foreground">Display time in 24-hour format (e.g., 14:00).</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
