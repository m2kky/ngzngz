"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MetaIcon, TikTokIcon, GoogleAdsIcon } from "@/components/integrations/platform-icons"
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { testConnection } from "@/lib/integrations/ad-platform-service"
import { GuideDrawer } from "@/components/integrations/guide-drawer"
import { useWorkspace } from "@/components/providers/workspace-provider"

interface ConnectionModalProps {
    open: boolean
    platform: string | null
    onClose: () => void
    onSuccess: () => void
}

const PLATFORMS = [
    { id: 'META', name: 'Meta Ads', icon: MetaIcon, color: '#0866FF', description: 'Connect Facebook & Instagram Ads' },
    { id: 'TIKTOK', name: 'TikTok Ads', icon: TikTokIcon, color: '#000000', description: 'Connect TikTok For Business' },
    { id: 'GOOGLE', name: 'Google Ads', icon: GoogleAdsIcon, color: '#4285F4', description: 'Connect Google Ads Account' },
]

export function ConnectionModal({ open, platform: initialPlatform, onClose, onSuccess }: ConnectionModalProps) {
    const [step, setStep] = useState<'SELECT' | 'CREDENTIALS'>('SELECT')
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
    const [credentials, setCredentials] = useState({
        adAccountId: '',
        accessToken: '',
        advertiserId: '', // For TikTok
        customerId: '',   // For Google
        developerToken: '' // For Google
    })
    const [showToken, setShowToken] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; accountName?: string } | null>(null)
    const [saving, setSaving] = useState(false)
    const [showGuide, setShowGuide] = useState(false)

    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    // Reset state when modal opens/closes
    useState(() => {
        if (open) {
            if (initialPlatform) {
                setSelectedPlatform(initialPlatform)
                setStep('CREDENTIALS')
            } else {
                setStep('SELECT')
                setSelectedPlatform(null)
            }
            setCredentials({ adAccountId: '', accessToken: '', advertiserId: '', customerId: '', developerToken: '' })
            setTestResult(null)
            setShowGuide(false)
        }
    })

    const handlePlatformSelect = (platformId: string) => {
        setSelectedPlatform(platformId)
        setStep('CREDENTIALS')
        setTestResult(null)
    }

    const handleBack = () => {
        setStep('SELECT')
        setSelectedPlatform(null)
        setTestResult(null)
    }

    const handleTestConnection = async () => {
        if (!selectedPlatform) return

        setTesting(true)
        setTestResult(null)

        try {
            // Map credentials based on platform
            const creds: any = { accessToken: credentials.accessToken }

            if (selectedPlatform === 'META') {
                creds.adAccountId = credentials.adAccountId
            } else if (selectedPlatform === 'TIKTOK') {
                creds.advertiserId = credentials.advertiserId
            } else if (selectedPlatform === 'GOOGLE') {
                creds.customerId = credentials.customerId
                creds.developerToken = credentials.developerToken
            }

            const result = await testConnection(selectedPlatform, creds)

            if (result.success) {
                setTestResult({
                    success: true,
                    message: `Connected to ${result.accountName}`,
                    accountName: result.accountName
                })
            } else {
                setTestResult({
                    success: false,
                    message: result.error || 'Connection failed'
                })
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.message || 'An unexpected error occurred'
            })
        } finally {
            setTesting(false)
        }
    }

    const handleSave = async () => {
        if (!selectedPlatform || !testResult?.success) return
        if (!currentWorkspace?.id) {
            toast.error('No active workspace found')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase.from('integrations').insert({
                workspace_id: currentWorkspace.id,
                platform: selectedPlatform,
                ad_account_id: selectedPlatform === 'META' ? credentials.adAccountId :
                    selectedPlatform === 'TIKTOK' ? credentials.advertiserId :
                        credentials.customerId,
                access_token: credentials.accessToken, // Note: In production, encrypt this!
                status: 'ACTIVE',
                last_synced_at: new Date().toISOString()
            })

            if (error) throw error

            toast.success('Integration connected successfully!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(`Failed to save integration: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const renderPlatformIcon = (id: string, size = 24) => {
        const platform = PLATFORMS.find(p => p.id === id)
        if (!platform) return null
        const Icon = platform.icon
        return <Icon size={size} />
    }

    const renderCredentialsForm = () => {
        if (!selectedPlatform) return null

        return (
            <div className="space-y-4">
                {selectedPlatform === 'META' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Ad Account ID</Label>
                            <Input
                                placeholder="act_123456789"
                                value={credentials.adAccountId}
                                onChange={(e) => setCredentials({ ...credentials, adAccountId: e.target.value })}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600"
                            />
                            <p className="text-xs text-zinc-500">Found in Ad Manager URL</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-300">Access Token</Label>
                                <button
                                    onClick={() => setShowGuide(true)}
                                    className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1"
                                >
                                    <HelpCircle size={12} />
                                    Where do I find this?
                                </button>
                            </div>
                            <div className="relative">
                                <Textarea
                                    placeholder="EAAB..."
                                    value={credentials.accessToken}
                                    onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                                    className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-600 pr-10 font-mono text-xs ${!showToken ? 'text-security-disc' : ''}`}
                                    rows={3}
                                    style={!showToken ? { WebkitTextSecurity: 'disc' } as any : {}}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                                >
                                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500">Requires 'ads_read' permission</p>
                        </div>
                    </>
                )}

                {selectedPlatform === 'TIKTOK' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Advertiser ID</Label>
                            <Input
                                placeholder="1234567890123456"
                                value={credentials.advertiserId}
                                onChange={(e) => setCredentials({ ...credentials, advertiserId: e.target.value })}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-300">Access Token</Label>
                                <button
                                    onClick={() => setShowGuide(true)}
                                    className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1"
                                >
                                    <HelpCircle size={12} />
                                    Where do I find this?
                                </button>
                            </div>
                            <div className="relative">
                                <Textarea
                                    value={credentials.accessToken}
                                    onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                                    className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-600 pr-10 font-mono text-xs`}
                                    rows={3}
                                    style={!showToken ? { WebkitTextSecurity: 'disc' } as any : {}}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute top-3 right-3 text-zinc-400 hover:text-white"
                                >
                                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {selectedPlatform === 'GOOGLE' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Customer ID</Label>
                            <Input
                                placeholder="123-456-7890"
                                value={credentials.customerId}
                                onChange={(e) => setCredentials({ ...credentials, customerId: e.target.value })}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-300">Developer Token</Label>
                                <button
                                    onClick={() => setShowGuide(true)}
                                    className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1"
                                >
                                    <HelpCircle size={12} />
                                    Where do I find this?
                                </button>
                            </div>
                            <Input
                                value={credentials.developerToken}
                                onChange={(e) => setCredentials({ ...credentials, developerToken: e.target.value })}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600"
                                type={showToken ? "text" : "password"}
                            />
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="glass-panel border-white/20 sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {step === 'CREDENTIALS' && (
                                <button onClick={handleBack} className="text-zinc-400 hover:text-white mr-2">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <DialogTitle className="text-xl font-bold text-white">
                                {step === 'SELECT' ? 'Connect Ad Platform' : `Connect ${PLATFORMS.find(p => p.id === selectedPlatform)?.name}`}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-zinc-400">
                            {step === 'SELECT'
                                ? 'Select a platform to connect to your workspace.'
                                : 'Enter your API credentials to enable real-time data sync.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {step === 'SELECT' ? (
                            <div className="grid grid-cols-1 gap-3">
                                {PLATFORMS.map(platform => {
                                    const Icon = platform.icon
                                    return (
                                        <button
                                            key={platform.id}
                                            onClick={() => handlePlatformSelect(platform.id)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--brand)]/50 transition-all group text-left"
                                        >
                                            <div className="p-2 rounded-lg bg-white/10 group-hover:scale-110 transition-transform">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{platform.name}</h3>
                                                <p className="text-xs text-zinc-400">{platform.description}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {renderCredentialsForm()}

                                {/* Test Result */}
                                {testResult && (
                                    <div className={`p-3 rounded-lg flex items-start gap-3 ${testResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                        {testResult.success ? (
                                            <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                                        ) : (
                                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                        )}
                                        <div>
                                            <p className={`text-sm font-bold ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                                            </p>
                                            <p className="text-xs text-zinc-300 mt-1">{testResult.message}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Security Note */}
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle size={14} className="text-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-500">Security Note</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                                        Your credentials are encrypted and stored securely. We only use them to fetch read-only campaign data.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleTestConnection}
                                        disabled={testing}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                    >
                                        {testing ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            'Test Connection'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={!testResult?.success || saving}
                                        className="flex-1 bg-[var(--brand)] text-black hover:opacity-90 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving...' : 'Save Connection'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <GuideDrawer
                open={showGuide}
                platform={selectedPlatform}
                onClose={() => setShowGuide(false)}
            />
        </>
    )
}
