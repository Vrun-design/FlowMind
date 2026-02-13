import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ViewHeader } from './ViewHeader';

interface AIViewProps {
    searchQuery: string;
    onAIGenerate: (prompt: string) => Promise<void>;
    onClose: () => void;
    handleBack: () => void;
    isGenerating: boolean;
}

export const AIView = ({
    searchQuery,
    onAIGenerate,
    onClose,
    handleBack,
    isGenerating
}: AIViewProps) => {
    const [prompt, setPrompt] = useState(searchQuery || '');

    const handleGenerate = async (text?: string) => {
        const promptText = text || prompt;
        if (!promptText.trim()) return;
        await onAIGenerate(promptText);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleGenerate();
        }
    };

    const EXAMPLES = [
        "User registration flow with email verification",
        "E-commerce checkout process with payment gateway failure handling",
        "Git feature branch workflow",
        "CI/CD pipeline architecture",
        "Oauth2 login flow"
    ];

    return (
        <div className="flex flex-col h-full">
            <ViewHeader title="Ask AI" icon={<Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />} onBack={handleBack} />
            <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="relative flex-1">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the flow you want to build..."
                        className="w-full h-full p-4 rounded-[var(--radius-md)] border border-slate-200 bg-slate-50/50 text-base focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none resize-none transition-all"
                        autoFocus
                    />
                    <div className="absolute bottom-4 right-4">
                        <Button
                            onClick={() => handleGenerate()}
                            disabled={!prompt.trim() || isGenerating}
                            variant="primary"
                            className={`flex items-center gap-2 shadow-lg transition-all ${isGenerating ? 'opacity-80' : ''}`}
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Generate Flow
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Try these examples</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => { setPrompt(ex); handleGenerate(ex); }}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-[var(--radius-sm)] text-xs text-slate-600 hover:border-[var(--brand-primary-300)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary-50)] transition-colors text-left"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
