
export interface MetaCredentials {
  access_token: string;
  ad_account_ids: string[]; // Changed to array
  ad_account_names?: Record<string, string>; // Optional map of ID -> Name
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  account_id?: string; // Add account_id to track origin
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
  account_id: string; // Add account_id
  account_name?: string; // Add account_name
  currency: string; // Add currency
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
  const { access_token, ad_account_ids, ad_account_names } = credentials;
  
  if (!access_token || !ad_account_ids || ad_account_ids.length === 0) {
    throw new Error("Missing Meta credentials or no accounts selected");
  }

  // We need to fetch account details first to get the currency
  const accountFields = 'currency';
  const campaignFields = [
    'id', 'name', 'status', 'objective',
    'insights.date_preset(maximum){spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,inline_link_clicks,actions,cost_per_action_type}'
  ].join(',');

  try {
    // Fetch from all accounts in parallel
    const promises = ad_account_ids.map(async (id) => {
      const accountId = id.startsWith('act_') ? id : `act_${id}`;
      
      // 1. Fetch Account Currency
      const accountUrl = `https://graph.facebook.com/v19.0/${accountId}?fields=${accountFields}&access_token=${access_token}`;
      const accountRes = await fetch(accountUrl);
      const accountData = await accountRes.json();
      
      if (accountData.error) {
        console.error(`Error fetching account details ${id}:`, accountData.error);
        return [];
      }
      
      const currency = accountData.currency || 'USD';

      // 2. Fetch Campaigns
      const url = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=${campaignFields}&access_token=${access_token}&limit=100`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.error(`Error fetching campaigns for account ${id}:`, data.error);
        return []; // Skip failed accounts but don't crash everything
      }

      return (data.data || []).map((campaign: MetaCampaign) => {
        const insights = campaign.insights?.data?.[0] || {};
        const actions = insights.actions || [];
        
        const { value: resultValue, type: resultType } = getResult(campaign.objective, actions, insights);
        
        const spend = Number(insights.spend || 0);
        const costPerResult = resultValue > 0 ? spend / resultValue : 0;

        // Clean ID for lookup (remove 'act_' if present in map key)
        const cleanId = id.replace('act_', '');
        const accountName = ad_account_names?.[cleanId] || ad_account_names?.[id] || id;

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          account_id: id,
          account_name: accountName,
          currency: currency,
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
    });

    const results = await Promise.all(promises);
    return results.flat(); // Merge all campaigns

  } catch (error) {
    console.error("Meta API Error:", error);
    throw error;
  }
}

export async function fetchAdAccounts(accessToken: string) {
  const url = `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,id,account_status&access_token=${accessToken}&limit=100`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.error) throw new Error(data.error.message);
  return data.data || [];
}
