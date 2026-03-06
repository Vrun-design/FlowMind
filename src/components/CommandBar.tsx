import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CommandBarProps, CommandView } from './command-bar/types';

import { RootView } from './command-bar/RootView';
import { TemplatesView } from './command-bar/TemplatesView';
import { SearchView } from './command-bar/SearchView';
import { LayoutView } from './command-bar/LayoutView';
import { LayersView } from './command-bar/LayersView';
import { PagesView } from './command-bar/PagesView';
import { LibrariesView } from './command-bar/LibrariesView';

import { DesignSystemView } from './command-bar/DesignSystemView';
import { WireframesView } from './command-bar/WireframesView';
import { useCommandBarCommands } from './command-bar/useCommandBarCommands';

type OpenCommandBarContentProps = Omit<CommandBarProps, 'isOpen'>;

function OpenCommandBarContent({
    onClose,
    nodes,
    onUndo,
    onRedo,
    onLayout,
    onSelectTemplate,
    onOpenStudioAI,
    onOpenStudioFlowMind,
    onOpenStudioMermaid,
    initialView = 'root',
    settings,
}: OpenCommandBarContentProps): React.ReactElement {
    const [view, setView] = useState<CommandView>(initialView);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const handleBack = useCallback(() => {
        if (view === 'root') {
            onClose();
        } else {
            setView('root');
            setSearchQuery('');
        }
    }, [view, onClose]);

    const commands = useCommandBarCommands({
        settings,
        onUndo,
        onRedo,
        onOpenStudioAI,
        onOpenStudioFlowMind,
        onOpenStudioMermaid,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 pointer-events-none">
            <button
                type="button"
                className="absolute inset-0 bg-black/5 pointer-events-auto transition-opacity"
                onClick={onClose}
                aria-label="Close command bar"
            />

            <div
                className="pointer-events-auto flex h-[500px] w-[640px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-white/50 bg-white/96 shadow-[0_28px_80px_rgba(15,23,42,0.16)] ring-1 ring-black/5 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {view === 'root' && (
                    <RootView
                        commands={commands}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                        onClose={onClose}
                        setView={setView}
                        inputRef={inputRef}
                    />
                )}
                {view === 'design-system' && (
                    <DesignSystemView
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'templates' && (
                    <TemplatesView
                        onSelectTemplate={onSelectTemplate}
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'layout' && (
                    <LayoutView
                        onLayout={onLayout}
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'search' && (
                    <SearchView
                        nodes={nodes}
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'wireframes' && (
                    <WireframesView
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'layers' && (
                    <LayersView
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'pages' && (
                    <PagesView
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}
                {view === 'libraries' && (
                    <LibrariesView
                        onClose={onClose}
                        handleBack={handleBack}
                    />
                )}

                {/* Footer (only show on root?) */}
                {view === 'root' && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/70 px-4 py-2.5 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 bg-white px-1 text-[10px] text-slate-500 shadow-sm">↵</span>
                                <span>Select</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 bg-white px-1 text-[10px] text-slate-500 shadow-sm">↑↓</span>
                                <span>Navigate</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 text-[10px] text-slate-500 shadow-sm">Esc</span>
                            <span>Close</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, ...props }) => {
    if (!isOpen) return null;
    return <OpenCommandBarContent {...props} />;
};
