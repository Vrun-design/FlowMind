import React from 'react';

export interface SegmentedTabItem {
    id: string;
    label: React.ReactNode;
    count?: number;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface SegmentedTabsProps {
    items: SegmentedTabItem[];
    value: string;
    onChange: (id: string) => void;
    className?: string;
    listClassName?: string;
    size?: 'sm' | 'md';
}

export function getSegmentedTabButtonClass(selected: boolean, size: 'sm' | 'md' = 'md'): string {
    const sizeClassName = size === 'sm'
        ? 'h-8 rounded-[var(--radius-sm)] px-3 text-xs'
        : 'h-9 rounded-[var(--radius-sm)] px-3 text-xs';
    return `${sizeClassName} inline-flex shrink-0 items-center gap-2 border font-semibold transition-colors`;
}

export function getSegmentedTabCountClass(selected: boolean): string {
    return selected ? 'text-[var(--brand-primary-400)]' : 'text-slate-400';
}

export function SegmentedTabs({
    items,
    value,
    onChange,
    className = '',
    listClassName = '',
    size = 'md',
}: SegmentedTabsProps): React.ReactElement {
    return (
        <div className={`overflow-x-auto pb-1 no-scrollbar ${className}`.trim()}>
            <div className={`flex min-w-max gap-2 ${listClassName}`.trim()}>
                {items.map((item) => {
                    const selected = item.id === value;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onChange(item.id)}
                            disabled={item.disabled}
                            className={`${getSegmentedTabButtonClass(selected, size)} ${selected
                                ? 'border-[var(--brand-primary-200)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                                } ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`.trim()}
                        >
                            {item.icon ? <span className="flex h-3.5 w-3.5 items-center justify-center">{item.icon}</span> : null}
                            <span>{item.label}</span>
                            {typeof item.count === 'number' ? (
                                <span className={`text-[10px] ${getSegmentedTabCountClass(selected)}`}>
                                    {item.count}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
