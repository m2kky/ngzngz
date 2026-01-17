import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/lib/supabase";
import { fetchMetaCampaigns, type NormalizedCampaign } from "@/lib/adapters/meta-adapter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Loader2, ArrowLeft, Plus, RefreshCw, Settings2, AlertCircle, LayoutTemplate 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConnectPlatformDialog } from "../components/ConnectPlatformDialog";
import { AdsAnalytics } from "../components/AdsAnalytics";
import { AdsFilters } from "../components/AdsFilters";
import { COLUMN_PRESETS, AVAILABLE_METRICS } from "../constants/column-presets";

export function ClientAdsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Meta Integration State
  const [metaIntegration, setMetaIntegration] = useState<any>(null);

  // Settings State
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(COLUMN_PRESETS.PERFORMANCE.columns);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("PERFORMANCE");

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    accountIds: [] as string[]
  });

  useEffect(() => {
    if (clientId && workspace) {
      loadClientAndIntegrations();
    }
  }, [clientId, workspace]);

  const loadClientAndIntegrations = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Client Name
      const { data: clientData } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single();
      
      if (clientData) setClientName(clientData.name);

      // 2. Fetch Integrations
      const { data: intData } = await supabase
        .from('ad_integrations')
        .select('*')
        .eq('client_id', clientId)
        .eq('platform', 'meta')
        .eq('status', 'active')
        .single();

      if (intData) {
        setMetaIntegration(intData);
        if (intData.settings?.visibleMetrics) {
          setVisibleMetrics(intData.settings.visibleMetrics);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Data Query
  const { 
    data: campaigns = [], 
    isLoading: fetchingData, 
    error: fetchError,
    refetch 
  } = useQuery({
    queryKey: ['meta-campaigns', metaIntegration?.id],
    queryFn: () => fetchMetaCampaigns(metaIntegration.credentials),
    enabled: !!metaIntegration?.credentials,
    refetchOnWindowFocus: false, // Prevent auto-refetch on focus
    staleTime: 60000, // Keep data fresh for 1 minute
  });

  // Derived Data
  const uniqueAccounts = useMemo(() => {
    const map = new Map<string, string>();
    campaigns.forEach(c => {
      map.set(c.account_id, c.account_name || c.account_id);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || c.status === filters.status;
      const matchesAccount = filters.accountIds.length === 0 || filters.accountIds.includes(c.account_id);
      
      return matchesSearch && matchesStatus && matchesAccount;
    });
  }, [campaigns, filters]);

  const handleConnect = async (credentials: any) => {
    if (!workspace) return;
    
    try {
      let result;
      
      if (metaIntegration) {
        // Update existing integration
        result = await supabase
          .from('ad_integrations')
          .update({
            credentials,
            settings: { ...metaIntegration.settings, visibleMetrics: DEFAULT_METRICS },
            status: 'active'
          })
          .eq('id', metaIntegration.id)
          .select()
          .single();
      } else {
        // Insert new integration
        result = await supabase
          .from('ad_integrations')
          .insert({
            workspace_id: workspace.id,
            client_id: clientId,
            platform: 'meta',
            credentials,
            settings: { visibleMetrics: DEFAULT_METRICS },
            status: 'active'
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setMetaIntegration(result.data);
      toast.success(metaIntegration ? "Connection updated successfully!" : "Meta Ads connected successfully!");
      
      // Refetch data immediately with new accounts
      queryClient.invalidateQueries({ queryKey: ['meta-campaigns'] });
      
    } catch (err: any) {
      toast.error(err.message || "Failed to connect");
    }
  };

  const handlePresetChange = (presetKey: string) => {
    const preset = COLUMN_PRESETS[presetKey as keyof typeof COLUMN_PRESETS];
    if (preset) {
      setVisibleMetrics(preset.columns);
      setActivePreset(presetKey);
      
      // Save logic (optional, if we want to persist the last view)
      handleUpdateMetrics(preset.columns); 
    }
  };

  const handleUpdateMetrics = async (newMetrics: string[]) => {
    setVisibleMetrics(newMetrics);
    
    // If customized, switch to Custom preset
    if (activePreset !== 'CUSTOM') {
      const currentPresetCols = COLUMN_PRESETS[activePreset as keyof typeof COLUMN_PRESETS].columns;
      const isDifferent = JSON.stringify(newMetrics.sort()) !== JSON.stringify(currentPresetCols.sort());
      if (isDifferent) setActivePreset('CUSTOM');
    }
    
    if (metaIntegration) {
      // Save to DB
      await supabase
        .from('ad_integrations')
        .update({ settings: { ...metaIntegration.settings, visibleMetrics: newMetrics } })
        .eq('id', metaIntegration.id);
        
      setMetaIntegration(prev => ({ ...prev, settings: { ...prev.settings, visibleMetrics: newMetrics } }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ads')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{clientName} Ads</h1>
            <p className="text-muted-foreground text-sm">Manage ad performance across platforms</p>
          </div>
        </div>
        
        {!metaIntegration && (
          <ConnectPlatformDialog 
            platform="meta" 
            onConnect={handleConnect} 
          />
        )}
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList>
          <TabsTrigger value="meta" className="gap-2">
            <span className="font-bold text-blue-600">f</span> Meta Ads
          </TabsTrigger>
          <TabsTrigger value="google" disabled className="gap-2 opacity-50">
            <span className="font-bold text-red-500">G</span> Google Ads (Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="mt-6 space-y-6">
          {!metaIntegration ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">f</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Meta Ads Not Connected</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Connect your ad account to view live performance data, spend, and results directly in this dashboard.
                </p>
                <ConnectPlatformDialog 
                  platform="meta" 
                  onConnect={handleConnect}
                  trigger={<Button>Connect Now</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analytics Section */}
              <AdsAnalytics data={filteredCampaigns} />

              {/* Controls & Filters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-3 py-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Live Data
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      {metaIntegration.credentials.ad_account_ids?.length || 1} Accounts Connected
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <ConnectPlatformDialog 
                      platform="meta" 
                      onConnect={handleConnect}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Manage Accounts
                        </Button>
                      }
                    />
                    
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={fetchingData}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    
                    {/* Columns Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <LayoutTemplate className="h-4 w-4 mr-2" />
                          Columns: {COLUMN_PRESETS[activePreset as keyof typeof COLUMN_PRESETS]?.label || 'Custom'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>View Presets</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.entries(COLUMN_PRESETS).map(([key, preset]) => {
                          if (key === 'CUSTOM') return null;
                          return (
                            <DropdownMenuItem key={key} onClick={() => handlePresetChange(key)}>
                              {preset.label}
                              {activePreset === key && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                          <Settings2 className="mr-2 h-4 w-4" /> Customize Columns...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <AdsFilters 
                  filters={filters} 
                  onChange={setFilters} 
                  accounts={uniqueAccounts} 
                />

                {/* Customization Dialog (Hidden, controlled by state) */}
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Customize Columns</DialogTitle>
                      <DialogDescription>Select the metrics you want to display.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      {AVAILABLE_METRICS.map((metric) => (
                        <div key={metric.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={metric.id} 
                            checked={visibleMetrics.includes(metric.id)}
                            onCheckedChange={(checked) => {
                              if (checked) handleUpdateMetrics([...visibleMetrics, metric.id]);
                              else handleUpdateMetrics(visibleMetrics.filter(m => m !== metric.id));
                            }}
                          />
                          <Label htmlFor={metric.id}>{metric.label}</Label>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Data Table */}
              <Card>
                <CardContent className="p-0">
                  {fetchError ? (
                    <div className="p-8 text-center text-red-500 flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>Failed to load data from Meta</p>
                      <p className="text-sm text-muted-foreground mt-1">{(fetchError as Error).message || "Unknown error"}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Campaign Name</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Objective</TableHead>
                          {visibleMetrics.map(mid => {
                            const metric = AVAILABLE_METRICS.find(m => m.id === mid);
                            return <TableHead key={mid} className="text-right">{metric?.label}</TableHead>;
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fetchingData ? (
                          [1,2,3].map(i => (
                            <TableRow key={i}>
                              <TableCell colSpan={4 + visibleMetrics.length} className="h-16">
                                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredCampaigns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4 + visibleMetrics.length} className="h-32 text-center text-muted-foreground">
                              {campaigns.length > 0 
                                ? "No campaigns match your filters." 
                                : "No active campaigns found in this account."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCampaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{campaign.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{campaign.id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                {campaign.account_name || campaign.account_id}
                              </TableCell>
                              <TableCell>
                                <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px]">
                                  {campaign.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{campaign.objective}</TableCell>
                              {visibleMetrics.map(mid => {
                                let value: any = (campaign as any)[mid];
                                
                                // Formatting
                                if (mid === 'spend' || mid === 'cost_per_result' || mid === 'cpc' || mid === 'cpm') {
                                  value = new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: campaign.currency || 'USD' 
                                  }).format(value);
                                } else if (mid === 'ctr') {
                                  value = `${value.toFixed(2)}%`;
                                } else if (mid === 'frequency') {
                                  value = value.toFixed(2);
                                } else {
                                  value = new Intl.NumberFormat('en-US').format(value);
                                }

                                return <TableCell key={mid} className="text-right font-mono text-xs">{value}</TableCell>;
                              })}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
