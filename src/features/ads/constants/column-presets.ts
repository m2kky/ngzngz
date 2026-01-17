export const COLUMN_PRESETS = {
  PERFORMANCE: {
    label: "Performance (Default)",
    columns: ["spend", "results", "cost_per_result", "reach", "impressions", "frequency", "cpm", "ctr", "link_clicks"]
  },
  SETUP: {
    label: "Setup",
    columns: ["name", "status", "objective", "id", "account_name"]
  },
  ENGAGEMENT: {
    label: "Engagement",
    columns: ["post_reactions", "post_comments", "post_shares", "link_clicks", "ctr", "cpc"]
  },
  VIDEO: {
    label: "Video Engagement",
    columns: ["video_plays", "video_p25", "video_p50", "video_p100", "video_avg_time", "spend"]
  },
  CUSTOM: {
    label: "Custom",
    columns: [] // Placeholder, will be filled by user selection
  }
};

export const AVAILABLE_METRICS = [
  // Performance
  { id: 'spend', label: 'Amount Spent' },
  { id: 'results', label: 'Results' },
  { id: 'cost_per_result', label: 'Cost per Result' },
  { id: 'reach', label: 'Reach' },
  { id: 'impressions', label: 'Impressions' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'cpm', label: 'CPM' },
  { id: 'cpc', label: 'CPC' },
  { id: 'ctr', label: 'CTR' },
  { id: 'clicks', label: 'Clicks (All)' },
  { id: 'link_clicks', label: 'Link Clicks' },

  // Engagement
  { id: 'post_reactions', label: 'Post Reactions' },
  { id: 'post_comments', label: 'Post Comments' },
  { id: 'post_shares', label: 'Post Shares' },

  // Video
  { id: 'video_plays', label: 'Video Plays' },
  { id: 'video_p25', label: 'Video Plays at 25%' },
  { id: 'video_p50', label: 'Video Plays at 50%' },
  { id: 'video_p100', label: 'Video Plays at 100%' },
  { id: 'video_avg_time', label: 'Avg Watch Time' },
];
