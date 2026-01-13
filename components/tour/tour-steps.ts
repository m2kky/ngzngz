import { Step } from 'react-joyride';

export interface ExtendedStep extends Step {
    route?: string;
}

export const ownerSteps: ExtendedStep[] = [
    {
        target: '[data-tour="dashboard-xp"]',
        content: 'Track your level, XP, quests, and weekly rank. Compete with your squad!',
        title: 'Dashboard XP',
        disableBeacon: true,
        route: '/dashboard',
    },
    {
        target: '[data-tour="dojo"]',
        content: 'Welcome to The Dojo. Here you can see your badges, achievements, and the global leaderboard.',
        title: 'The Dojo',
        route: '/dojo',
    },
    {
        target: '[data-tour="content-studio"]',
        content: 'Manage your content pipeline. Switch between Kanban, Gallery, and List views to visualize your workflow.',
        title: 'Content Studio',
        route: '/content',
    },
    {
        target: '[data-tour="ad-center"]',
        content: 'Connect Meta, TikTok, and Google Ads to track ROAS and performance in one unified dashboard.',
        title: 'Ad Center',
        route: '/ads',
    },
    {
        target: '[data-tour="meeting-dojo"]',
        content: 'Record meetings, transcribe them, and instantly turn notes into actionable tasks.',
        title: 'Meeting Dojo',
        route: '/meetings',
    },
    {
        target: '[data-tour="brand-kit"]',
        content: 'Maintain brand consistency. Upload logos, define color palettes, and set typography for your clients.',
        title: 'Brand Kit',
        route: '/brand',
    },
    {
        target: '[data-tour="strategy-hub"]',
        content: 'Generate comprehensive marketing strategies using AI. From personas to go-to-market plans.',
        title: 'Strategy Hub',
        route: '/strategy',
    },
    {
        target: '[data-tour="squad"]',
        content: 'Manage your team. Assign roles, invite new ninjas, and track squad performance.',
        title: 'Squad Management',
        route: '/squad',
    },
    {
        target: '[data-tour="projects"]',
        content: 'Organize work into Projects. Track progress, milestones, and deliverables.',
        title: 'Projects',
        route: '/projects',
    },
    {
        target: '[data-tour="client-portal"]',
        content: 'Share progress with clients via a dedicated, transparent portal.',
        title: 'Client Portal',
        route: '/client-portal',
    },
    {
        target: '[data-tour="command-center"]',
        content: 'Press Cmd+K anytime to open the Command Center. Search, create, and navigate instantly.',
        title: 'Command Center',
        route: '/dashboard', // Back to dashboard or stay
    },
    {
        target: 'body',
        content: 'Congrats Ninja 🎉 You completed the Grand Tour! (+100 XP)',
        title: 'Tour Completed',
        placement: 'center',
        route: '/dashboard',
    },
];

export const memberSteps: ExtendedStep[] = [
    {
        target: '[data-tour="dashboard-xp"]',
        content: 'Track your personal progress, XP, and current quests.',
        title: 'Dashboard XP',
        disableBeacon: true,
        route: '/dashboard',
    },
    {
        target: '[data-tour="content-studio"]',
        content: 'View your assigned content tasks and collaborate with your team.',
        title: 'Content Studio',
        route: '/content',
    },
    {
        target: '[data-tour="meeting-dojo"]',
        content: 'Join meetings, view transcripts, and complete assigned action items.',
        title: 'Meetings',
        route: '/meetings',
    },
    {
        target: '[data-tour="squad"]',
        content: 'See who is in your squad and their online status.',
        title: 'Squad Team',
        route: '/squad',
    },
    {
        target: '[data-tour="command-center"]',
        content: 'Use Cmd+K to quickly find tasks or navigate the app.',
        title: 'Command Center',
        route: '/dashboard',
    },
    {
        target: 'body',
        content: 'You are ready to start your mission! (+50 XP)',
        title: 'Ready to Launch',
        placement: 'center',
        route: '/dashboard',
    },
];
