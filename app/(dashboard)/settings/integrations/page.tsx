"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MetaIcon, TikTokIcon, GoogleAdsIcon } from "@/components/integrations/platform-icons"
import { Button } from "@/components/ui/button"
import { ConnectionModal } from "@/components/integrations/connection-modal"
import { RefreshCw, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

const PLATFORMS = [
    { id: 'META', name: 'Meta Ads', icon: MetaIcon, color: '#0866FF' },
    { id: 'TIKTOK', name: 'TikTok Ads', icon: TikTokIcon, color: '#000000' },
    { id: 'GOOGLE', name: 'Google Ads', icon: GoogleAdsIcon, color: '#4285F4' },
]

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchIntegrations()
    }, [])

    const fetchIntegrations = async () => {
        try {
            const { data, error } = await supabase.from('integrations').select('*')
            if (error) throw error
            setIntegrations(data || [])
        } catch (error) {
            console.error('Error fetching integrations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = (platformId: string) => {
        setSelectedPlatform(platformId)
        setShowModal(true)
    }

    const handleSync = async (integrationId: string) => {
        try {
            const { error } = await supabase
                .from('integrations')
                .update({ last_synced_at: new Date().toISOString() })
                .eq('id', integrationId)

            if (error) throw error
            toast.success('Synced successfully!')
            fetchIntegrations()
        } catch (error: any) {
            toast.error(`Sync failed: ${error.message}`)
        }
    }

    const getIntegrationForPlatform = (platformId: string) => {
        return integrations.find(i => i.platform === platformId)
    }

    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <LinkIcon className="text-[var(--brand)]" size={40} />
                    Platform Integrations
                </h1>
                <p className="text-zinc-400">
                    Connect your ad accounts to view live campaign performance
                </p>
            </div>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORMS.map(platform => {
                    const integration = getIntegrationForPlatform(platform.id)
                    const Icon = platform.icon
                    const isConnected = !!integration
                    const isActive = integration?.status === 'ACTIVE'
                    const hasError = integration?.status === 'ERROR'

                    return (
                        <div
                            key={platform.id}
                            className={`glass-panel p-6 rounded-2xl border-2 transition-all ${isActive
                                ? 'border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                : hasError
                                    ? 'border-red-500/30'
                                    : 'border-white/10'
                                }`}
                        >
                            {/* Platform Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Icon size={48} />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {platform.name}
                                        </h3>
                                        {isConnected && integration.ad_account_id && (
                                            <p className="text-xs text-zinc-500">
                                                {integration.ad_account_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {isActive && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                        <CheckCircle size={12} className="text-green-500" />
                                        <span className="text-xs font-bold text-green-500">Active</span>
                                    </div>
                                )}
                                {hasError && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                                        <AlertCircle size={12} className="text-red-500" />
                                        <span className="text-xs font-bold text-red-500">Error</span>
                                    </div>
                                )}
                            </div>

                            {/* Last Synced */}
                            {isConnected && integration.last_synced_at && (
                                <div className="text-xs text-zinc-400 mb-4">
                                    Last synced: {format(new Date(integration.last_synced_at), 'MMM dd, h:mm a')}
                                </div>
                            )}

                            {/* Error Message */}
                            {hasError && integration.error_message && (
                                <div className="text-xs text-red-400 mb-4 p-2 bg-red-500/10 rounded">
                                    {integration.error_message}
                                </div>
                            )}

                            {/* Actions */}
                            {!isConnected ? (
                                <Button
                                    onClick={() => handleConnect(platform.id)}
                                    className="w-full bg-[var(--brand)] text-black hover:opacity-90 font-bold"
                                >
                                    Connect
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleSync(integration.id)}
                                        variant="outline"
                                        className="flex-1 border-white/20 text-white hover:bg-white/5"
                                    >
                                        <RefreshCw size={16} className="mr-2" />
                                        Sync Now
                                    </Button>
                                    <Button
                                        onClick={() => handleConnect(platform.id)}
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/5"
                                    >
                                        Manage
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Connection Modal */}
            <ConnectionModal
                open={showModal}
                platform={selectedPlatform}
                onClose={() => {
                    setShowModal(false)
                    setSelectedPlatform(null)
                }}
                onSuccess={() => {
                    setShowModal(false)
                    setSelectedPlatform(null)
                    fetchIntegrations()
                }}
            />
        </div>
    )
}
