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
    return size === 'sm' ? 'p-0.5' : 'p-1';
}

function getItemClassName(selected: boolean, size: SegmentedChoiceProps['size']): string {
    const spacingClass = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

    return `flex items-center justify-center rounded-[var(--radius-xs)] font-medium transition-all duration-200 ${spacingClass} ${
        selected
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
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
        <div className={`grid ${gridClass} gap-1 rounded-[var(--radius-sm)] bg-slate-100/80 ${paddingClass}`}>
            {items.map((item) => {
                const selected = item.id === selectedId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={getItemClassName(selected, size)}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
