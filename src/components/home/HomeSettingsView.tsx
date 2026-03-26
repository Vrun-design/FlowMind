import React from 'react';
import { FLOWPILOT_NAME } from '@/lib/brand';
import { useTranslation } from 'react-i18next';
import { AISettings } from '../SettingsModal/AISettings';
import { GeneralSettings } from '../SettingsModal/GeneralSettings';

import { ShortcutsSettings } from '../SettingsModal/ShortcutsSettings';
import { SidebarItem } from '../ui/SidebarItem';

interface HomeSettingsViewProps {
    activeSettingsTab: 'general' | 'shortcuts' | 'ai';
    onSettingsTabChange: (tab: 'general' | 'shortcuts' | 'ai') => void;
}

export function HomeSettingsView({
    activeSettingsTab,
    onSettingsTabChange,
}: HomeSettingsViewProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-1 flex-col overflow-hidden animate-in fade-in duration-300">
            <header className="border-b border-slate-100 bg-[var(--brand-surface)] px-4 py-4 sm:px-6 md:px-8 md:py-6">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('settings.title', 'Settings')}</h1>
            </header>

            <div className="flex min-h-0 flex-1 flex-col bg-[var(--brand-surface)] md:flex-row">
                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-2 md:w-48 md:block md:space-y-1 md:overflow-y-auto md:border-b-0 md:border-r">
                    <SidebarItem
                        isActive={activeSettingsTab === 'general'}
                        onClick={() => onSettingsTabChange('general')}
                        className="min-w-fit md:min-w-0"
                    >
                        {t('settings.general', 'General')}
                    </SidebarItem>
                    <SidebarItem
                        isActive={activeSettingsTab === 'ai'}
                        onClick={() => onSettingsTabChange('ai')}
                        className="min-w-fit md:min-w-0"
                    >
                        {t('settings.ai', FLOWPILOT_NAME)}
                    </SidebarItem>
                    <SidebarItem
                        isActive={activeSettingsTab === 'shortcuts'}
                        onClick={() => onSettingsTabChange('shortcuts')}
                        className="min-w-fit md:min-w-0"
                    >
                        {t('settings.shortcuts', 'Shortcuts')}
                    </SidebarItem>

                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-2xl">
                        {activeSettingsTab === 'general' && <GeneralSettings />}
                        {activeSettingsTab === 'ai' && <AISettings />}
                        {activeSettingsTab === 'shortcuts' && <ShortcutsSettings />}

                    </div>
                </div>
            </div>
        </div>
    );
}
