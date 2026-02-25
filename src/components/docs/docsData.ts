export type DocSection = {
    title: string;
    items: DocItem[];
};

export type DocItem = {
    title: string;
    slug: string;
};

export const docsNavigation: DocSection[] = [
    {
        title: 'docs.aiAssistant',
        items: [
            { title: 'docs.askFlowpilot', slug: 'ask-flowpilot' },
        ],
    },
    {
        title: 'docs.gettingStarted',
        items: [
            { title: 'docs.introduction', slug: 'introduction' },
            { title: 'docs.quickStart', slug: 'quick-start' },
        ],
    },
    {
        title: 'docs.coreFeatures',
        items: [
            { title: 'docs.canvasBasics', slug: 'canvas-basics' },
            { title: 'docs.nodeTypes', slug: 'node-types' },
            { title: 'docs.propertiesPanel', slug: 'properties-panel' },
            { title: 'docs.commandCenter', slug: 'command-center' },
        ],
    },
    {
        title: 'docs.advancedTools',
        items: [
            { title: 'docs.aiGeneration', slug: 'ai-generation' },
            { title: 'docs.smartLayouts', slug: 'smart-layout' },
            { title: 'docs.playbackAndHistory', slug: 'playback-history' },
            { title: 'docs.flowMindDSL', slug: 'openflow-dsl' },
        ],
    },
    {
        title: 'docs.guides',
        items: [
            { title: 'docs.mermaidIntegration', slug: 'mermaid-integration' },
            { title: 'docs.exporting', slug: 'exporting' },
            { title: 'docs.keyboardShortcuts', slug: 'keyboard-shortcuts' },
            { title: 'docs.theming', slug: 'theming' },
        ],
    },
    {
        title: 'docs.announcements',
        items: [
            { title: 'docs.v1BetaLaunch', slug: 'v1-beta-launch' },
            { title: 'docs.futureRoadmap', slug: 'roadmap' },
        ],
    },
];
