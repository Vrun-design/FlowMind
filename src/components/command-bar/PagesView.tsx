import React from 'react';
import { Copy, MoveRight, PanelsTopLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorPageActions, useEditorPagesState } from '@/store/editorPageHooks';
import { ViewHeader } from './ViewHeader';

interface PagesViewProps {
    onClose: () => void;
    handleBack: () => void;
}

export function PagesView({ onClose, handleBack }: PagesViewProps): React.ReactElement {
    const navigate = useNavigate();
    const { pages, activePageId } = useEditorPagesState();
    const { duplicateActivePage, copySelectedToPage, moveSelectedToPage, setActivePageId } = useEditorPageActions();

    function handleDuplicateCurrentPage(): void {
        const newPageId = duplicateActivePage();
        if (!newPageId) return;
        navigate(`/flow/${newPageId}`);
        onClose();
    }

    function handleSwitchPage(pageId: string): void {
        setActivePageId(pageId);
        navigate(`/flow/${pageId}`);
        onClose();
    }

    return (
        <div className="flex h-full flex-col">
            <ViewHeader title="Pages" icon={<PanelsTopLeft className="h-4 w-4 text-[var(--brand-primary)]" />} onBack={handleBack} />

            <div className="border-b border-slate-100 px-4 py-2">
                <button
                    onClick={handleDuplicateCurrentPage}
                    className="inline-flex h-9 items-center gap-2 rounded-[var(--brand-radius)] border border-slate-300 bg-white px-3 text-sm"
                >
                    <Copy className="h-4 w-4" />
                    Duplicate Current Page
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {pages.map((page) => {
                    const isActive = page.id === activePageId;
                    return (
                        <div
                            key={page.id}
                            className={`rounded-[var(--radius-md)] border p-3 ${
                                isActive ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]' : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-medium text-slate-700">{page.name}</div>
                                    <div className="text-xs text-slate-500">{page.nodes.length} nodes • {page.edges.length} edges</div>
                                </div>
                                {!isActive && (
                                    <button
                                        onClick={() => handleSwitchPage(page.id)}
                                        className="h-8 rounded-[var(--brand-radius)] border border-slate-300 bg-white px-2 text-[11px]"
                                    >
                                        Switch
                                    </button>
                                )}
                            </div>

                            {!isActive && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => copySelectedToPage(page.id)}
                                        className="inline-flex h-7 items-center gap-1 rounded-[var(--brand-radius)] border border-slate-300 bg-white px-2 text-[11px]"
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy Selected Here
                                    </button>
                                    <button
                                        onClick={() => moveSelectedToPage(page.id)}
                                        className="inline-flex h-7 items-center gap-1 rounded-[var(--brand-radius)] border border-slate-300 bg-white px-2 text-[11px]"
                                    >
                                        <MoveRight className="h-3 w-3" />
                                        Move Selected Here
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
