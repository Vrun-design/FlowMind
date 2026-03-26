import React, { Suspense, lazy } from 'react';
import type { FlowTab } from '@/lib/types';
import { FlowTabs } from './FlowTabs';
import { TopNavMenu } from './top-nav/TopNavMenu';
import { TopNavBrand } from './top-nav/TopNavBrand';
import { TopNavActions } from './top-nav/TopNavActions';
import { useTopNavState } from './top-nav/useTopNavState';
import { APP_NAME, IS_BEVELED } from '@/lib/brand';

const LazySettingsModal = lazy(async () => {
    const module = await import('./SettingsModal/SettingsModal');
    return { default: module.SettingsModal };
});

interface TopNavProps {
    tabs: FlowTab[];
    activeTabId: string;
    onSwitchTab: (tabId: string) => void;
    onAddTab: () => void;
    onCloseTab: (tabId: string) => void;
    onRenameTab: (tabId: string, newName: string) => void;

    // Actions
    onExportPNG: (format?: 'png' | 'jpeg') => void;
    onExportSVG: () => void;
    onExportPDF: () => void;
    onExportAnimated: (format: 'video' | 'gif') => void;
    onExportReveal: (format: 'reveal-video' | 'reveal-gif') => void;
    onExportJSON: () => void;
    onExportMermaid: () => void;
    onExportPlantUML: () => void;
    onExportOpenFlowDSL: () => void;
    onExportFigma: () => void;
    onShare: () => void;
    onImportJSON: () => void;
    onHistory: () => void;
    onGoHome: () => void;
    onPlay: () => void;
    collaboration?: {
        roomId: string;
        inviteUrl: string;
        viewerCount: number;
        status: 'realtime' | 'waiting' | 'fallback';
        cacheState: 'unavailable' | 'syncing' | 'ready' | 'hydrated';
        participants: Array<{
            clientId: string;
            name: string;
            color: string;
            isLocal: boolean;
        }>;
        onCopyShareLink: () => void;
    };
}

export function TopNav({
    tabs,
    activeTabId,
    onSwitchTab,
    onAddTab,
    onCloseTab,
    onRenameTab,
    onExportPNG,
    onExportSVG,
    onExportPDF,
    onExportAnimated,
    onExportReveal,
    onExportJSON,
    onExportMermaid,
    onExportPlantUML,
    onExportOpenFlowDSL,
    onExportFigma,
    onShare,
    onImportJSON,
    onHistory,
    onGoHome,
    onPlay,
    collaboration,
}: TopNavProps): React.ReactElement {
    const isBeveled = IS_BEVELED;
    const {
        isMenuOpen,
        isSettingsOpen,
        activeSettingsTab,
        toggleMenu,
        closeMenu,
        openSettings,
        closeSettings,
    } = useTopNavState();

    return (
        <div className="absolute top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/20 bg-white/70 px-3 shadow-sm backdrop-blur-md transition-all sm:px-4">
            {/* Left: Menu & Brand */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <TopNavMenu
                    isOpen={isMenuOpen}
                    isBeveled={isBeveled}
                    onToggle={toggleMenu}
                    onClose={closeMenu}
                    onGoHome={onGoHome}
                    onOpenSettings={() => openSettings('general')}
                    onHistory={onHistory}
                    onImportJSON={onImportJSON}
                />
                <TopNavBrand
                    appName={APP_NAME}
                    logoUrl={null}
                    logoStyle="text"
                    ui={{ showBeta: true }}
                />
            </div>

            {/* Center: Tabs */}
            <div className="flex min-w-0 flex-[1.2] justify-center px-2 sm:px-3">
                <FlowTabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSwitchTab={onSwitchTab}
                    onAddTab={onAddTab}
                    onCloseTab={onCloseTab}
                    onRenameTab={onRenameTab}
                />
            </div>

            <div className="flex min-w-0 flex-1 justify-end">
                <TopNavActions
                    onPlay={onPlay}
                    onExportPNG={onExportPNG}
                    onExportSVG={onExportSVG}
                    onExportPDF={onExportPDF}
                    onExportAnimated={onExportAnimated}
                    onExportReveal={onExportReveal}
                    onExportJSON={onExportJSON}
                    onExportMermaid={onExportMermaid}
                    onExportPlantUML={onExportPlantUML}
                    onExportOpenFlowDSL={onExportOpenFlowDSL}
                    onExportFigma={onExportFigma}
                    onShare={onShare}
                    collaboration={collaboration}
                    isBeveled={isBeveled}
                />
            </div>

            {isSettingsOpen ? (
                <Suspense fallback={null}>
                    <LazySettingsModal
                        isOpen={isSettingsOpen}
                        onClose={closeSettings}
                        initialTab={activeSettingsTab}
                    />
                </Suspense>
            ) : null}
        </div>
    );
}
