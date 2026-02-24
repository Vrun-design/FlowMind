import React, { useState } from 'react';
import { X, Settings, Keyboard, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { GeneralSettings } from './GeneralSettings';
import { ShortcutsSettings } from './ShortcutsSettings';
import { AISettings } from './AISettings';
import { useFlowStore } from '../../store';
import { SidebarItem } from '../ui/SidebarItem';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'general' | 'shortcuts' | 'ai';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab = 'general' }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'general' | 'shortcuts' | 'ai'>(initialTab);

    // Update active tab if initialTab changes when opening
    React.useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);
    const { brandConfig } = useFlowStore();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-6">
            <div
                className="bg-white/95 backdrop-blur-xl w-full max-w-3xl max-h-full md:h-[80vh] rounded-[calc(var(--brand-radius)*1.5)] shadow-2xl border border-white/20 ring-1 ring-black/5 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200/60 p-2 md:p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible items-center md:items-stretch custom-scrollbar shrink-0">
                    <h2 className="hidden md:block px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('settingsModal.settings')}</h2>

                    <SidebarItem
                        icon={<Settings className="w-4 h-4" />}
                        isActive={activeTab === 'general'}
                        onClick={() => setActiveTab('general')}
                        className="whitespace-nowrap w-auto md:w-full px-4 md:px-3 py-2 md:py-2.5 flex-none"
                    >
                        {t('settingsModal.general')}
                    </SidebarItem>

                    <SidebarItem
                        icon={<Sparkles className="w-4 h-4" />}
                        isActive={activeTab === 'ai'}
                        onClick={() => setActiveTab('ai')}
                        className="whitespace-nowrap w-auto md:w-full px-4 md:px-3 py-2 md:py-2.5 flex-none"
                    >
                        {t('settingsModal.flowpilotAI')}
                    </SidebarItem>

                    <SidebarItem
                        icon={<Keyboard className="w-4 h-4" />}
                        isActive={activeTab === 'shortcuts'}
                        onClick={() => setActiveTab('shortcuts')}
                        className="whitespace-nowrap w-auto md:w-full px-4 md:px-3 py-2 md:py-2.5 flex-none"
                    >
                        {t('settingsModal.shortcuts')}
                    </SidebarItem>

                    <div className="hidden md:block mt-auto px-4 py-4 border-t border-slate-100">
                        <div className="text-xs text-slate-400">
                            {t('settingsModal.running', { appName: brandConfig.appName })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white/50">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {{
                                general: t('settingsModal.generalSettings'),
                                ai: t('settingsModal.flowpilotConfigurations'),
                                shortcuts: t('settingsModal.keyboardShortcuts'),
                            }[activeTab]}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6">
                            {activeTab === 'general' && <GeneralSettings />}
                            {activeTab === 'ai' && <AISettings />}
                            {activeTab === 'shortcuts' && <ShortcutsSettings />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>,
        document.body
    );
};
