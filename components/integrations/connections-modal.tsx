"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MetaIcon, TikTokIcon, GoogleAdsIcon } from "@/components/integrations/platform-icons"
import { ConnectionModal } from "@/components/integrations/connection-modal"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

const PLATFORMS = [
    { id: 'META', name: 'Meta Ads', icon: MetaIcon, color: '#0866FF' },
    { id: 'TIKTOK', name: 'TikTok Ads', icon: TikTokIcon, color: '#000000' },
    { id: 'GOOGLE', name: 'Google Ads', icon: GoogleAdsIcon, color: '#4285F4' },
]

interface ConnectionsModalProps {
    open: boolean
    onClose: () => void
    onConnectionsChange?: () => void
}

export function ConnectionsModal({ open, onClose, onConnectionsChange }: ConnectionsModalProps) {
    const [integrations, setIntegrations] = useState<any[]>([])
    const [showConnectionWizard, setShowConnectionWizard] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchIntegrations()
        }
    }, [open])

    const fetchIntegrations = async () => {
        try {
            const { data, error } = await supabase.from('integrations').select('*')
            if (error) throw error
            setIntegrations(data || [])
        } catch (error) {
            console.error('Error fetching integrations:', error)
        }
    }

    const handleConnect = (platformId: string) => {
        setSelectedPlatform(platformId)
        setShowConnectionWizard(true)
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

    const handleDisconnect = async (integrationId: string) => {
        if (!confirm('Are you sure you want to disconnect this platform?')) return

        try {
            const { error } = await supabase
                .from('integrations')
                .delete()
                .eq('id', integrationId)

            if (error) throw error
            toast.success('Platform disconnected')
            fetchIntegrations()
            onConnectionsChange?.()
        } catch (error: any) {
            toast.error(`Failed to disconnect: ${error.message}`)
        }
    }

    const getIntegrationForPlatform = (platformId: string) => {
        return integrations.find(i => i.platform === platformId)
    }

    return (
        <>
            <Dialog open={open && !showConnectionWizard} onOpenChange={onClose}>
                <DialogContent className="glass-panel border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Manage Platform Connections
                        </DialogTitle>
                        <p className="text-zinc-400 text-sm">
                            Connect your ad accounts to view live campaign performance
                        </p>
                    </DialogHeader>

                    {/* Platform Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {PLATFORMS.map(platform => {
                            const integration = getIntegrationForPlatform(platform.id)
                            const Icon = platform.icon
                            const isConnected = !!integration
                            const isActive = integration?.status === 'ACTIVE'
                            const hasError = integration?.status === 'ERROR'

                            return (
                                <div
                                    key={platform.id}
                                    className={`glass-panel p-5 rounded-xl border-2 transition-all ${isActive
                                        ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                        : hasError
                                            ? 'border-red-500/30'
                                            : 'border-white/10'
                                        }`}
                                >
                                    {/* Platform Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Icon size={32} />
                                            <div>
                                                <h3 className="text-sm font-bold text-white">
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
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                                                <CheckCircle size={10} className="text-green-500" />
                                                <span className="text-xs font-bold text-green-500">Active</span>
                                            </div>
                                        )}
                                        {hasError && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                                                <AlertCircle size={10} className="text-red-500" />
                                                <span className="text-xs font-bold text-red-500">Error</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Last Synced */}
                                    {isConnected && integration.last_synced_at && (
                                        <div className="text-xs text-zinc-400 mb-3">
                                            Synced: {format(new Date(integration.last_synced_at), 'MMM dd, h:mm a')}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {!isConnected ? (
                                        <Button
                                            onClick={() => handleConnect(platform.id)}
                                            size="sm"
                                            className="w-full bg-[var(--brand)] text-black hover:opacity-90 font-bold"
                                        >
                                            Connect
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleSync(integration.id)}
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-white/20 text-white hover:bg-white/5"
                                            >
                                                <RefreshCw size={12} className="mr-1" />
                                                Sync
                                            </Button>
                                            <Button
                                                onClick={() => handleDisconnect(integration.id)}
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                            >
                                                Disconnect
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Connection Wizard */}
            <ConnectionModal
                open={showConnectionWizard}
                platform={selectedPlatform}
                onClose={() => {
                    setShowConnectionWizard(false)
                    setSelectedPlatform(null)
                }}
                onSuccess={() => {
                    setShowConnectionWizard(false)
                    setSelectedPlatform(null)
                    fetchIntegrations()
                    onConnectionsChange?.()
                }}
            />
        </>
    )
}
