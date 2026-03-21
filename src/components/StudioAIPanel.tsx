import { useRef, useState, type ReactElement } from 'react';
import {
    ArrowUp, Code2, Database, Server, Cloud, Network,
    Loader2, Paperclip, Trash2, WandSparkles, X, FileCode, Crosshair, Import,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import type { ChatMessage } from '@/services/aiService';
import { IS_BEVELED } from '@/lib/brand';
import { useAIViewState } from './command-bar/useAIViewState';
import {
    LANGUAGE_LABELS,
    FILE_EXTENSION_TO_LANGUAGE,
    type SupportedLanguage,
} from '@/hooks/ai-generation/codeToArchitecture';
import { TERRAFORM_FORMAT_LABELS, type TerraformInputFormat } from '@/hooks/ai-generation/terraformToCloud';

interface FlowPilotExample {
    label: string;
    icon: typeof Database;
    prompt: string;
}

const FLOWPILOT_EXAMPLES: FlowPilotExample[] = [
    { label: 'Add Database', icon: Database, prompt: 'Add a PostgreSQL database to the architecture' },
    { label: 'Add Server', icon: Server, prompt: 'Add a backend Node.js server service' },
    { label: 'Add Cloud Infrastructure', icon: Cloud, prompt: 'Deploy the main application to AWS' },
    { label: 'Add Load Balancer', icon: Network, prompt: 'Add a load balancer in front of the application' },
];

const EXAMPLE_ICON_COLORS = [
    'text-orange-500',
    'text-blue-500',
    'text-amber-500',
    'text-indigo-500',
    'text-teal-500',
    'text-rose-500',
];

function getExampleIconColor(index: number): string {
    return EXAMPLE_ICON_COLORS[index % EXAMPLE_ICON_COLORS.length];
}

type ImportType = 'sql' | 'terraform' | 'openapi';

const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
    sql: 'SQL DDL → ERD',
    terraform: 'Terraform / K8s → Cloud',
    openapi: 'OpenAPI → Sequence',
};

const IMPORT_TYPE_PLACEHOLDERS: Record<ImportType, string> = {
    sql: 'Paste CREATE TABLE statements here...',
    terraform: 'Paste Terraform HCL, Kubernetes YAML, or Docker Compose here...',
    openapi: 'Paste your OpenAPI / Swagger YAML or JSON here...',
};

interface StudioAIPanelProps {
    onAIGenerate: (prompt: string, imageBase64?: string) => Promise<void>;
    isGenerating: boolean;
    chatMessages: ChatMessage[];
    onClearChat: () => void;
    onCodeAnalysis?: (code: string, language: SupportedLanguage) => Promise<void>;
    onSqlAnalysis?: (sql: string) => Promise<void>;
    onTerraformAnalysis?: (input: string, format: TerraformInputFormat) => Promise<void>;
    onOpenApiAnalysis?: (spec: string) => Promise<void>;
    selectedNodeCount?: number;
}

type AIMode = 'chat' | 'code' | 'import';

const AI_MODES: AIMode[] = ['chat', 'code', 'import'];

