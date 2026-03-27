import React from 'react';

export interface SegmentedChoiceItem {
    id: string;
    label: React.ReactNode;
}

interface SegmentedChoiceProps {
    items: SegmentedChoiceItem[];
    selectedId?: string;
    onSelect: (id: string) => void;
    columns?: number;
    size?: 'sm' | 'md';
}

const GRID_COLUMNS: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
};

function getContainerPaddingClass(size: SegmentedChoiceProps['size']): string {
    return size === 'sm' ? 'p-0.5' : 'p-0.75';
}

function getItemClassName(selected: boolean, size: SegmentedChoiceProps['size']): string {
    const spacingClass = size === 'sm' ? 'min-h-8 px-2.5 py-1 text-[11px]' : 'min-h-10 px-3.5 py-2 text-[13px]';

    return `flex items-center justify-center rounded-[var(--radius-xs)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-200)] focus-visible:ring-offset-1 ${spacingClass} ${
        selected
            ? 'bg-white text-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary-200)]'
            : 'text-slate-500 hover:bg-white/85 hover:text-slate-700'
    }`;
}

export function SegmentedChoice({
    items,
    selectedId,
    onSelect,
    columns = 3,
    size = 'md',
}: SegmentedChoiceProps): React.ReactElement {
    const gridClass = GRID_COLUMNS[columns] || 'grid-cols-3';
    const paddingClass = getContainerPaddingClass(size);

    return (
        <div className={`grid ${gridClass} gap-1 rounded-[var(--radius-sm)] border border-slate-200/80 bg-slate-100/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${paddingClass}`}>
            {items.map((item) => {
                const selected = item.id === selectedId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={getItemClassName(selected, size)}
                        aria-pressed={selected}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
