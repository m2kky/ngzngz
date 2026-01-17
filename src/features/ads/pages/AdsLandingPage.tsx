import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/features/clients/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, LayoutGrid } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ClientIntegrationStatus {
  client_id: string;
  meta: boolean;
  google: boolean;
}

export function AdsLandingPage() {
  const navigate = useNavigate();
  const { clients, loading } = useClients();
  const [integrations, setIntegrations] = useState<Record<string, ClientIntegrationStatus>>({});
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  useEffect(() => {
    if (clients.length > 0) {
      fetchIntegrations();
    } else {
        setLoadingIntegrations(false);
    }
  }, [clients]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_integrations')
        .select('client_id, platform, status');

      if (error) throw error;

      const map: Record<string, ClientIntegrationStatus> = {};
      
      data?.forEach(row => {
        if (!map[row.client_id]) {
          map[row.client_id] = { client_id: row.client_id, meta: false, google: false };
        }
        if (row.platform === 'meta' && row.status === 'active') map[row.client_id].meta = true;
        if (row.platform === 'google' && row.status === 'active') map[row.client_id].google = true;
      });

      setIntegrations(map);
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  if (loading || loadingIntegrations) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
          <p className="text-muted-foreground">
            Select a client to manage their ad campaigns across platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const status = integrations[client.id] || { meta: false, google: false };
          
          return (
            <Card 
              key={client.id} 
              className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
              onClick={() => navigate(`/ads/${client.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold truncate">
                  {client.name}
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant={status.meta ? "default" : "secondary"} className="gap-1">
                    {status.meta ? "Meta Active" : "Meta Inactive"}
                  </Badge>
                  {/* Future: Google Badge */}
                </div>
                
                <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" className="gap-1 text-primary">
                     Manage Ads <ArrowRight className="w-4 h-4" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Clients Found</h3>
            <p className="text-muted-foreground mb-4">Add your first client to start managing ads.</p>
            <Button onClick={() => navigate('/clients')}>Go to Clients</Button>
          </div>
        )}
      </div>
    </div>
  );
}