export function StudioAIPanel({
    onAIGenerate,
    isGenerating,
    chatMessages,
    onClearChat,
    onCodeAnalysis,
    onSqlAnalysis,
    onTerraformAnalysis,
    onOpenApiAnalysis,
    selectedNodeCount = 0,
}: StudioAIPanelProps): ReactElement {
    const { t } = useTranslation();
    const isBeveled = IS_BEVELED;
    const codeFileInputRef = useRef<HTMLInputElement | null>(null);
    const [aiMode, setAiMode] = useState<AIMode>('chat');
    const [codeInput, setCodeInput] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('typescript');
    const showCodeTab = ROLLOUT_FLAGS.codeToArchitectureV1 && Boolean(onCodeAnalysis);
    const showImportTab = ROLLOUT_FLAGS.importAdaptersV1 && (Boolean(onSqlAnalysis) || Boolean(onTerraformAnalysis) || Boolean(onOpenApiAnalysis));
    const [importType, setImportType] = useState<ImportType>('sql');
    const [importInput, setImportInput] = useState('');
    const [terraformFormat, setTerraformFormat] = useState<TerraformInputFormat>('terraform');

    const {
        prompt,
        setPrompt,
        selectedImage,
        setSelectedImage,
        fileInputRef,
        scrollRef,
        handleGenerate,
        handleKeyDown,
        handleImageSelect,
    } = useAIViewState({
        searchQuery: '',
        isGenerating,
        onAIGenerate,
        onClose: () => undefined,
        chatMessageCount: chatMessages.length,
    });

    const hasHistory = chatMessages.length > 0;

    const handleCodeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const detectedLanguage = FILE_EXTENSION_TO_LANGUAGE[ext];
        if (detectedLanguage) setSelectedLanguage(detectedLanguage);
        const reader = new FileReader();
        reader.onload = (e) => setCodeInput(e.target?.result as string ?? '');
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleAnalyzeCode = async () => {
        if (!codeInput.trim() || !onCodeAnalysis) return;
        await onCodeAnalysis(codeInput, selectedLanguage);
    };

    const handleImport = async () => {
        if (!importInput.trim()) return;
        if (importType === 'sql' && onSqlAnalysis) {
            await onSqlAnalysis(importInput);
        } else if (importType === 'terraform' && onTerraformAnalysis) {
            await onTerraformAnalysis(importInput, terraformFormat);
        } else if (importType === 'openapi' && onOpenApiAnalysis) {
            await onOpenApiAnalysis(importInput);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {(showCodeTab || showImportTab) && (
                <div className="flex gap-1 border-b border-slate-100 px-1 pb-0 pt-1 shrink-0">
                    {AI_MODES.filter((mode) => {
                        if (mode === 'code') return showCodeTab;
                        if (mode === 'import') return showImportTab;
                        return true;
                    }).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setAiMode(mode)}
                            className={`flex items-center gap-1.5 rounded-t px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                                aiMode === mode
                                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {mode === 'chat' && <WandSparkles className="h-3.5 w-3.5" />}
                            {mode === 'code' && <Code2 className="h-3.5 w-3.5" />}
                            {mode === 'import' && <Import className="h-3.5 w-3.5" />}
                            {mode === 'chat' ? 'FlowPilot' : mode === 'code' ? 'From Code' : 'Import'}
                        </button>
                    ))}
                </div>
            )}

            {aiMode === 'import' && showImportTab ? (
                <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 custom-scrollbar">
                    <div className="rounded-[var(--radius-md)] border border-slate-200 bg-[var(--brand-primary-50)] p-3">
                        <p className="text-xs font-medium text-[var(--brand-primary)]">Import from structured data</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">Paste SQL, Terraform, or OpenAPI specs — FlowPilot will generate a diagram automatically.</p>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        {(Object.entries(IMPORT_TYPE_LABELS) as [ImportType, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setImportType(key); setImportInput(''); }}
                                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                                    importType === key
                                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {importType === 'terraform' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600 shrink-0">Format</label>
                            <select
                                value={terraformFormat}
                                onChange={(e) => setTerraformFormat(e.target.value as TerraformInputFormat)}
                                className="flex-1 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary-100)]"
                            >
                                {(Object.entries(TERRAFORM_FORMAT_LABELS) as [TerraformInputFormat, string][]).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <textarea
                        value={importInput}
                        onChange={(e) => setImportInput(e.target.value)}
                        placeholder={IMPORT_TYPE_PLACEHOLDERS[importType]}
                        className="min-h-[240px] flex-1 resize-none rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 font-mono text-xs text-slate-700 outline-none placeholder-slate-300 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary-100)] custom-scrollbar"
                    />

                    <button
                        onClick={() => void handleImport()}
                        disabled={!importInput.trim() || isGenerating}
                        className={`flex h-9 w-full items-center justify-center gap-2 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-sm font-medium text-white transition-all hover:bg-[var(--brand-primary-600)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] ${isBeveled ? 'btn-beveled' : ''}`}
                    >
                        {isGenerating ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><WandSparkles className="h-4 w-4" /> Generate Diagram</>
                        )}
                    </button>
                </div>
            ) : aiMode === 'code' && showCodeTab ? (
                <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 custom-scrollbar">
                    <div className="rounded-[var(--radius-md)] border border-slate-200 bg-[var(--brand-primary-50)] p-3">
                        <p className="text-xs font-medium text-[var(--brand-primary)]">Paste source code below</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">FlowPilot will analyze the structure and generate an architecture diagram on your canvas.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600 shrink-0">Language</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                            className="flex-1 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary-100)]"
                        >
                            {(Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <input
                            type="file"
                            accept=".ts,.tsx,.js,.jsx,.mjs,.py,.go,.java,.rb,.cs,.cpp,.cc,.cxx,.rs"
                            className="hidden"
                            ref={codeFileInputRef}
                            onChange={handleCodeFileSelect}
                        />
                        <button
                            onClick={() => codeFileInputRef.current?.click()}
                            title="Upload source file"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
                        >
                            <FileCode className="h-4 w-4" />
                        </button>
                    </div>

                    <textarea
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Paste your source code here..."
                        className="min-h-[240px] flex-1 resize-none rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 font-mono text-xs text-slate-700 outline-none placeholder-slate-300 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary-100)] custom-scrollbar"
                    />

                    <button
                        onClick={() => void handleAnalyzeCode()}
                        disabled={!codeInput.trim() || isGenerating}
                        className={`flex h-9 w-full items-center justify-center gap-2 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-sm font-medium text-white transition-all hover:bg-[var(--brand-primary-600)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] ${isBeveled ? 'btn-beveled' : ''}`}
                    >
                        {isGenerating ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                        ) : (
                            <><WandSparkles className="h-4 w-4" /> Generate Architecture</>
                        )}
                    </button>
                </div>
            ) : (
                <>
                    {hasHistory && (
                        <div className="flex items-center justify-end px-1 pb-2">
                            <button
                                onClick={onClearChat}
                                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95"
                                title={t('commandBar.ai.clearChat')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-4 custom-scrollbar">
                        {!hasHistory ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-[var(--brand-primary-100)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)] shadow-sm">
                                    <WandSparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-slate-900">FlowPilot</h3>
                                <p className="mt-2 mb-6 max-w-[280px] text-sm leading-6 text-slate-500">
                                    Describe the changes you want and FlowPilot will update the graph for you.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-[320px] mx-auto">
                                    {FLOWPILOT_EXAMPLES.map((skill, index) => {
                                        const Icon = skill.icon;
                                        return (
                                            <button
                                                key={skill.label}
                                                onClick={() => {
                                                    setPrompt(skill.prompt);
                                                    void handleGenerate(skill.prompt);
                                                }}
                                                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm transition-all hover:border-[var(--brand-primary-200)] hover:text-[var(--brand-primary)] active:scale-95"
                                            >
                                                <Icon className={`h-3.5 w-3.5 ${getExampleIconColor(index)}`} />
                                                {skill.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[88%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'rounded-br-sm bg-[var(--brand-primary)] text-white shadow-sm'
                                            : 'rounded-bl-sm border border-slate-200/70 bg-white text-[var(--brand-text)] shadow-sm'
                                            }`}
                                    >
                                        {msg.parts.map((part, index) => (
                                            <div key={index} className="leading-relaxed">{part.text}</div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-slate-100 px-1 pt-3">
                        {selectedNodeCount > 0 && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-[var(--brand-primary-50)] px-2.5 py-1.5">
                                <Crosshair className="h-3 w-3 shrink-0 text-[var(--brand-primary)]" />
                                <span className="text-[11px] font-medium text-[var(--brand-primary)]">
                                    Editing {selectedNodeCount} selected {selectedNodeCount === 1 ? 'node' : 'nodes'}
                                </span>
                            </div>
                        )}
                        {selectedImage && (
                            <div className="group relative mb-3 h-16 w-16 overflow-hidden rounded-[var(--radius-md)] border border-slate-200 bg-slate-100 shadow-sm">
                                <img src={selectedImage} alt="Upload preview" className="h-full w-full object-cover" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        <div className="relative flex w-full flex-col rounded-[var(--brand-radius)] border border-slate-200 bg-white shadow-sm transition-all focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary-100)]">
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe your edits..."
                                className="w-full resize-none rounded-t-[var(--brand-radius)] bg-transparent p-4 text-sm text-[var(--brand-text)] placeholder-[var(--brand-secondary-light)] outline-none custom-scrollbar"
                                style={{ minHeight: '60px', maxHeight: '160px' }}
                                rows={2}
                            />
                            <div className="flex items-center justify-between rounded-b-[var(--brand-radius)] px-3 pb-3 pt-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                        title="Attach Image"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => { void handleGenerate(); }}
                                        disabled={(!prompt.trim() && !selectedImage) || isGenerating}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-600)] disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0 ${isBeveled ? 'btn-beveled' : ''}`}
                                    >
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
