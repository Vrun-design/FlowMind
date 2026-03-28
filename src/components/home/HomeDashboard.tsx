import React from 'react';
import { Copy, Layout, Pencil, Plus, Trash2, LayoutTemplate, WandSparkles, FileInput, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Tooltip } from '../Tooltip';

export interface HomeFlowCard {
    id: string;
    name: string;
    nodeCount: number;
    edgeCount: number;
    updatedAt?: string;
    isActive?: boolean;
}

interface HomeDashboardProps {
    flows: HomeFlowCard[];
    onCreateNew: () => void;
    onOpenTemplates: () => void;
    onPromptWithAI: () => void;
    onImportJSON: () => void;
    onOpenFlow: (flowId: string) => void;
    onRenameFlow: (flowId: string) => void;
    onDuplicateFlow: (flowId: string) => void;
    onDeleteFlow: (flowId: string) => void;
}

export function HomeDashboard({
    flows,
    onCreateNew,
    onOpenTemplates,
    onPromptWithAI,
    onImportJSON,
    onOpenFlow,
    onRenameFlow,
    onDuplicateFlow,
    onDeleteFlow,
}: HomeDashboardProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 animate-in fade-in duration-300 sm:px-6 md:px-10 md:py-12">
            <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">{t('home.title', 'Dashboard')}</h1>
                    <p className="text-[var(--brand-secondary)] text-sm">{t('home.description', 'Manage your flows and diagrams.')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={onCreateNew}
                        variant="primary"
                        size="md"
                        data-testid="home-create-new"
                        icon={<Plus className="w-4 h-4" />}
                    >
                        {t('common.createNew', 'Create New')}
                    </Button>
                </div>
            </div>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('home.recentFiles', 'Recent Files')}</h2>
                        <Tooltip text={t('home.localStorageHint', 'Autosaved on this device. We do not upload your diagram data to our servers.')} side="right">
                            <div className="flex cursor-default items-center justify-center text-slate-300 hover:text-[var(--brand-primary)] transition-colors duration-200">
                                <ShieldCheck className="w-[13px] h-[13px]" fill="currentColor" stroke="white" strokeWidth={1.5} />
                            </div>
                        </Tooltip>
                    </div>
                    {flows.length > 0 && (
                        <span className="text-xs text-slate-400">{flows.length} {t('home.files', 'files')}</span>
                    )}
                </div>

                {flows.length === 0 ? (
                    <div
                        className="flex w-full flex-col py-2 sm:py-6 animate-in fade-in zoom-in-[0.99] duration-700"
                        data-testid="home-empty-state"
                    >
                        <div className="relative overflow-hidden w-full max-w-[840px] mx-auto rounded-[24px] bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                            
                            {/* Super-delicate background gradient inside card */}
                            <div className="absolute top-0 left-0 w-full h-[140px] bg-gradient-to-b from-slate-50 to-white pointer-events-none"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[120px] bg-[var(--brand-primary)]/5 blur-[50px] rounded-full pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center">
                                
                                {/* Sleek Icon */}
                                <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/60 mb-5 relative group cursor-default">
                                    <div className="absolute inset-0 bg-[var(--brand-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[18px]"></div>
                                    <Layout className="w-8 h-8 text-[var(--brand-primary)] transition-transform group-hover:scale-105 duration-500" strokeWidth={1.5} />
                                </div>

                                <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-slate-900 mb-2">
                                    Create your first flow
                                </h2>
                                <p className="text-[14px] text-slate-500 max-w-[500px] mb-8 leading-relaxed">
                                    Design enterprise-grade architectures instantly. Start from a blank canvas, describe your infrastructure with our AI builder, or use a tailored template.
                                </p>

                                {/* Action Grid strictly inside the card */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-[640px]">
                                    <Button 
                                        onClick={onCreateNew} 
                                        data-testid="home-create-new-main" 
                                        variant="primary"
                                        size="lg"
                                        className="w-full text-[14.5px]"
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={2.5} /> Blank Canvas
                                    </Button>

                                    <Button 
                                        onClick={onPromptWithAI} 
                                        data-testid="home-generate-with-ai" 
                                        variant="secondary"
                                        size="lg"
                                        className="w-full text-[14.5px]"
                                    >
                                        <WandSparkles className="w-4 h-4 text-amber-500" strokeWidth={2.5} /> Flowpilot AI
                                    </Button>

                                    <Button 
                                        onClick={onOpenTemplates} 
                                        data-testid="home-open-templates" 
                                        variant="secondary"
                                        size="lg"
                                        className="w-full text-[14.5px]"
                                    >
                                        <LayoutTemplate className="w-4 h-4 text-slate-400" strokeWidth={2} /> Templates
                                    </Button>
                                </div>
                                
                                <div className="mt-8 flex items-center justify-center pt-6 border-t border-slate-100/60 w-full max-w-[640px]">
                                    <button onClick={onImportJSON} className="text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:underline">
                                        <FileInput className="w-[14px] h-[14px]" /> Or import an existing file
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {flows.map((flow) => (
                            <div
                                key={flow.id}
                                onClick={() => onOpenFlow(flow.id)}
                                className="group bg-[var(--brand-surface)] rounded-[var(--radius-lg)] border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all relative"
                            >
                                <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                        <code className="text-[8px] leading-relaxed select-none">
                                            {`graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[End]\n  B -->|No| D[Loop]`}
                                        </code>
                                    </div>
                                    <div className="w-8 h-8 rounded bg-[var(--brand-surface)] shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[var(--brand-primary)] group-hover:border-[var(--brand-primary-200)] transition-colors z-10">
                                        <Layout className="w-4 h-4" />
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-70 md:group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onRenameFlow(flow.id);
                                            }}
                                            className="rounded-[var(--radius-sm)] border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                                            aria-label={t('common.rename', 'Rename')}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDuplicateFlow(flow.id);
                                            }}
                                            className="rounded-[var(--radius-sm)] border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                                            aria-label={t('common.duplicate', 'Duplicate')}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDeleteFlow(flow.id);
                                            }}
                                            className="rounded-[var(--radius-sm)] border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                            aria-label={t('common.delete', 'Delete')}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-slate-900 text-sm truncate mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
                                        {flow.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-[11px] text-[var(--brand-secondary)]">
                                        <span>{flow.isActive ? t('home.currentFlow', 'Current flow') : t('home.autosaved', 'Autosaved')}</span>
                                        <span>{flow.nodeCount} nodes</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>{flow.edgeCount} edges</span>
                                        <span>{formatUpdatedAt(flow.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


            </section>
        </div>
    );
}

function formatUpdatedAt(updatedAt?: string): string {
    if (!updatedAt) return 'Autosaved';
    const parsed = Date.parse(updatedAt);
    if (Number.isNaN(parsed)) return 'Autosaved';
    return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
