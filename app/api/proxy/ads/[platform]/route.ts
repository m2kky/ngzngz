import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMockCampaignsForPlatform } from '@/lib/integrations/mock-ad-data'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ platform: string }> }
) {
    const params = await props.params;
    try {
        const platform = params.platform.toUpperCase()

        // Validate platform
        if (!['META', 'TIKTOK', 'GOOGLE'].includes(platform)) {
            return NextResponse.json(
                { error: 'Invalid platform' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get integration for this platform
        const { data: integration, error } = await supabase
            .from('integrations')
            .select('*')
            .eq('platform', platform)
            .eq('status', 'ACTIVE')
            .single()

        if (error || !integration) {
            return NextResponse.json(
                { error: 'Platform not connected or inactive' },
                { status: 404 }
            )
        }

        // TODO: Replace mock data with real API calls
        // For now, using mock data structure
        const campaigns = getMockCampaignsForPlatform(platform)

        // Update last_synced_at
        await supabase
            .from('integrations')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', integration.id)

        return NextResponse.json({
            platform,
            campaigns,
            lastSynced: new Date().toISOString(),
            accountInfo: {
                name: integration.ad_account_id,
                currency: 'USD'
            }
        })

    } catch (error: any) {
        console.error('Error fetching ad data:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
