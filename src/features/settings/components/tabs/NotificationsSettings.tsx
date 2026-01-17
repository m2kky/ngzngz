import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Notifications</h2>
        <p className="text-sm text-muted-foreground">Manage how you receive notifications.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive push notifications on your device.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}
