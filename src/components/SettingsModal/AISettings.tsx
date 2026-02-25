import React, { useState } from 'react';
import { useFlowStore, AIProvider } from '../../store';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { ExternalLink, Check, Shield, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Provider metadata
interface ProviderMeta {
    id: AIProvider;
    name: string;
    icon: string;
    color: string;
    logoPath: string;
    hint: string;
    keyPlaceholder: string;
    keyLink: string;
    keyLinkLabel: string;
    consoleName: string;
    keySetupNote: string;
    defaultModel: string;
}

const PROVIDERS: ProviderMeta[] = [
    {
        id: 'gemini',
        name: 'Gemini',
        icon: '✦',
        color: '#4285F4',
        logoPath: '/logos/Gemini.svg',
        hint: 'Google · Best free tier · Multimodal',
        keyPlaceholder: 'AIzaSy...',
        keyLink: 'https://aistudio.google.com/app/apikey',
        keyLinkLabel: 'Get a Gemini API Key',
        consoleName: 'Google AI Studio',
        keySetupNote: 'Free tier available — no credit card needed',
        defaultModel: 'gemini-2.5-flash-lite',
    },
    {
        id: 'openai',
        name: 'OpenAI',
        icon: '⬡',
        color: '#10a37f',
        logoPath: '/logos/Openai.svg',
        hint: 'GPT-5 family · Industry standard',
        keyPlaceholder: 'sk-...',
        keyLink: 'https://platform.openai.com/api-keys',
        keyLinkLabel: 'Get an OpenAI API Key',
        consoleName: 'OpenAI Platform',
        keySetupNote: 'Requires a paid account and billing setup',
        defaultModel: 'gpt-5-mini',
    },
    {
        id: 'claude',
        name: 'Claude',
        icon: '◆',
        color: '#cc785c',
        logoPath: '/logos/claude.svg',
        hint: 'Anthropic · Leading reasoning model',
        keyPlaceholder: 'sk-ant-...',
        keyLink: 'https://console.anthropic.com/settings/keys',
        keyLinkLabel: 'Get a Claude API Key',
        consoleName: 'Anthropic Console',
        keySetupNote: 'Requires a paid account ($5 min credit top-up)',
        defaultModel: 'claude-sonnet-4-6',
    },
    {
        id: 'groq',
        name: 'Groq',
        icon: '⚡',
        color: '#f55036',
        logoPath: '/logos/Groq.svg',
        hint: 'Blazing fast · Generous free tier · Llama 4',
        keyPlaceholder: 'gsk_...',
        keyLink: 'https://console.groq.com/keys',
        keyLinkLabel: 'Get a Groq API Key',
        consoleName: 'Groq Console',
        keySetupNote: 'Free tier available — no credit card needed',
        defaultModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    },
    {
        id: 'nvidia',
        name: 'NVIDIA',
        icon: '▶',
        color: '#76b900',
        logoPath: '/logos/Nvidia.svg',
        hint: 'NIM · Kimi-V2.5 · Frontier models',
        keyPlaceholder: 'nvapi-...',
        keyLink: 'https://build.nvidia.com',
        keyLinkLabel: 'Get an NVIDIA API Key',
        consoleName: 'NVIDIA Build',
        keySetupNote: 'Free credits included with a new account',
        defaultModel: 'meta/llama-4-scout-17b-16e-instruct',
    },
    {
        id: 'cerebras',
        name: 'Cerebras',
        icon: '🧠',
        color: '#7c3aed',
        logoPath: '/logos/cerebras.svg',
        hint: '2,400 tok/s · Qwen 3 235B · WSE-3 speed',
        keyPlaceholder: 'csk-...',
        keyLink: 'https://cloud.cerebras.ai',
        keyLinkLabel: 'Get a Cerebras API Key',
        consoleName: 'Cerebras Cloud',
        keySetupNote: 'Free tier available — no credit card needed',
        defaultModel: 'gpt-oss-120b',
    },
    {
        id: 'mistral',
        name: 'Mistral',
        icon: '▣',
        color: '#FF7000',
        logoPath: '/logos/Mistral.svg',
        hint: 'Le Chat · Codestral · European AI leader',
        keyPlaceholder: 'your-mistral-key...',
        keyLink: 'https://console.mistral.ai/api-keys',
        keyLinkLabel: 'Get a Mistral API Key',
        consoleName: 'Mistral Console (La Plateforme)',
        keySetupNote: 'Free tier with generous limits — no credit card needed',
        defaultModel: 'mistral-medium-latest',
    },
    {
        id: 'custom',
        name: 'Custom',
        icon: '⚙',
        color: '#64748b',
        logoPath: '/logos/custom.svg',
        hint: 'Any OpenAI-compatible endpoint',
        keyPlaceholder: 'your-api-key',
        keyLink: '',
        keyLinkLabel: '',
        consoleName: '',
        keySetupNote: '',
        defaultModel: 'your-model-id',
    },
];

const PROVIDER_MODELS: Record<AIProvider, { id: string; label: string; hint: string; category: string; badge?: string }[]> = {
    gemini: [
        { id: 'gemini-2.5-flash-lite', label: '2.5 Flash Lite', hint: 'Fastest · Free tier default', category: 'Speed', badge: 'Default' },
        { id: 'gemini-2.5-flash', label: '2.5 Flash', hint: 'Best price/performance balance', category: 'Speed' },
        { id: 'gemini-2.5-pro', label: '2.5 Pro', hint: 'Best reasoning · Complex diagrams', category: 'Reasoning' },
        { id: 'gemini-3-flash', label: '3 Flash', hint: 'Frontier speed + intelligence', category: 'Legacy', badge: 'New' },
        { id: 'gemini-3-pro', label: '3 Pro', hint: 'Most powerful · Multimodal', category: 'Legacy', badge: 'New' },
    ],
    openai: [
        { id: 'gpt-5-mini', label: 'GPT-5 mini', hint: 'Fast · Cost-efficient', category: 'Speed', badge: 'Default' },
        { id: 'gpt-5', label: 'GPT-5', hint: 'Flagship model · Most capable', category: 'Flagship' },
        { id: 'gpt-5.2', label: 'GPT-5.2', hint: 'Latest update · Improved reasoning', category: 'Reasoning', badge: 'New' },
        { id: 'o4-mini', label: 'o4-mini', hint: 'Advanced reasoning · Fast', category: 'Reasoning', badge: 'Reasoning' },
        { id: 'o3', label: 'o3', hint: 'Deep reasoning · Complex tasks', category: 'Reasoning', badge: 'Reasoning' },
    ],
    claude: [
        { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', hint: 'Fastest · Most affordable', category: 'Speed' },
        { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', hint: 'Balanced intelligence & speed', category: 'Flagship' },
        { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', hint: 'Latest Sonnet · Best coding', category: 'Flagship', badge: 'Default' },
        { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', hint: 'Most intelligent · 1M token context', category: 'Reasoning', badge: 'Flagship' },
    ],
    groq: [
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout', hint: 'Free tier · Very fast', category: 'Speed', badge: 'Free' },
        { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick', hint: 'More capable · Free tier', category: 'Speed', badge: 'Free' },
        { id: 'qwen/qwen3-32b', label: 'Qwen3 32B', hint: 'Advanced reasoning · Tool use', category: 'Reasoning' },
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile', hint: 'Versatile model', category: 'Performance', badge: 'Performance' },
    ],
    nvidia: [
        { id: 'meta/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout', hint: 'Efficient · Multi-modal', category: 'Speed' },
        { id: 'nvidia/nemotron-nano-12b-v2-vl', label: 'Nemotron Nano 12B', hint: 'Lightweight · Vision-language · Fast', category: 'Speed' },
        { id: 'deepseek/deepseek-v3-2', label: 'DeepSeek-V3.2 (685B)', hint: 'Latest · GPT-5 comparable', category: 'Flagship', badge: 'New' },
        { id: 'qwen/qwq-32b', label: 'QwQ 32B', hint: 'Strong reasoning model', category: 'Reasoning' },
        { id: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 Thinking', hint: 'Advanced reasoning · Tool use', category: 'Reasoning' },
    ],
    cerebras: [
        { id: 'gpt-oss-120b', label: 'GPT-OSS 120B', hint: '120B params · Fast on WSE-3', category: 'Speed', badge: 'Default' },
        { id: 'qwen-3-32b', label: 'Qwen3 32B', hint: '2,403 tok/s · Industry fastest', category: 'Speed', badge: '🚀 Fastest' },
        { id: 'qwen-3-235b-a22b', label: 'Qwen3 235B A22B', hint: 'Flagship · Best quality', category: 'Flagship', badge: 'Flagship' },
        { id: 'zai-glm-4.7', label: 'Zai-GLM 4.7', hint: 'Advanced reasoning · Tool use', category: 'Reasoning' },
    ],
    mistral: [
        { id: 'mistral-small-latest', label: 'Mistral Small', hint: 'Fast · Cost-efficient · 32k context', category: 'Speed', badge: 'Free' },
        { id: 'mistral-medium-latest', label: 'Mistral Medium', hint: 'Balanced quality-cost · Best default', category: 'Flagship', badge: 'Default' },
        { id: 'mistral-large-latest', label: 'Mistral Large', hint: 'Most capable · 128k context · Flagship', category: 'Flagship', badge: 'Flagship' },
        { id: 'codestral-latest', label: 'Codestral', hint: 'Code-optimized · 256k context', category: 'Coding', badge: 'Code' },
        { id: 'pixtral-large-latest', label: 'Pixtral Large', hint: 'Vision + reasoning · Multimodal', category: 'Multimodal', badge: 'Vision' },
    ],
    custom: [
        { id: 'custom', label: 'Custom Model', hint: 'Enter your model ID below', category: 'Custom' },
    ],
};

const BYOK_REASONS = [
    'ai.byokReasons.dataPrivacy',
    'ai.byokReasons.fullControl',
    'ai.byokReasons.switchAnytime',
    'ai.byokReasons.accessLatest',
] as const;

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

export function AISettings(): React.ReactElement {
    const { t } = useTranslation();
    const { aiSettings, setAISettings } = useFlowStore();

    const currentProvider = aiSettings.provider ?? 'gemini';
    const providerMeta = PROVIDERS.find(p => p.id === currentProvider) ?? PROVIDERS[0];
    const models = PROVIDER_MODELS[currentProvider] ?? [];
    const currentModel = aiSettings.model ?? providerMeta.defaultModel;

    function selectProvider(id: AIProvider): void {
        const meta = PROVIDERS.find(p => p.id === id)!;
        setAISettings({ provider: id, model: meta.defaultModel });
    }

    return (
        <div className="space-y-8 pb-4 animate-in fade-in duration-200 w-full min-w-0">
            {/* Header Text */}
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-800">{t('ai.flowpilotSettings')}</h3>
                <p className="text-xs text-slate-500">{t('ai.flowpilotDesc')}</p>
            </div>

            {/* Provider Section - Logo Dock */}
            <div className="space-y-4">
                <Label>{t('ai.aiProvider')}</Label>
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
                                aria-label={t('ai.selectProvider', { name: p.name })}
                                className={`group relative flex flex-col items-center justify-center shrink-0 w-[72px] h-[72px] rounded-2xl border transition-all duration-200 ${buttonClass}`}
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
                {/* Selected provider info strip */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-xl border border-slate-200">
                    <img src={providerMeta.logoPath} alt={providerMeta.name} className="w-6 h-6 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{providerMeta.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t(`ai.providers.${currentProvider}.hint`)}</p>
                    </div>
                    {providerMeta.id === 'custom' && <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-medium text-slate-500">BYOK</span>}
                </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Config Section */}
            <div className="space-y-6">
                {/* Model Selector */}
                <div className="space-y-3">
                    <Label>{t('ai.modelSelection')}</Label>
                    {currentProvider === 'custom' ? (
                        <div className="space-y-2">
                            <Input
                                value={currentModel === 'custom' ? '' : currentModel}
                                onChange={e => setAISettings({ model: e.target.value })}
                                placeholder={t('ai.modelPlaceholder')}
                            />
                            <p className="text-[10px] text-slate-400">{t('ai.modelId')}</p>
                        </div>
                    ) : (
                        <Select
                            value={currentModel}
                            onChange={(val) => setAISettings({ model: val })}
                            options={models.map(m => {
                                // Normalize badge for translation lookup
                                let badgeKey = m.badge?.toLowerCase().replace(/[^a-z]/g, '');
                                const badgeText = badgeKey ? t(`ai.badges.${badgeKey}`) : undefined;
                                
                                return {
                                    value: m.id,
                                    label: m.id === 'custom' ? t('ai.customModel') : m.label,
                                    hint: t(`ai.models.${m.id.replace(/\//g, '/')}`),
                                    badge: badgeText,
                                    group: t(`ai.categories.${m.category.toLowerCase()}`)
                                };
                            })}
                            placeholder={t('ai.selectAModel')}
                        />
                    )}
                </div>

                {/* API Key */}
                <div className="space-y-3">
                    <Label>{providerMeta.name} {t('ai.apiKey')}</Label>
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

                    {/* Show setup guide only when the key is empty */}
                    {!aiSettings.apiKey && providerMeta.keyLink && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{t('ai.howToGetApiKey')}</span>
                                <a
                                    href={providerMeta.keyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand-primary)] hover:underline"
                                >
                                    {t(`ai.providers.${currentProvider}.keyLinkLabel`)} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="px-3 py-2.5 space-y-2">
                                <Step n={1} text={t('ai.goToConsole', { consoleName: t(`ai.providers.${currentProvider}.consoleName`) })} />
                                <Step n={2} text={t(`ai.providers.${currentProvider}.keySetupNote`)} />
                                <Step n={3} text={t('ai.pasteInField')} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Custom Base URL */}
                {currentProvider === 'custom' && (
                    <div className="space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-200">
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{t('ai.whatsCustomEndpoint')}</span>
                            </div>
                            <div className="px-3 py-2.5 space-y-1.5">
                                <p className="text-[11px] text-slate-600 leading-snug">
                                    {t('ai.anyPrefix')} <span className="font-semibold text-slate-800">{t('ai.openAICompatible')}</span> {t('ai.customEndpointDesc')}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
                                    {[
                                        { name: 'Ollama', hintKey: 'ollama' },
                                        { name: 'LM Studio', hintKey: 'lmStudio' },
                                        { name: 'Together.ai', hintKey: 'togetherAi' },
                                    ].map(ex => (
                                        <div key={ex.name} className="flex flex-col items-center px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-center">
                                            <span className="text-[10px] font-semibold text-slate-700">{ex.name}</span>
                                            <span className="text-[9px] text-slate-400">{t(`ai.customEndpointExamples.${ex.hintKey}`)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Label>{t('ai.baseUrl')}</Label>
                        <Input
                            value={aiSettings.customBaseUrl ?? ''}
                            onChange={e => setAISettings({ customBaseUrl: e.target.value })}
                            placeholder="https://localhost:11434/v1"
                        />
                        <p className="text-[11px] text-slate-500">{t('ai.mustSupport')} <code className="bg-slate-100 px-1 rounded text-[10px]">{t('ai.postChatCompletions')}</code> {t('ai.openAIFormat')}</p>
                    </div>
                )}
            </div>

            {/* Privacy Section - Improved Visibility */}
            <div className="pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-slate-800">
                        <Shield className="w-4 h-4 text-[var(--brand-primary)]" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{t('ai.privacy')}</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-2">
                        {BYOK_REASONS.map((item, i) => (
                            <li key={i} className="flex gap-2 text-[11px] text-slate-600 items-start">
                                <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                                <span className="leading-tight">{t(item)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
