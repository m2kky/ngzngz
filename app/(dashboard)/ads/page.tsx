"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, Plug } from "lucide-react"
import { MetricsSelector, AVAILABLE_METRICS } from "@/components/ads/metrics-selector"
import { LiveCampaignsTable } from "@/components/ads/live-campaigns-table"
import { ConnectionsModal } from "@/components/integrations/connections-modal"
import { AdCenterEmptyState } from "@/components/ads/empty-state"
import { MetaIcon, TikTokIcon, GoogleAdsIcon } from "@/components/integrations/platform-icons"
import { CampaignData } from "@/types/integrations"
import { toast } from "sonner"

const PLATFORM_ICONS: Record<string, any> = {
    META: MetaIcon,
    TIKTOK: TikTokIcon,
    GOOGLE: GoogleAdsIcon
}

export default function AdsPage() {
    const [campaigns, setCampaigns] = useState<CampaignData[]>([])
    const [integrations, setIntegrations] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showConnectionsModal, setShowConnectionsModal] = useState(false)
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
        AVAILABLE_METRICS.filter(m => m.default).map(m => m.id)
    )
    const supabase = createClient() as any

    useEffect(() => {
        const saved = localStorage.getItem('ad_metrics')
        if (saved) {
            setSelectedMetrics(JSON.parse(saved))
        }
        fetchIntegrations()
    }, [])

    const handleMetricsChange = (metrics: string[]) => {
        setSelectedMetrics(metrics)
        localStorage.setItem('ad_metrics', JSON.stringify(metrics))
    }

    const fetchIntegrations = async () => {
        try {
            const { data } = await supabase
                .from('integrations')
                .select('*')
                .eq('status', 'ACTIVE')

            setIntegrations(data || [])

            // Auto-fetch campaigns if we have connections
            if (data && data.length > 0) {
                fetchCampaigns()
            }
        } catch (error) {
            console.error('Error fetching integrations:', error)
        }
    }

    const fetchCampaigns = async () => {
        setLoading(true)
        try {
            const platforms = ['meta', 'tiktok', 'google']
            const results = await Promise.allSettled(
                platforms.map(platform =>
                    fetch(`/api/proxy/ads/${platform}`).then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch ${platform}`)
                        return res.json()
                    })
                )
            )

            const allCampaigns: CampaignData[] = []
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.campaigns) {
                    allCampaigns.push(...result.value.campaigns)
                }
            })

            setCampaigns(allCampaigns)
            if (allCampaigns.length > 0) {
                toast.success(`Loaded ${allCampaigns.length} campaigns`)
            }
        } catch (error: any) {
            console.error('Error fetching campaigns:', error)
            toast.error('Failed to fetch campaign data')
        } finally {
            setLoading(false)
        }
    }

    const totalSpend = campaigns.reduce((sum, c) => sum + c.metrics.spend, 0)
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics.revenue || 0), 0)
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0

    const connectedPlatforms = integrations.filter(i => i.status === 'ACTIVE')
    const hasConnections = connectedPlatforms.length > 0

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <TrendingUp className="text-[var(--brand)]" size={40} />
                        Ad Center
                    </h1>
                    <p className="text-zinc-400">
                        Real-time performance data from your connected ad platforms
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Connected Platforms Indicators */}
                    {hasConnections && (
                        <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-lg border border-white/10">
                            {connectedPlatforms.map(integration => {
                                const Icon = PLATFORM_ICONS[integration.platform]
                                return Icon ? (
                                    <div key={integration.id} className="relative">
                                        <Icon size={20} />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-zinc-900" />
                                    </div>
                                ) : null
                            })}
                        </div>
                    )}

                    {/* Manage Connections Button */}
                    <Button
                        onClick={() => setShowConnectionsModal(true)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/5"
                    >
                        <Plug size={16} className="mr-2" />
                        Manage Connections
                    </Button>

                    {hasConnections && (
                        <>
                            <MetricsSelector
                                selectedMetrics={selectedMetrics}
                                onMetricsChange={handleMetricsChange}
                            />
                            <Button
                                onClick={fetchCampaigns}
                                disabled={loading}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/5"
                            >
                                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Empty State - No Connections */}
            {!hasConnections && (
                <AdCenterEmptyState onConnect={() => setShowConnectionsModal(true)} />
            )}

            {/* Main Content - Has Connections */}
            {hasConnections && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-panel p-6 rounded-xl">
                            <div className="text-sm text-zinc-400 mb-2">Total Spend</div>
                            <div className="text-3xl font-bold text-white">${totalSpend.toFixed(2)}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-xl">
                            <div className="text-sm text-zinc-400 mb-2">Total Revenue</div>
                            <div className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-xl">
                            <div className="text-sm text-zinc-400 mb-2">Average ROAS</div>
                            <div className={`text-3xl font-bold ${avgROAS >= 2.0 ? 'text-green-400' : 'text-white'}`}>
                                {avgROAS.toFixed(2)}x
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="live" className="w-full">
                        <TabsList className="glass-panel border-white/10 mb-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--brand)]/20 data-[state=active]:text-[var(--brand)]">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="live" className="data-[state=active]:bg-[var(--brand)]/20 data-[state=active]:text-[var(--brand)]">
                                Live Campaigns
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--brand)]/20 data-[state=active]:text-[var(--brand)]">
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="glass-panel p-12 rounded-2xl text-center">
                                <p className="text-zinc-400">Overview dashboard coming soon...</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="live">
                            <LiveCampaignsTable
                                campaigns={campaigns}
                                selectedMetrics={selectedMetrics}
                            />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="glass-panel p-12 rounded-2xl text-center">
                                <p className="text-zinc-400">Analytics dashboard coming soon...</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* Connections Management Modal */}
            <ConnectionsModal
                open={showConnectionsModal}
                onClose={() => setShowConnectionsModal(false)}
                onConnectionsChange={fetchIntegrations}
            />
        </div>
    )
}

