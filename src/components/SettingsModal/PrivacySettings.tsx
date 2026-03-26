import React from 'react';
import { Shield, Lock, Database, UserX, MessageSquare, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PrivacySettings = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Mission Statement */}
            <div className="space-y-4">
                <div className="rounded-[var(--radius-xl)] border border-[var(--brand-primary)]/10 bg-[var(--brand-primary)]/5 p-4">
                    <h3 className="flex items-center gap-2 font-bold text-[var(--brand-primary)] mb-3 text-sm uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        {t('settingsModal.privacy.manifesto')}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        {t('settingsModal.privacy.manifestoText')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Feature icon={<Lock className="w-3.5 h-3.5" />} text={t('settingsModal.privacy.localFirst')} />
                        <Feature icon={<UserX className="w-3.5 h-3.5" />} text={t('settingsModal.privacy.noAccounts')} />
                        <Feature icon={<Database className="w-3.5 h-3.5" />} text={t('settingsModal.privacy.ownData')} />
                        <Feature icon={<Fingerprint className="w-3.5 h-3.5" />} text={t('settingsModal.privacy.anonymous')} />
                    </div>
                </div>
            </div>

            {/* Feedback Call to Action */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">{t('settingsModal.privacy.helpImprove')}</h3>
                </div>
                <div className="grid grid-cols-1">
                    <a
                        href="https://forms.gle/hhS4FErGANEZm6oz8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-slate-200 bg-white p-6 text-center transition-all hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                    >
                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-white rounded-full flex items-center justify-center mb-3 text-slate-500 group-hover:text-[var(--brand-primary)] transition-colors">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-[var(--brand-primary)] text-sm mb-1">{t('settingsModal.privacy.shareFeedback')}</span>
                        <span className="text-xs text-slate-500">{t('settingsModal.privacy.shareFeedbackDesc')}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

const Feature = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--brand-primary)]/5 bg-white/50 p-2 text-xs font-medium text-slate-600">
        <div className="text-[var(--brand-primary)]">{icon}</div>
        {text}
    </div>
);
