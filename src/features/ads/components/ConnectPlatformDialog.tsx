import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, ArrowRight, Check } from "lucide-react";
import { fetchAdAccounts } from "@/lib/adapters/meta-adapter";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConnectPlatformDialogProps {
  platform: 'meta' | 'google';
  onConnect: (credentials: any) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ConnectPlatformDialog({ platform, onConnect, trigger }: ConnectPlatformDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  
  const handleFetchAccounts = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await fetchAdAccounts(accessToken);
      
      // Filter active accounts if possible, or show all
      const activeAccounts = data.filter((acc: any) => acc.account_status === 1); // 1 = Active
      
      setAccounts(activeAccounts.length > 0 ? activeAccounts : data);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch ad accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedAccounts.length === 0) {
      toast.error("Please select at least one ad account");
      return;
    }

    try {
      setLoading(true);
      
      // Create a map of ID -> Name for easier display later
      const accountNames: Record<string, string> = {};
      accounts.forEach(acc => {
        if (selectedAccounts.includes(acc.id)) {
          // Remove act_ prefix for storage cleanliness if preferred, 
          // but keeping ID consistent is usually better.
          // Let's store raw ID from Meta.
          const cleanId = acc.id.replace('act_', '');
          accountNames[cleanId] = acc.name;
        }
      });

      await onConnect({
        access_token: accessToken,
        ad_account_ids: selectedAccounts,
        ad_account_names: accountNames
      });
      
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAccessToken("");
    setAccounts([]);
    setSelectedAccounts([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Connect Platform
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {platform === 'meta' ? 'Meta Ads' : 'Google Ads'}</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter your access token to fetch available ad accounts." 
              : "Select the ad accounts you want to track."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input 
                  type="password"
                  placeholder="EAAG..." 
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  System User Token or Long-lived User Token required.
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleFetchAccounts} 
                disabled={!accessToken || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Accounts <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {accounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No ad accounts found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <div key={acc.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer">
                        <Checkbox 
                          id={acc.id} 
                          checked={selectedAccounts.includes(acc.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedAccounts([...selectedAccounts, acc.id]);
                            else setSelectedAccounts(selectedAccounts.filter(id => id !== acc.id));
                          }}
                        />
                        <Label htmlFor={acc.id} className="flex-1 cursor-pointer font-normal">
                          <span className="font-medium block">{acc.name}</span>
                          <span className="text-xs text-muted-foreground">{acc.id}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{selectedAccounts.length} selected</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAccounts(accounts.map(a => a.id))}>
                  Select All
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleSave} disabled={loading || selectedAccounts.length === 0}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Save Connection
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
