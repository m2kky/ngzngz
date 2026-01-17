import { Button } from '@/components/ui/button';

export function BillingSettings() {
  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-xl font-semibold mb-1">Plans & Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Current Plan Card */}
         <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-lg font-semibold text-primary mb-2">Pro Plan</h3>
               <div className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
               <p className="text-sm text-muted-foreground mb-6">You are on the Pro plan. Next billing date: Feb 14, 2026.</p>
               <Button className="w-full bg-primary text-primary-foreground">Manage Subscription</Button>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
         </div>

         {/* Usage Stats */}
         <div className="space-y-6 p-4 rounded-xl border border-[#2c2c2c] bg-[#1e1e1e]">
            <h4 className="font-medium text-sm">Usage limits</h4>
            
            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Members</span>
                  <span className="text-muted-foreground">3 / 20</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[15%] rounded-full"></div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Storage</span>
                  <span className="text-muted-foreground">2.1 GB / 100 GB</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 w-[2%] rounded-full"></div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span>Automations</span>
                  <span className="text-muted-foreground">450 / 5000</span>
               </div>
               <div className="h-2 w-full bg-[#2c2c2c] rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[9%] rounded-full"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
