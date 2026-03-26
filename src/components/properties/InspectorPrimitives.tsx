import React from 'react';

interface InspectorContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function InspectorSectionDivider(): React.ReactElement {
    return <hr className="mb-2 border-slate-100" />;
}

export function InspectorIntro({ children, className = '' }: InspectorContainerProps): React.ReactElement {
    return (
        <p className={`mb-3 text-xs text-slate-500 ${className}`.trim()}>
            {children}
        </p>
    );
}

export function InspectorFooter({ children, className = '' }: InspectorContainerProps): React.ReactElement {
    return (
        <div className={`mt-4 border-t border-slate-100 pt-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

export function InspectorSummaryCard({ children, className = '' }: InspectorContainerProps): React.ReactElement {
    return (
        <div className={`rounded-[var(--brand-radius)] border border-slate-200 bg-slate-50 p-3 ${className}`.trim()}>
            {children}
        </div>
    );
}

interface InspectorFieldProps {
    label: string;
    children: React.ReactNode;
    helper?: React.ReactNode;
    className?: string;
}

export function InspectorField({
    label,
    children,
    helper,
    className = '',
}: InspectorFieldProps): React.ReactElement {
    return (
        <div className={className}>
            <label className="text-xs font-semibold text-slate-600">{label}</label>
            <div className="mt-1">
                {children}
            </div>
            {helper ? (
                <div className="mt-2 text-[11px] text-slate-500">
                    {helper}
                </div>
            ) : null}
        </div>
    );
}

export const INSPECTOR_INPUT_CLASSNAME = 'w-full rounded-[var(--brand-radius)] border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]';
export const INSPECTOR_INPUT_COMPACT_CLASSNAME = 'w-full rounded-[var(--radius-sm)] border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
export const INSPECTOR_BUTTON_CLASSNAME = 'rounded-[var(--radius-sm)] border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50';
export const INSPECTOR_BUTTON_ACCENT_CLASSNAME = 'rounded-[var(--radius-sm)] border border-[var(--brand-primary-200)] bg-[var(--brand-primary-50)] px-2 py-1.5 text-xs font-medium text-[var(--brand-primary-700)] hover:border-[var(--brand-primary-300)] disabled:cursor-not-allowed disabled:opacity-50';
