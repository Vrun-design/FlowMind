import React from 'react';
import { useFlowStore } from '../store';
import { X, Keyboard, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MousePointer2 } from 'lucide-react';

import { KEYBOARD_SHORTCUTS } from '../constants';

export const KeyboardShortcutsModal = () => {
    const { viewSettings, setShortcutsHelpOpen } = useFlowStore();
    const { isShortcutsHelpOpen } = viewSettings;

    if (!isShortcutsHelpOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Keyboard className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setShortcutsHelpOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                    {KEYBOARD_SHORTCUTS.map((section) => (
                        <div key={section.title} className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{section.title}</h3>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between group">
                                        <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900 transition-colors">{item.label}</span>
                                        <div className="flex gap-1">
                                            {item.keys.map((key, i) => (
                                                <kbd key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-500 min-w-[24px] text-center shadow-sm">
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        Pro tip: Hold <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold mx-1">Alt</kbd> to enable selection box while dragging.
                    </p>
                </div>
            </div>
        </div>
    );
};
