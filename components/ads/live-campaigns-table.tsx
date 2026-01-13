"use client"

import { CampaignData } from "@/types/integrations"
import { MetaIcon, TikTokIcon, GoogleAdsIcon } from "@/components/integrations/platform-icons"

interface LiveCampaignsTableProps {
    campaigns: CampaignData[]
    selectedMetrics: string[]
}

export function LiveCampaignsTable({ campaigns, selectedMetrics }: LiveCampaignsTableProps) {
    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'META': return <MetaIcon size={20} />
            case 'TIKTOK': return <TikTokIcon size={20} />
            case 'GOOGLE': return <GoogleAdsIcon size={20} />
            default: return null
        }
    }

    const formatMetric = (metric: string, value: any) => {
        if (value === undefined || value === null) return '-'

        switch (metric) {
            case 'spend':
            case 'revenue':
            case 'cpc':
            case 'cpm':
                return `$${value.toFixed(2)}`
            case 'ctr':
            case 'conversionRate':
                return `${value.toFixed(2)}%`
            case 'roas':
                return value.toFixed(2) + 'x'
            case 'impressions':
            case 'clicks':
            case 'purchases':
            case 'conversions':
                return value.toLocaleString()
            default:
                return value
        }
    }

    const getCellStyle = (metric: string, value: any) => {
        if (metric === 'roas' && value !== undefined && value !== null) {
            if (value >= 2.0) {
                return 'bg-green-500/20 text-green-400 font-bold'
            } else if (value < 0.5) {
                return 'bg-red-500/20 text-red-400 font-bold'
            }
        }
        if (metric === 'ctr' && value !== undefined && value !== null && value > 3) {
            return 'text-green-400 font-semibold'
        }
        return ''
    }

    if (campaigns.length === 0) {
        return (
            <div className="glass-panel p-12 rounded-2xl text-center">
                <p className="text-zinc-400">No campaigns found. Connect a platform to view live data.</p>
            </div>
        )
    }

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-sm font-bold text-zinc-400 uppercase">Platform</th>
                            <th className="text-left p-4 text-sm font-bold text-zinc-400 uppercase">Campaign</th>
                            {selectedMetrics.map(metric => (
                                <th key={metric} className="text-right p-4 text-sm font-bold text-zinc-400 uppercase">
                                    {metric}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map(campaign => (
                            <tr
                                key={campaign.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4">
                                    {getPlatformIcon(campaign.platform)}
                                </td>
                                <td className="p-4">
                                    <div className="text-white font-medium">{campaign.name}</div>
                                    <div className="text-xs text-zinc-500">{campaign.status}</div>
                                </td>
                                {selectedMetrics.map(metric => {
                                    const value = (campaign.metrics as any)[metric]
                                    return (
                                        <td
                                            key={metric}
                                            className={`p-4 text-right text-white ${getCellStyle(metric, value)}`}
                                        >
                                            {formatMetric(metric, value)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
