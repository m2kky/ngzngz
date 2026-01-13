// Integration types for database.ts
// Add these to the Tables section of Database interface

export interface IntegrationRow {
    id: string
    workspace_id: string
    platform: 'META' | 'TIKTOK' | 'GOOGLE'
    access_token: string
    ad_account_id: string
    status: 'ACTIVE' | 'ERROR' | 'DISCONNECTED'
    last_synced_at: string | null
    error_message: string | null
    created_at: string
    updated_at: string
}

export interface CampaignData {
    id: string
    name: string
    platform: 'META' | 'TIKTOK' | 'GOOGLE'
    status: string
    metrics: {
        spend: number
        impressions: number
        clicks: number
        cpc: number
        ctr: number
        cpm?: number
        roas?: number
        purchases?: number
        revenue?: number
        conversions?: number
        conversionRate?: number
    }
}
