import React, { useEffect, useRef } from 'react';
import {
    Copy,
    ClipboardPaste,
    Trash2,
    BringToFront,
    SendToBack,
    CopyPlus,
    Replace,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    AlignStartHorizontal,
    AlignCenterHorizontal,
    AlignEndHorizontal,
    ArrowRightFromLine,
    ArrowDownFromLine,
    Group,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ContextMenuProps {
    id: string | null;
    type: 'node' | 'pane' | 'edge' | 'multi';
    currentNodeType?: string | null;
    position: { x: number; y: number };
    onClose: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onBringToFront?: () => void;
    onSendToBack?: () => void;
    onChangeNodeType?: (type: string) => void;
    canPaste?: boolean;
    // Multi-select
    selectedCount?: number;
    onAlignNodes?: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    onDistributeNodes?: (direction: 'horizontal' | 'vertical') => void;
    onGroupSelected?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    type,
    currentNodeType,
    position,
    onClose,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    onBringToFront,
    onSendToBack,
    onChangeNodeType,
    canPaste,
    selectedCount = 0,
    onAlignNodes,
    onDistributeNodes,
    onGroupSelected,
}) => {
    const { t } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);
    const nodeTypeOptions = [
        { id: 'process', label: 'Process' },
        { id: 'decision', label: 'Decision' },
        { id: 'annotation', label: 'Note' },
        { id: 'journey', label: 'Journey' },
        { id: 'architecture', label: 'Architecture' },
        { id: 'class', label: 'Class' },
        { id: 'er_entity', label: 'Entity' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{ top: position.y, left: position.x }}
            className="absolute z-50 flex min-w-[200px] flex-col gap-0.5 rounded-[var(--radius-lg)] border border-slate-100 bg-white p-1.5 shadow-[var(--shadow-md)] animate-in fade-in zoom-in-95 duration-100"
        >
            {type === 'node' && (
                <>
                    <button onClick={onCopy} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        <Copy className="w-4 h-4" /> {t('common.copy')}
                    </button>
                    <button onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        <CopyPlus className="w-4 h-4" /> {t('common.duplicate')}
                    </button>

                    {onChangeNodeType ? (
                        <>
                            <div className="h-px bg-slate-100 my-1" />
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Switch type</div>
                            <div className="grid grid-cols-2 gap-1 px-2 pb-1">
                                {nodeTypeOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onChangeNodeType(option.id)}
                                        className={`rounded-[var(--radius-xs)] px-2 py-1.5 text-xs font-medium transition-colors ${
                                            currentNodeType === option.id
                                                ? 'bg-sky-50 text-sky-700'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : null}

                    <div className="h-px bg-slate-100 my-1" />

                    <button onClick={onBringToFront} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        <BringToFront className="w-4 h-4" /> {t('common.bringToFront')}
                    </button>
                    <button onClick={onSendToBack} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        <SendToBack className="w-4 h-4" /> {t('common.sendToBack')}
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button onClick={onDelete} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> {t('common.delete')}
                    </button>
                </>
            )}

            {type === 'pane' && (
                <>
                    <button
                        onClick={onPaste}
                        disabled={!canPaste}
                        className={`flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition-colors ${!canPaste ? 'cursor-not-allowed text-slate-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <ClipboardPaste className="w-4 h-4" /> {t('common.paste')}
                    </button>
                </>
            )}

            {type === 'edge' && (
                <>
                    <button onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        <Replace className="w-4 h-4" /> {t('common.reverseDirection')}
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button onClick={onDelete} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> {t('common.deleteConnection')}
                    </button>
                </>
            )}

            {type === 'multi' && (
                <>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('common.itemsSelected', { count: selectedCount })}
                    </div>

                    {/* Align */}
                    {onAlignNodes && (
                        <>
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">{t('common.align')}</div>
                            <div className="grid grid-cols-3 gap-0.5 px-2 pb-1">
                                <button onClick={() => onAlignNodes('left')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignLeft')}>
                                    <AlignStartVertical className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onAlignNodes('center')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignCenter')}>
                                    <AlignCenterVertical className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onAlignNodes('right')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignRight')}>
                                    <AlignEndVertical className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onAlignNodes('top')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignTop')}>
                                    <AlignStartHorizontal className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onAlignNodes('middle')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignMiddle')}>
                                    <AlignCenterHorizontal className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onAlignNodes('bottom')} className="flex items-center justify-center rounded-[var(--radius-xs)] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700" title={t('common.alignBottom')}>
                                    <AlignEndHorizontal className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Distribute */}
                    {onDistributeNodes && (
                        <>
                            <div className="h-px bg-slate-100 my-0.5" />
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">{t('common.distribute')}</div>
                            <button onClick={() => onDistributeNodes('horizontal')} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                <ArrowRightFromLine className="w-4 h-4" /> {t('common.distributeHorizontally')}
                            </button>
                            <button onClick={() => onDistributeNodes('vertical')} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                <ArrowDownFromLine className="w-4 h-4" /> {t('common.distributeVertically')}
                            </button>
                        </>
                    )}

                    {/* Group */}
                    {onGroupSelected && (
                        <>
                            <div className="h-px bg-slate-100 my-0.5" />
                            <button onClick={onGroupSelected} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-indigo-600 transition-colors hover:bg-indigo-50">
                                <Group className="w-4 h-4" /> {t('common.group')}
                            </button>
                        </>
                    )}

                    <div className="h-px bg-slate-100 my-0.5" />
                    <button onClick={onDelete} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> {t('common.delete')} ({selectedCount})
                    </button>
                </>
            )}
        </div>
    );
};
