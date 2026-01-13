export interface GuideStep {
    title: string
    text: string
    image?: string
}

export interface PlatformGuide {
    title: string
    description: string
    steps: GuideStep[]
    links: { label: string; url: string }[]
}

export const PLATFORM_GUIDES: Record<string, PlatformGuide> = {
    META: {
        title: "How to connect Meta Ads",
        description: "Follow these steps to generate your Access Token and find your Ad Account ID.",
        steps: [
            {
                title: "Create System User",
                text: "Go to Meta Business Settings -> Users -> System Users. Click 'Add' to create a new system user. Give it a name like 'Ninja Gen Z Integration' and select 'Admin' role.",
                image: "/assets/guides/meta-step1.png"
            },
            {
                title: "Generate Token",
                text: "Click 'Generate New Token'. Select your App (if applicable) and ensure you check the 'ads_read' permission. This is crucial for fetching campaign data.",
                image: "/assets/guides/meta-step2.png"
            },
            {
                title: "Copy Ad Account ID",
                text: "Go to Ad Accounts in Business Settings. Click on your ad account. The ID is shown at the top (starts with 'act_'). Copy only the numbers.",
                image: "/assets/guides/meta-step3.png"
            }
        ],
        links: [
            { label: "Open Meta Business Settings", url: "https://business.facebook.com/settings" },
            { label: "Meta Marketing API Docs", url: "https://developers.facebook.com/docs/marketing-api/get-started" }
        ]
    },
    TIKTOK: {
        title: "How to connect TikTok Ads",
        description: "Get your Access Token and Advertiser ID from TikTok Ads Manager.",
        steps: [
            {
                title: "Access Developer Settings",
                text: "Log in to TikTok Ads Manager. Go to Tools -> Events -> Web Events (or directly to User Settings if you have a developer account).",
                image: "/assets/guides/tiktok-step1.png"
            },
            {
                title: "Generate Access Token",
                text: "Navigate to the 'Access Token' section. Click 'Generate' to create a long-lived access token for the API.",
                image: "/assets/guides/tiktok-step2.png"
            },
            {
                title: "Find Advertiser ID",
                text: "Your Advertiser ID is displayed in the top right corner of the dashboard under your account name, or in the URL (e.g., aadvid=123456789).",
                image: "/assets/guides/tiktok-step3.png"
            }
        ],
        links: [
            { label: "Open TikTok Ads Manager", url: "https://ads.tiktok.com" },
            { label: "TikTok API Docs", url: "https://ads.tiktok.com/marketing_api/docs" }
        ]
    },
    GOOGLE: {
        title: "How to connect Google Ads",
        description: "Obtain your Developer Token and Customer ID.",
        steps: [
            {
                title: "Get Developer Token",
                text: "Go to Google Ads Manager -> Tools & Settings -> Setup -> API Center. You will find your Developer Token there.",
                image: "/assets/guides/google-step1.png"
            },
            {
                title: "Find Customer ID",
                text: "Your Customer ID is the 10-digit number (XXX-XXX-XXXX) shown in the top right corner of your Google Ads account.",
                image: "/assets/guides/google-step2.png"
            }
        ],
        links: [
            { label: "Open Google Ads", url: "https://ads.google.com" },
            { label: "Google Ads API Center", url: "https://developers.google.com/google-ads/api/docs/first-call/overview" }
        ]
    }
}
