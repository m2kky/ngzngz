
export interface MetaCredentials {
  access_token: string;
  ad_account_id: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  insights?: {
    data: Array<{
      spend: string;
      impressions: string;
      clicks: string;
      reach: string;
      frequency: string;
      cpc: string;
      cpm: string;
      ctr: string;
      inline_link_clicks: string;
      actions?: Array<{ action_type: string; value: string }>;
      cost_per_action_type?: Array<{ action_type: string; value: string }>;
    }>;
  };
}

export interface NormalizedCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  frequency: number;
  cpc: number;
  cpm: number;
  ctr: number;
  results: number;
  cost_per_result: number;
  result_type: string; // 'Lead', 'Traffic', 'Awareness', etc.
  raw: any; // For extra metrics if needed
}

function getResult(objective: string, actions: any[] = [], insights: any) {
  const obj = (objective || '').toUpperCase();
  
  // Helper to find action value
  const getActionCount = (type: string) => {
    const action = actions.find(a => a.action_type === type);
    return action ? Number(action.value) : 0;
  };

  // Map actions based on objective
  if (obj.includes('LEAD')) return { value: getActionCount('lead'), type: 'Leads' };
  if (obj.includes('MESSAGE')) return { value: getActionCount('messaging_conversation_started_7d'), type: 'Messages' }; // Meta often uses this key
  if (obj.includes('TRAFFIC') || obj.includes('LINK_CLICK')) return { value: Number(insights.inline_link_clicks || 0), type: 'Link Clicks' };
  if (obj.includes('AWARENESS')) return { value: Number(insights.reach || 0), type: 'Reach' };
  if (obj.includes('ENGAGEMENT')) return { value: getActionCount('post_engagement'), type: 'Engagement' };
  if (obj.includes('SALES') || obj.includes('PURCHASE')) return { value: getActionCount('purchase'), type: 'Purchases' };

  return { value: Number(insights.inline_link_clicks || 0), type: 'Link Clicks' }; // Fallback
}

export async function fetchMetaCampaigns(credentials: MetaCredentials): Promise<NormalizedCampaign[]> {
  const { access_token, ad_account_id } = credentials;
  
  if (!access_token || !ad_account_id) {
    throw new Error("Missing Meta credentials");
  }

  // Ensure ad_account_id starts with 'act_'
  const accountId = ad_account_id.startsWith('act_') ? ad_account_id : `act_${ad_account_id}`;

  const fields = [
    'id', 'name', 'status', 'objective',
    'insights.date_preset(maximum){spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,inline_link_clicks,actions,cost_per_action_type}'
  ].join(',');

  const url = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=${fields}&access_token=${access_token}&limit=100`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return (data.data || []).map((campaign: MetaCampaign) => {
      const insights = campaign.insights?.data?.[0] || {};
      const actions = insights.actions || [];
      
      const { value: resultValue, type: resultType } = getResult(campaign.objective, actions, insights);
      
      const spend = Number(insights.spend || 0);
      const costPerResult = resultValue > 0 ? spend / resultValue : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        spend: spend,
        impressions: Number(insights.impressions || 0),
        clicks: Number(insights.clicks || 0),
        reach: Number(insights.reach || 0),
        frequency: Number(insights.frequency || 0),
        cpc: Number(insights.cpc || 0),
        cpm: Number(insights.cpm || 0),
        ctr: Number(insights.ctr || 0),
        results: resultValue,
        cost_per_result: costPerResult,
        result_type: resultType,
        raw: insights
      };
    });

  } catch (error) {
    console.error("Meta API Error:", error);
    throw error;
  }
}
