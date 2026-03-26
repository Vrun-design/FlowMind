import React, { useRef, useState } from 'react';
import { Cloud, Code2, Database, FileCode, Loader2, Network, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import {
    LANGUAGE_LABELS,
    FILE_EXTENSION_TO_LANGUAGE,
    type SupportedLanguage,
} from '@/hooks/ai-generation/codeToArchitecture';
import { TERRAFORM_FORMAT_LABELS, type TerraformInputFormat } from '@/hooks/ai-generation/terraformToCloud';
import type { CommandBarProps } from './types';
import { ViewHeader } from './ViewHeader';

type ImportType = 'code' | 'sql' | 'terraform' | 'openapi';

interface ImportOption {
    id: ImportType;
    label: string;
    description: string;
    icon: typeof Code2;
    iconColor: string;
    available: boolean;
}

const IMPORT_PLACEHOLDERS: Record<ImportType, string> = {
    code: 'Paste your source code here...',
    sql: 'Paste CREATE TABLE statements here...',
    terraform: 'Paste Terraform HCL, Kubernetes YAML, or Docker Compose here...',
    openapi: 'Paste your OpenAPI / Swagger YAML or JSON here...',
};

const IMPORT_GENERATE_LABELS: Record<ImportType, string> = {
    code: 'Generate architecture diagram',
    sql: 'Generate ERD',
    terraform: 'Generate cloud diagram',
    openapi: 'Generate sequence diagram',
};

interface ImportViewProps {
    onClose: () => void;
    handleBack: () => void;
    onCodeAnalysis?: CommandBarProps['onCodeAnalysis'];
    onSqlAnalysis?: CommandBarProps['onSqlAnalysis'];
    onTerraformAnalysis?: CommandBarProps['onTerraformAnalysis'];
    onOpenApiAnalysis?: CommandBarProps['onOpenApiAnalysis'];
}

const LANGUAGE_OPTIONS: SelectOption[] = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }));
const TERRAFORM_FORMAT_OPTIONS: SelectOption[] = Object.entries(TERRAFORM_FORMAT_LABELS).map(([value, label]) => ({ value, label }));

export function ImportView({ onClose, handleBack, onCodeAnalysis, onSqlAnalysis, onTerraformAnalysis, onOpenApiAnalysis }: ImportViewProps): React.ReactElement {
    const [importType, setImportType] = useState<ImportType>('sql');
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState<SupportedLanguage>('typescript');
    const [terraformFormat, setTerraformFormat] = useState<TerraformInputFormat>('terraform');
    const [isGenerating, setIsGenerating] = useState(false);
    const codeFileInputRef = useRef<HTMLInputElement | null>(null);

    const importOptions: ImportOption[] = ([
        { id: 'sql' as const, label: 'SQL DDL → ERD', description: 'Turn CREATE TABLE statements into an entity-relationship diagram', icon: Database, iconColor: 'text-amber-500', available: Boolean(onSqlAnalysis) },
        { id: 'terraform' as const, label: 'Terraform / K8s → Cloud', description: 'Visualize infrastructure from HCL, YAML, or Compose files', icon: Cloud, iconColor: 'text-sky-500', available: Boolean(onTerraformAnalysis) },
        { id: 'openapi' as const, label: 'OpenAPI → Sequence', description: 'Generate a sequence diagram from an OpenAPI / Swagger spec', icon: Network, iconColor: 'text-indigo-500', available: Boolean(onOpenApiAnalysis) },
        { id: 'code' as const, label: 'Source code → Architecture', description: 'Analyze source files and build an architecture draft', icon: Code2, iconColor: 'text-emerald-500', available: Boolean(onCodeAnalysis) },
    ] satisfies ImportOption[]).filter((o) => o.available);

    const handleCodeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const detected = FILE_EXTENSION_TO_LANGUAGE[ext];
        if (detected) setLanguage(detected);
        const reader = new FileReader();
        reader.onload = (e) => setInput(e.target?.result as string ?? '');
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsGenerating(true);
        try {
            if (importType === 'code' && onCodeAnalysis) await onCodeAnalysis(input, language);
            else if (importType === 'sql' && onSqlAnalysis) await onSqlAnalysis(input);
            else if (importType === 'terraform' && onTerraformAnalysis) await onTerraformAnalysis(input, terraformFormat);
            else if (importType === 'openapi' && onOpenApiAnalysis) await onOpenApiAnalysis(input);
            onClose();
        } finally {
            setIsGenerating(false);
        }
    };

    const activeOption = importOptions.find((o) => o.id === importType) ?? importOptions[0];

    if (importOptions.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-sm font-medium text-slate-700">No import options available</p>
                <p className="text-xs text-slate-400">Import handlers are not configured for this diagram.</p>
                <Button variant="secondary" size="sm" onClick={handleBack}>Go back</Button>
            </div>
        );
    }

    return (
        <>
            <ViewHeader
                title="Import from data"
                icon={<WandSparkles className="h-4 w-4 text-[var(--brand-primary)]" />}
                description="Use structured input to generate a first draft, then refine it on the canvas."
                onBack={handleBack}
                onClose={onClose}
            />

            <div className="flex flex-1 min-h-0 gap-0">
                {/* Left: type picker */}
                <div className="flex w-52 shrink-0 flex-col gap-1 border-r border-slate-100 p-3">
                    {importOptions.map(({ id, label, icon: Icon, iconColor }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => { setImportType(id); setInput(''); }}
                            className={`flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                                importType === id
                                    ? 'bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Icon className={`h-4 w-4 shrink-0 ${importType === id ? 'text-[var(--brand-primary)]' : iconColor}`} />
                            <span className="leading-snug">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Right: input area */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 custom-scrollbar">
                    {activeOption && (
                        <p className="text-[11px] leading-5 text-slate-500">{activeOption.description}</p>
                    )}

                    {/* Controls row */}
                    {importType === 'code' && (
                        <div className="flex items-center gap-2">
                            <Select
                                value={language}
                                onChange={(v) => setLanguage(v as SupportedLanguage)}
                                options={LANGUAGE_OPTIONS}
                                className="flex-1"
                            />
                            <input
                                type="file"
                                accept=".ts,.tsx,.js,.jsx,.mjs,.py,.go,.java,.rb,.cs,.cpp,.cc,.cxx,.rs"
                                className="hidden"
                                ref={codeFileInputRef}
                                onChange={handleCodeFileSelect}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={<FileCode className="h-3.5 w-3.5" />}
                                onClick={() => codeFileInputRef.current?.click()}
                                title="Upload source file"
                            >
                                Upload file
                            </Button>
                        </div>
                    )}

                    {importType === 'terraform' && (
                        <Select
                            value={terraformFormat}
                            onChange={(v) => setTerraformFormat(v as TerraformInputFormat)}
                            options={TERRAFORM_FORMAT_OPTIONS}
                        />
                    )}

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={IMPORT_PLACEHOLDERS[importType]}
                        className="min-h-[200px] flex-1 resize-none rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 font-mono text-xs text-slate-700 outline-none placeholder-slate-300 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary-100)] custom-scrollbar"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        icon={isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                        disabled={!input.trim() || isGenerating}
                        isLoading={false}
                        onClick={() => void handleGenerate()}
                    >
                        {isGenerating ? 'Generating...' : (activeOption ? IMPORT_GENERATE_LABELS[activeOption.id] : 'Generate')}
                    </Button>
                </div>
            </div>
        </>
    );
}
