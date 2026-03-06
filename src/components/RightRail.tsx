import React from 'react';

interface RightRailProps {
    children: React.ReactNode;
}

export function RightRail({ children }: RightRailProps): React.ReactElement {
    return (
        <aside
            className="h-full min-h-0 w-88 shrink-0 border-l border-slate-200/80 bg-[var(--brand-surface)]/88 backdrop-blur-xl"
        >
            <div className="h-full overflow-hidden">{children}</div>
        </aside>
    );
}
