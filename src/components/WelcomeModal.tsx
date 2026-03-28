import React, { useState, useEffect } from 'react';
import { useAnalyticsPreference } from '@/hooks/useAnalyticsPreference';
import { OpenFlowLogo } from './icons/OpenFlowLogo';
import { Switch } from './ui/Switch';
import { Button } from './ui/Button';
import { writeLocalStorageString } from '@/services/storage/uiLocalStorage';
import { shouldShowWelcomeModal, WELCOME_SEEN_STORAGE_KEY } from './home/welcomeModalState';
import { WandSparkles, FileCode2, MonitorPlay, Paintbrush } from 'lucide-react';

export interface WelcomeModalProps {
    onOpenTemplates: () => void;
    onPromptWithAI: () => void;
    onImport: () => void;
    onBlankCanvas: () => void;
}

export function WelcomeModal(_props: WelcomeModalProps): React.JSX.Element | null {
    const [isOpen, setIsOpen] = useState(() => shouldShowWelcomeModal());
    const [analyticsEnabled, setAnalyticsEnabled] = useAnalyticsPreference();

    const dismiss = () => {
        setIsOpen(false);
        writeLocalStorageString(WELCOME_SEEN_STORAGE_KEY, 'true');
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dismiss();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    const features = [
        {
            icon: <Paintbrush className="h-5 w-5 text-blue-500" />,
            title: 'Create amazing diagrams',
            description: 'Design beautiful, enterprise-grade architecture visually.'
        },
        {
            icon: <WandSparkles className="h-5 w-5 text-amber-500" />,
            title: 'Use AI',
            description: 'Generate complete architectures with a single intelligent prompt.'
        },
        {
            icon: <FileCode2 className="h-5 w-5 text-emerald-500" />,
            title: 'Code to diagram',
            description: 'Instantly construct stunning visual infrastructure from text.'
        },
        {
            icon: <MonitorPlay className="h-5 w-5 text-purple-500" />,
            title: 'Export in many formats',
            description: 'Export into beautiful, fully animated presentation diagrams.'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-8 pb-3 pt-10 text-center">
                    <OpenFlowLogo className="mx-auto mb-5 h-12 w-12 text-[var(--brand-primary)]" />
                    <h2 className="text-[24px] font-bold tracking-tight text-slate-900 mb-2">Welcome to OpenFlowKit</h2>
                </div>

                <div className="px-8 py-4">
                    <div className="flex flex-col gap-[22px]">
                        {features.map((f, i) => (
                            <div key={i} className="flex flex-row items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-slate-50 border border-slate-100/80 shadow-sm">
                                    {f.icon}
                                </div>
                                <div className="flex-1 text-left line-clamp-2">
                                    <h3 className="text-[15px] font-semibold text-slate-900 mb-[1px]">{f.title}</h3>
                                    <p className="text-[13px] leading-snug text-slate-500">{f.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 border-t border-slate-100 bg-slate-50/40 px-8 py-6">
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
                        <div className="flex flex-col text-left mr-4">
                            <span className="text-[12px] font-semibold text-slate-700">Anonymous Analytics</span>
                            <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">We collect diagnostic data. We never read your diagrams or prompts.</span>
                        </div>
                        <Switch
                            checked={analyticsEnabled}
                            onCheckedChange={setAnalyticsEnabled}
                            className="scale-90"
                        />
                    </div>
                    <Button
                        size="xl"
                        className="w-full font-semibold shadow-sm"
                        onClick={dismiss}
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
}
