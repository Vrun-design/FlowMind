import React, { useState } from 'react';
import { useFlowStore, AIProvider, AISettingsStorageMode } from '../../store';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { ExternalLink, Check, Shield, Lock, AlertCircle, Info } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import {
    BYOK_KEYS,
    PROVIDER_MODELS,
    PROVIDERS,
    PROVIDER_RISK,
    ProviderMeta,
} from '@/config/aiProviders';
import { getAIReadinessState } from '@/hooks/ai-generation/readiness';
import { buildDocsSiteUrl } from '@/docs/docsRoutes';

// Helper for logo with fallback
function ProviderIcon({ p, isSelected }: { p: ProviderMeta; isSelected: boolean }): React.ReactElement {
    const [imgError, setImgError] = useState(false);

    if (imgError) {
        return <span className="text-2xl" style={{ color: isSelected ? 'var(--brand-primary)' : undefined }}>{p.icon}</span>;
    }

    if (isSelected) {
        return (
            <div
                className="w-8 h-8 bg-[var(--brand-primary)]"
                style={{
                    maskImage: `url(${p.logoPath})`,
                    WebkitMaskImage: `url(${p.logoPath})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                }}
            />
        );
    }

    return (
        <img
            src={p.logoPath}
            alt={p.name}
            className="w-8 h-8 object-contain"
            onError={() => setImgError(true)}
        />
    );
}

// --- Step helper for API key guide ---
function Step({ n, text }: { n: number; text: string }): React.ReactElement {
    return (
        <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-bold flex items-center justify-center shrink-0 mt-px">
                {n}
            </span>
            <span className="text-[11px] text-slate-600 leading-tight">{text}</span>
        </div>
    );
}

function getProviderRiskPresentation(provider: AIProvider): {
    tone: 'info' | 'warning';
    label: string;
    title: string;
    detail: string;
} {
    const risk = PROVIDER_RISK[provider];

    if (provider === 'custom') {
        return {
            tone: 'info',
            label: 'Custom setup',
            title: 'You control the gateway behavior',
            detail: 'Use the exact model ID and base URL exposed by your endpoint. Local tools often work without an API key, but hosted gateways may still require one.',
        };
    }

    if (risk === 'browser_friendly') {
        return {
            tone: 'info',
            label: 'Browser-friendly',
            title: 'Usually works well from a local browser session',
            detail: 'Good default for a local-first app. You still need a valid key and should expect the model to work best on targeted changes, not magic rewrites.',
        };
    }

    return {
        tone: 'warning',
        label: risk === 'proxy_likely' ? 'Proxy likely' : 'Setup varies',
        title: risk === 'proxy_likely'
            ? 'Often needs a server-side proxy'
            : 'May require a proxy or account-specific setup',
        detail: risk === 'proxy_likely'
            ? 'Browser-originated requests are commonly blocked or rate-limited. Plan to route this provider through your own backend if requests fail immediately.'
            : 'Some accounts work directly in the browser, while others need a proxy, allowlist, or custom gateway.',
    };
}

export function AISettings(): React.ReactElement {
    const { aiSettings, setAISettings } = useFlowStore();
    const { t } = useTranslation();

    const currentProvider = aiSettings.provider ?? 'gemini';
    const providerMeta = PROVIDERS.find(p => p.id === currentProvider) ?? PROVIDERS[0];
    const models = PROVIDER_MODELS[currentProvider] ?? [];
    const currentModel = aiSettings.model ?? providerMeta.defaultModel;
    const readiness = getAIReadinessState(aiSettings);
    const providerRisk = getProviderRiskPresentation(currentProvider);
    const providerRiskIcon = providerRisk.tone === 'warning' ? AlertCircle : Info;
    const providerRiskClassName = providerRisk.tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-slate-200 bg-slate-50 text-slate-800';
    const providerRiskIconClassName = providerRisk.tone === 'warning'
        ? 'text-amber-500'
        : 'text-[var(--brand-primary)]';
    const customBaseUrlError = currentProvider === 'custom' && readiness.blockingIssue?.detail.includes('base URL')
        ? readiness.blockingIssue.detail
        : undefined;
    const customModelError = currentProvider === 'custom' && readiness.blockingIssue?.detail.includes('model ID')
        ? readiness.blockingIssue.detail
        : undefined;
    const storageMode = aiSettings.storageMode ?? 'local';

    function updateStorageMode(nextMode: AISettingsStorageMode): void {
        setAISettings({ storageMode: nextMode });
    }

    function selectProvider(id: AIProvider): void {
        const meta = PROVIDERS.find(p => p.id === id)!;
        setAISettings({ provider: id, model: meta.defaultModel });
    }

    return (
        <div className="space-y-8 pb-4 animate-in fade-in duration-200 w-full min-w-0">
            {/* Header Text */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">{t('settingsModal.flowpilotConfigurations', { defaultValue: 'Flowpilot Configuration' })}</h3>
                    <a href={buildDocsSiteUrl('prompting-agents')} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
                        Prompting Guide <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <p className="text-xs text-slate-500">{t('ai.settingsSubtitle')}</p>
            </div>

            {/* Provider Section - Logo Dock */}
            <div className="space-y-4">
                <Label>{t('ai.provider')}</Label>
                {/* Fixed-size containers — inner icon scales avoids layout jerk */}
                <div className="flex items-center gap-2 overflow-x-auto px-1 py-3 custom-scrollbar">
                    {PROVIDERS.map(p => {
                        const isSelected = currentProvider === p.id;

                        const buttonClass = isSelected
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/8 ring-2 ring-[var(--brand-primary)]/40 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50';

                        const iconWrapperClass = isSelected
                            ? 'scale-100'
                            : 'scale-[0.7] opacity-60 group-hover:opacity-90 group-hover:scale-80';

                        const nameClass = isSelected
                            ? 'text-[var(--brand-primary)]'
                            : 'text-slate-400';

                        return (
                            <button
                                key={p.id}
                                onClick={() => selectProvider(p.id)}
                                title={p.name}
                                aria-label={`Select ${p.name} as AI provider`}
                                className={`group relative flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-[var(--radius-xl)] border transition-all duration-200 ${buttonClass}`}
                            >
                                <div className={`pointer-events-none transition-transform duration-200 ${iconWrapperClass}`}>
                                    <ProviderIcon p={p} isSelected={isSelected} />
                                </div>
                                <span className={`text-[9px] font-medium mt-0.5 leading-tight transition-colors duration-200 ${nameClass}`}>
                                    {p.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-slate-200 bg-white px-3 py-2.5">
                    <img src={providerMeta.logoPath} alt={providerMeta.name} className="w-6 h-6 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{providerMeta.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t(`settingsModal.ai.providers.${currentProvider}.hint`)}</p>
                    </div>
                    {providerMeta.id === 'custom' && <span className="rounded-[var(--radius-xs)] border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">BYOK</span>}
                </div>
                <div className={`rounded-[var(--radius-lg)] border px-3 py-3 ${providerRiskClassName}`}>
                    <div className="flex items-start gap-2">
                        {React.createElement(providerRiskIcon, { className: `mt-0.5 h-4 w-4 shrink-0 ${providerRiskIconClassName}` })}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider">{providerRisk.label}</p>
                                <span className="rounded-full border border-current/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-current/80">
                                    {providerMeta.name}
                                </span>
                            </div>
                            <p className="mt-1 text-xs font-medium">{providerRisk.title}</p>
                            <p className="mt-1 text-[11px] leading-5 text-current/80">{providerRisk.detail}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Config Section */}
            <div className="space-y-6">
                {/* Model Selector */}
                <div className="space-y-3">
                    <Label>{t('settingsModal.ai.model')}</Label>
                    {currentProvider === 'custom' ? (
                        <div className="space-y-2">
                            <Input
                                value={currentModel === 'custom' ? '' : currentModel}
                                onChange={e => setAISettings({ model: e.target.value })}
                                placeholder="e.g. llama3-70b-8192 or gpt-4o"
                                error={customModelError}
                                helperText={t('settingsModal.ai.customModelHint')}
                            />
                        </div>
                    ) : (
                        <Select
                            value={currentModel}
                            onChange={(val) => setAISettings({ model: val })}
                            options={models.map(m => ({
                                value: m.id,
                                label: t(`settingsModal.ai.models.${currentProvider}.${m.translateKey}.label`),
                                hint: t(`settingsModal.ai.models.${currentProvider}.${m.translateKey}.hint`),
                                badge: t(`settingsModal.ai.models.${currentProvider}.${m.translateKey}.badge`, { defaultValue: '' }) || undefined,
                                group: t(`settingsModal.ai.models.${currentProvider}.${m.translateKey}.category`)
                            }))}
                            placeholder={t('settingsModal.ai.selectModel')}
                        />
                    )}
                </div>

                {/* API Key */}
                <div className="space-y-3">
                    <Label>{providerMeta.name} {t('settingsModal.ai.apiKey')}</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <Input
                            type="password"
                            value={aiSettings.apiKey ?? ''}
                            onChange={e => setAISettings({ apiKey: e.target.value })}
                            placeholder={providerMeta.keyPlaceholder || `sk-...`}
                            className="pl-9 font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Key storage</Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => updateStorageMode('local')}
                                className={`rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors ${
                                    storageMode === 'local'
                                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/6'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <p className="text-xs font-semibold text-slate-800">Persistent</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Keep this key on this browser until you clear it manually.
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateStorageMode('session')}
                                className={`rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors ${
                                    storageMode === 'session'
                                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/6'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <p className="text-xs font-semibold text-slate-800">Session only</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Forget this key when the browser session closes. Better for shared or temporary machines.
                                </p>
                            </button>
                        </div>
                        <p className="text-[11px] leading-5 text-slate-500">
                            {storageMode === 'session'
                                ? 'Session-only mode stores AI settings in session storage and clears them when the browser session ends.'
                                : 'Persistent mode stores AI settings in local browser storage until you remove them or clear site data.'}
                        </p>
                    </div>
                    {aiSettings.apiKey && (
                        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <p className="text-[11px] leading-5 text-slate-500">
                                Clear the saved API key from this browser without resetting the selected provider or model.
                            </p>
                            <button
                                type="button"
                                onClick={() => setAISettings({ apiKey: undefined })}
                                className="shrink-0 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                            >
                                Forget key
                            </button>
                        </div>
                    )}

                    {/* Show setup guide only when the key is empty */}
                    {!aiSettings.apiKey && providerMeta.keyLink && (
                        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50">
                            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{t('settingsModal.ai.howToGetKey')}</span>
                                <a
                                    href={providerMeta.keyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand-primary)] hover:underline"
                                >
                                    {t('settingsModal.ai.openConsole', { console: providerMeta.consoleName })} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="px-3 py-2.5 space-y-2">
                                <Step n={1} text={`Go to ${providerMeta.consoleName}`} />
                                <Step n={2} text={t(`settingsModal.ai.providers.${currentProvider}.keySetupNote`)} />
                                <Step n={3} text={t('settingsModal.ai.pasteKeyStep')} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Custom Base URL */}
                {currentProvider === 'custom' && (
                    <div className="space-y-3">
                        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50">
                            <div className="px-3 py-2 border-b border-slate-200">
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{t('settingsModal.ai.customEndpointTitle')}</span>
                            </div>
                            <div className="px-3 py-2.5 space-y-1.5">
                                <p className="text-[11px] text-slate-600 leading-snug">
                                    <Trans i18nKey="settingsModal.ai.customEndpointText">
                                        Any <span className="font-semibold text-slate-800">OpenAI-compatible</span> API endpoint — local or remote. Great for:
                                    </Trans>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
                                    {['ollama', 'lmStudio', 'together'].map(id => (
                                        <div key={id} className="flex flex-col items-center rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2 py-1.5 text-center">
                                            <span className="text-[10px] font-semibold text-slate-700">{t(`settingsModal.ai.customEndpoints.${id}.name`)}</span>
                                            <span className="text-[9px] text-slate-400">{t(`settingsModal.ai.customEndpoints.${id}.hint`)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Label>{t('settingsModal.ai.customBaseUrl')}</Label>
                        <Input
                            value={aiSettings.customBaseUrl ?? ''}
                            onChange={e => setAISettings({ customBaseUrl: e.target.value })}
                            placeholder="https://localhost:11434/v1"
                            error={customBaseUrlError}
                            helperText="Use a full http:// or https:// base URL."
                        />
                        <p className="text-[11px] text-slate-500">
                            <Trans i18nKey="settingsModal.ai.customEndpointMustSupport">
                                Must support <code className="rounded-[var(--radius-xs)] bg-slate-100 px-1 text-[10px]">POST /chat/completions</code> (OpenAI format)
                            </Trans>
                        </p>
                    </div>
                )}
            </div>

            {/* Privacy Section - Improved Visibility */}
            <div className="pt-2">
                <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-slate-800">
                        <Shield className="w-4 h-4 text-[var(--brand-primary)]" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{t('settingsModal.ai.privacyTitle')}</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-2">
                        {BYOK_KEYS.map((item, i) => (
                            <li key={i} className="flex gap-2 text-[11px] text-slate-600 items-start">
                                <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                                <span className="leading-tight">{t(`settingsModal.ai.byok.${item}`)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-[11px] leading-5 text-slate-500">
                        {storageMode === 'session'
                            ? 'AI settings stay only for this browser session. Close the browser to clear them, or clear the key manually if you are handing the machine to someone else.'
                            : 'AI settings stay on this browser and device until you remove them. Treat shared browsers as untrusted and clear or rotate keys when needed.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
