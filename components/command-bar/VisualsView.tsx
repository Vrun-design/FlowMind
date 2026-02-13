import React from 'react';
import { Palette, Grid, Network, Zap } from 'lucide-react';
import { useFlowStore } from '../../store';
import { ViewHeader } from './ViewHeader';

interface VisualsViewProps {
    onBack: () => void;
}

export const VisualsView = ({ onBack }: VisualsViewProps) => {
    const { globalEdgeOptions, setGlobalEdgeOptions, viewSettings, setDefaultIconsEnabled, setSmartRoutingEnabled } = useFlowStore();

    return (
        <div className="flex flex-col h-full">
            <ViewHeader title="Global Visuals" icon={<Palette className="w-4 h-4 text-[var(--brand-primary)]" />} onBack={onBack} />

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Edge Style */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge Style</label>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Bezier (Default) */}
                        <div
                            onClick={() => setGlobalEdgeOptions({ type: 'default' })}
                            className={`p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all ${globalEdgeOptions.type === 'default' || globalEdgeOptions.type === 'bezier' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]' : 'border-slate-100 hover:border-[var(--brand-primary-200)]'}`}
                        >
                            <div className="font-medium text-sm text-slate-700">Bezier</div>
                            <div className="text-[10px] text-slate-400">Smooth curves</div>
                        </div>
                        {/* Straight */}
                        <div
                            onClick={() => setGlobalEdgeOptions({ type: 'straight' })}
                            className={`p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all ${globalEdgeOptions.type === 'straight' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]' : 'border-slate-100 hover:border-[var(--brand-primary-200)]'}`}
                        >
                            <div className="font-medium text-sm text-slate-700">Straight</div>
                            <div className="text-[10px] text-slate-400">Direct lines</div>
                        </div>
                        {/* Smooth Step */}
                        <div
                            onClick={() => setGlobalEdgeOptions({ type: 'smoothstep' })}
                            className={`p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all ${globalEdgeOptions.type === 'smoothstep' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]' : 'border-slate-100 hover:border-[var(--brand-primary-200)]'}`}
                        >
                            <div className="font-medium text-sm text-slate-700">Smooth Step</div>
                            <div className="text-[10px] text-slate-400">Rounded corners</div>
                        </div>
                        {/* Step */}
                        <div
                            onClick={() => setGlobalEdgeOptions({ type: 'step' })}
                            className={`p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all ${globalEdgeOptions.type === 'step' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]' : 'border-slate-100 hover:border-[var(--brand-primary-200)]'}`}
                        >
                            <div className="font-medium text-sm text-slate-700">Step</div>
                            <div className="text-[10px] text-slate-400">Right angles</div>
                        </div>
                    </div>
                </div>

                {/* Default Icons */}
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-[var(--radius-sm)]"><Grid className="w-4 h-4 text-slate-500" /></div>
                        <div>
                            <div className="font-medium text-sm text-slate-700">Default Icons</div>
                            <div className="text-[10px] text-slate-400">Show standard node icons</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setDefaultIconsEnabled(!viewSettings.defaultIconsEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${viewSettings.defaultIconsEnabled ? 'bg-[var(--brand-primary)]' : 'bg-slate-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${viewSettings.defaultIconsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Intelligent Routing */}
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-[var(--radius-sm)]"><Network className="w-4 h-4 text-emerald-500" /></div>
                        <div>
                            <div className="font-medium text-sm text-slate-700">Intelligent Routing</div>
                            <div className="text-[10px] text-slate-400">Auto-snap connections on drag</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSmartRoutingEnabled(!viewSettings.smartRoutingEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${viewSettings.smartRoutingEnabled ? 'bg-[var(--brand-primary)]' : 'bg-slate-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${viewSettings.smartRoutingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Animation */}
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-[var(--radius-sm)]"><Zap className="w-4 h-4 text-amber-500" /></div>
                        <div>
                            <div className="font-medium text-sm text-slate-700">Animated Edges</div>
                            <div className="text-[10px] text-slate-400">Flowing particles</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setGlobalEdgeOptions({ animated: !globalEdgeOptions.animated })}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${globalEdgeOptions.animated ? 'bg-[var(--brand-primary)]' : 'bg-slate-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${globalEdgeOptions.animated ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Stroke Width */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stroke Width</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(w => (
                            <button
                                key={w}
                                onClick={() => setGlobalEdgeOptions({ strokeWidth: w })}
                                className={`flex-1 h-10 rounded-[var(--radius-sm)] border font-medium text-sm transition-all
                                    ${globalEdgeOptions.strokeWidth === w ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]' : 'border-slate-200 text-slate-600 hover:border-[var(--brand-primary-200)]'}
                                `}
                            >
                                {w}px
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
