// Mock Ad Data for Testing
import { CampaignData } from "@/types/integrations"

export const MOCK_META_CAMPAIGNS: CampaignData[] = [
    {
        id: 'meta_123',
        name: 'Summer Sale Campaign',
        platform: 'META',
        status: 'active',
        metrics: {
            spend: 1250.00,
            impressions: 125000,
            clicks: 3500,
            cpc: 0.36,
            ctr: 2.8,
            cpm: 10.00,
            roas: 3.2,
            purchases: 145,
            revenue: 4000.00,
            conversions: 145,
            conversionRate: 4.14
        }
    },
    {
        id: 'meta_456',
        name: 'Brand Awareness Q4',
        platform: 'META',
        status: 'active',
        metrics: {
            spend: 850.00,
            impressions: 95000,
            clicks: 1900,
            cpc: 0.45,
            ctr: 2.0,
            cpm: 8.95,
            roas: 0.8,
            purchases: 42,
            revenue: 680.00,
            conversions: 42,
            conversionRate: 2.21
        }
    }
]

export const MOCK_TIKTOK_CAMPAIGNS: CampaignData[] = [
    {
        id: 'tiktok_789',
        name: 'Product Launch TikTok',
        platform: 'TIKTOK',
        status: 'active',
        metrics: {
            spend: 2100.00,
            impressions: 450000,
            clicks: 9000,
            cpc: 0.23,
            ctr: 2.0,
            cpm: 4.67,
            roas: 4.5,
            purchases: 380,
            revenue: 9450.00,
            conversions: 380,
            conversionRate: 4.22
        }
    }
]

export const MOCK_GOOGLE_CAMPAIGNS: CampaignData[] = [
    {
        id: 'google_321',
        name: 'Search - Brand Keywords',
        platform: 'GOOGLE',
        status: 'active',
        metrics: {
            spend: 1800.00,
            impressions: 82000,
            clicks: 4100,
            cpc: 0.44,
            ctr: 5.0,
            cpm: 21.95,
            roas: 2.1,
            purchases: 185,
            revenue: 3780.00,
            conversions: 185,
            conversionRate: 4.51
        }
    }
]

export function getMockCampaignsForPlatform(platform: string): CampaignData[] {
    switch (platform.toUpperCase()) {
        case 'META':
            return MOCK_META_CAMPAIGNS
        case 'TIKTOK':
            return MOCK_TIKTOK_CAMPAIGNS
        case 'GOOGLE':
            return MOCK_GOOGLE_CAMPAIGNS
        default:
            return []
    }
}
