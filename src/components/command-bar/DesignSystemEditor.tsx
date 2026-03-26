import { useState, type ReactElement } from 'react';
import { useDesignSystemActions, useDesignSystemById } from '@/store/designSystemHooks';
import { ArrowLeft, Palette, Type, Figma } from 'lucide-react';
import { Button } from '../ui/Button';
import { DesignSystem } from '@/lib/types';
import { FigmaImportPanel } from './FigmaImportPanel';
import type { FigmaImportResult } from '@/services/figmaImport/figmaApiClient';
import { SegmentedTabs } from '../ui/SegmentedTabs';

interface DesignSystemEditorProps {
    systemId: string;
    onBack: () => void;
}

type EditorTab = 'colors' | 'typography';
type UpdateDesignSystem = (id: string, updates: Partial<DesignSystem>) => void;

export function DesignSystemEditor({ systemId, onBack }: DesignSystemEditorProps): ReactElement {
    const { updateDesignSystem } = useDesignSystemActions();
    const system = useDesignSystemById(systemId);

    // Local state for the specific editor tab
    const [activeTab, setActiveTab] = useState<EditorTab>('colors');
    // Local state for system name editing
    const [name, setName] = useState(system?.name || '');

    if (!system) return <div>System not found</div>;

    const handleSaveName = () => {
        updateDesignSystem(systemId, { name });
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
                <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-[var(--radius-sm)]">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                </Button>
                <div className="flex-1">
                    <input
                        className="w-full bg-transparent font-semibold text-slate-700 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleSaveName}
                    />
                </div>
            </div>

            {/* Editor Tabs/Nav */}
            <div className="border-b border-slate-100 bg-white p-2">
                <SegmentedTabs
                    items={[
                        { id: 'colors', label: 'Colors', icon: <Palette className="w-3.5 h-3.5" /> },
                        { id: 'typography', label: 'Type', icon: <Type className="w-3.5 h-3.5" /> },
                    ]}
                    value={activeTab}
                    onChange={(value) => setActiveTab(value as EditorTab)}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50/30">
                {activeTab === 'colors' && <ColorEditor system={system} update={updateDesignSystem} />}
                {activeTab === 'typography' && <TypographyEditor system={system} update={updateDesignSystem} />}
            </div>
        </div>
    );
}

// UI Helpers
// Sub-Editors (Basic Stub)
const ColorEditor = ({ system, update }: { system: DesignSystem; update: UpdateDesignSystem }) => {
    const [showFigmaPanel, setShowFigmaPanel] = useState(false);

    const handleFigmaImport = (result: FigmaImportResult) => {
        const firstColor = result.colors[0]?.hex;
        const secondColor = result.colors[1]?.hex;
        const thirdColor = result.colors[2]?.hex;
        const updates: Partial<DesignSystem['colors']> = {};
        if (firstColor) updates.primary = firstColor;
        if (secondColor) updates.secondary = secondColor;
        if (thirdColor) updates.accent = thirdColor;

        const firstFont = result.fonts[0]?.fontFamily;
        if (firstFont || Object.keys(updates).length > 0) {
            update(system.id, {
                ...(Object.keys(updates).length > 0 ? { colors: { ...system.colors, ...updates } } : {}),
                ...(firstFont ? { typography: { ...system.typography, fontFamily: `${firstFont}, sans-serif` } } : {}),
            });
        }
        setShowFigmaPanel(false);
    };

    return (
        <div className="space-y-4">
            {showFigmaPanel ? (
                <FigmaImportPanel onImport={handleFigmaImport} onClose={() => setShowFigmaPanel(false)} />
            ) : (
                <button
                    onClick={() => setShowFigmaPanel(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-[#F24E1E]/50 hover:text-[#F24E1E] hover:bg-[#F24E1E]/5 transition-all text-xs font-medium"
                >
                    <Figma className="w-3.5 h-3.5" />
                    Import from Figma
                </button>
            )}
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Semantic Colors</h3>
            <div className="grid grid-cols-1 gap-3">
                <ColorInput label="Primary" value={system.colors.primary} onChange={(v) => update(system.id, { colors: { ...system.colors, primary: v } })} />
                <ColorInput label="Background" value={system.colors.background} onChange={(v) => update(system.id, { colors: { ...system.colors, background: v } })} />
                <ColorInput label="Surface" value={system.colors.surface} onChange={(v) => update(system.id, { colors: { ...system.colors, surface: v } })} />
            </div>
        </div>
    );
};

const TypographyEditor = ({ system, update }: { system: DesignSystem; update: UpdateDesignSystem }) => (
    <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Typography</h3>
        {/* Font List will go here */}
        <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="text-xs font-medium text-slate-700 block mb-2">Font Family</label>
            <select
                className="w-full text-sm border-slate-200 rounded-md"
                value={system.typography.fontFamily.split(',')[0].replace(/['"]/g, '')}
                onChange={(e) => update(system.id, { typography: { ...system.typography, fontFamily: `${e.target.value}, sans-serif` } })}
            >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
            </select>
        </div>
    </div>
);

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => (
    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 font-mono">{value}</div>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 rounded overflow-hidden border-none cursor-pointer"
            />
        </div>
    </div>
);
