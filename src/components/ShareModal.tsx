import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X, Copy, Check, Link2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCopyInvite: () => void;
    roomId: string;
    status: 'realtime' | 'waiting' | 'fallback';
    viewerCount: number;
}

function getStatusLabel(status: ShareModalProps['status'], t: ReturnType<typeof useTranslation>['t']): string {
    switch (status) {
        case 'realtime':
            return t('share.status.realtime', { defaultValue: 'Live sync' });
        case 'waiting':
            return t('share.status.waiting', { defaultValue: 'Connecting' });
        default:
            return t('share.status.fallback', { defaultValue: 'Local room' });
    }
}

export function ShareModal({
    isOpen,
    onClose,
    onCopyInvite,
    roomId,
    status,
    viewerCount,
}: ShareModalProps): React.JSX.Element | null {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const brandRadius = 'var(--brand-radius, 24px)';
    const primaryColor = 'var(--brand-primary, #6366f1)';
    const primary50Color = 'var(--brand-primary-50, #eef2ff)';

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        closeButtonRef.current?.focus();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    function handleCopyLink(): void {
        onCopyInvite();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
                data-testid="share-panel"
                className="w-full max-w-md overflow-hidden border border-slate-200/70 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
                style={{ borderRadius: brandRadius }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative p-6">
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 active:scale-95"
                        aria-label={t('share.close', { defaultValue: 'Close' })}
                    >
                        <X size={18} />
                    </button>

                    <div className="mb-6 flex flex-col items-center text-center">
                        <div
                            className="mb-4 flex h-12 w-12 items-center justify-center ring-8"
                            style={{
                                background: primary50Color,
                                color: primaryColor,
                                borderRadius: `calc(${brandRadius} * 0.75)`,
                                '--tw-ring-color': primary50Color,
                            } as React.CSSProperties}
                        >
                            <Share2 className="h-6 w-6" />
                        </div>

                        <h2 id="share-modal-title" className="text-xl font-bold tracking-tight text-slate-900">
                            {t('share.title', { defaultValue: 'Share design' })}
                        </h2>
                        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-slate-500">
                            {t('share.description', { defaultValue: 'Copy a lightweight room link to collaborate on this canvas in real time.' })}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <Users className="h-3.5 w-3.5" />
                                {viewerCount === 1
                                    ? t('share.viewerCount.one', { defaultValue: '1 viewer in this room' })
                                    : t('share.viewerCount.many', { defaultValue: '{{count}} viewers in this room', count: viewerCount })}
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <Link2 className="h-3.5 w-3.5" />
                                {getStatusLabel(status, t)}
                            </div>
                        </div>

                        <div className="rounded-[calc(var(--brand-radius,24px)*0.5)] border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                {t('share.roomId', { defaultValue: 'Room ID' })}
                            </div>
                            <div className="mt-2 break-all font-mono text-sm text-slate-700">{roomId}</div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCopyLink}
                            className={`w-full py-2.5 text-sm font-semibold transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                            icon={copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            style={copied ? {} : { background: primaryColor, borderRadius: `calc(${brandRadius} * 0.6)` }}
                        >
                            {copied ? t('share.copied', { defaultValue: 'Copied link' }) : t('share.copyLink', { defaultValue: 'Copy Link' })}
                        </Button>

                        <p className="text-center text-xs text-slate-400">
                            {t('share.localOnlyNote', { defaultValue: 'All your diagram data stays local in the browser unless you export it.' })}
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="absolute inset-0 -z-10"
                onClick={onClose}
                aria-label={t('share.closeDialog', { defaultValue: 'Close share dialog' })}
            />
        </div>,
        document.body
    );
}
