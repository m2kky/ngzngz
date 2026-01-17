import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function AppearanceSettings() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how Ninjawy looks on your device.</p>
      </div>
      
      <div className="space-y-4">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-4">
          <div 
            onClick={() => setTheme('light')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'light' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-white text-gray-900 border border-gray-200">
              <Sun className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">Light</span>
              {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <div 
            onClick={() => setTheme('dark')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'dark' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-[#0a0a0c] text-white border border-gray-800">
              <Moon className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">Dark</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <div 
            onClick={() => setTheme('system')}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 p-1 hover:bg-accent/5",
              theme === 'system' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
            )}
          >
            <div className="h-20 rounded-md mb-2 flex items-center justify-center bg-[#1e1e1e] text-white border border-gray-700">
              <Monitor className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-sm font-medium">System</span>
              {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
