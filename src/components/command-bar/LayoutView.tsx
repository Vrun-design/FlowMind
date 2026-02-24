import React, { useState } from 'react';
import { Zap, GitGraph, Network, Move, Maximize2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { ViewHeader } from './ViewHeader';
import { LayoutAlgorithm } from '../../services/elkLayout';
import { useFlowStore } from '../../store';
import { trackEvent } from '../../lib/analytics';

interface LayoutViewProps {
    onLayout?: (direction?: 'TB' | 'LR' | 'RL' | 'BT', algorithm?: LayoutAlgorithm, spacing?: 'compact' | 'normal' | 'loose') => void;
    onClose: () => void;
    handleBack: () => void;
}

const AlgorithmCard = ({ id, label, desc, icon, selected, onClick }: any) => {
    const isBeveled = useFlowStore(state => state.brandConfig.ui.buttonStyle === 'beveled');

    return (
        <div
            onClick={onClick}
            className={`
                relative p-3 rounded-[var(--radius-md)] bordercursor-pointer transition-all duration-200 active:scale-[0.98]
                ${selected
                    ? `border-[var(--brand-primary)] bg-[var(--brand-primary-50)]/50 ${isBeveled ? 'btn-beveled border-2' : 'border-2 ring-1 ring-[var(--brand-primary)]/20'}`
                    : `border-slate-100 bg-white hover:border-[var(--brand-primary-200)] ${isBeveled ? 'btn-beveled hover:bg-slate-50' : 'hover:bg-slate-50 border-2'}`}
            `}
        >
            <div className={`
                w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center mb-2 transition-colors
                ${selected ? 'bg-[var(--brand-primary)] text-white shadow-sm' : 'bg-slate-100 text-slate-500'}
            `}>
                {icon}
            </div>
            <div className="font-medium text-sm text-slate-700">{label}</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{desc}</div>
            {selected && (
                <div className="absolute top-3 right-3 text-[var(--brand-primary)]">
                    <Check className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};

const DirectionButton = ({ dir, label, selected, onClick }: any) => {
    const isBeveled = useFlowStore(state => state.brandConfig.ui.buttonStyle === 'beveled');
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all active:scale-95
                ${selected
                    ? `bg-white text-[var(--brand-primary)] ${isBeveled ? 'btn-beveled' : 'shadow-sm'}`
                    : 'text-slate-500 hover:text-slate-700'}
            `}
        >
            {label}
        </button>
    );
};

const SpacingButton = ({ id, label, selected, onClick }: any) => {
    const isBeveled = useFlowStore(state => state.brandConfig.ui.buttonStyle === 'beveled');
    return (
        <button
            onClick={onClick}
            className={`py-2 px-3 rounded-[var(--radius-sm)] border text-sm font-medium transition-all active:scale-95
                ${selected
                    ? `border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] ${isBeveled ? 'btn-beveled border-2' : ''}`
                    : `border-slate-200 bg-white text-slate-600 hover:border-slate-300 ${isBeveled ? 'btn-beveled' : ''}`}
            `}
        >
            {label}
        </button>
    );
};

export const LayoutView = ({
    onLayout,
    onClose,
    handleBack
}: LayoutViewProps) => {
    const { t } = useTranslation();
    const [algorithm, setAlgorithm] = useState<LayoutAlgorithm>('layered');
    const [direction, setDirection] = useState<'TB' | 'LR' | 'RL' | 'BT'>('TB');
    const [spacing, setSpacing] = useState<'compact' | 'normal' | 'loose'>('normal');

    const handleApply = () => {
        trackEvent('apply_layout', { algorithm, direction, spacing });
        onLayout?.(direction, algorithm, spacing);
        onClose();
    };

    return (
        <div className="flex flex-col h-full">
            <ViewHeader title={t('commandBar.layout.title')} icon={<Zap className="w-4 h-4 text-[var(--brand-primary)]" />} onBack={handleBack} />

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Algorithms */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('commandBar.layout.algorithm')}</label>
                    <div className="grid grid-cols-2 gap-3">
                        <AlgorithmCard
                            id="layered"
                            label={t('commandBar.layout.layered')}
                            desc={t('commandBar.layout.layeredDesc')}
                            icon={<GitGraph className="w-4 h-4" />}
                            selected={algorithm === 'layered'}
                            onClick={() => setAlgorithm('layered')}
                        />
                        <AlgorithmCard
                            id="mrtree"
                            label={t('commandBar.layout.tree')}
                            desc={t('commandBar.layout.treeDesc')}
                            icon={<Network className="w-4 h-4" />}
                            selected={algorithm === 'mrtree'}
                            onClick={() => setAlgorithm('mrtree')}
                        />
                        <AlgorithmCard
                            id="force"
                            label={t('commandBar.layout.force')}
                            desc={t('commandBar.layout.forceDesc')}
                            icon={<Move className="w-4 h-4" />}
                            selected={algorithm === 'force'}
                            onClick={() => setAlgorithm('force')}
                        />
                        <AlgorithmCard
                            id="radial"
                            label={t('commandBar.layout.radial')}
                            desc={t('commandBar.layout.radialDesc')}
                            icon={<Maximize2 className="w-4 h-4" />}
                            selected={algorithm === 'radial'}
                            onClick={() => setAlgorithm('radial')}
                        />
                    </div>
                </div>

                {/* Direction (Conditional) */}
                {(algorithm === 'layered' || algorithm === 'mrtree') && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('commandBar.layout.direction')}</label>
                        <div className="flex bg-slate-100 p-1 rounded-[var(--radius-sm)]">
                            <DirectionButton dir="TB" label={t('commandBar.layout.down')} selected={direction === 'TB'} onClick={() => setDirection('TB')} />
                            <DirectionButton dir="BT" label={t('commandBar.layout.up')} selected={direction === 'BT'} onClick={() => setDirection('BT')} />
                            <DirectionButton dir="LR" label={t('commandBar.layout.right')} selected={direction === 'LR'} onClick={() => setDirection('LR')} />
                            <DirectionButton dir="RL" label={t('commandBar.layout.left')} selected={direction === 'RL'} onClick={() => setDirection('RL')} />
                        </div>
                    </div>
                )}

                {/* Spacing */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('commandBar.layout.spacing')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        <SpacingButton id="compact" label={t('commandBar.layout.compact')} selected={spacing === 'compact'} onClick={() => setSpacing('compact')} />
                        <SpacingButton id="normal" label={t('commandBar.layout.normal')} selected={spacing === 'normal'} onClick={() => setSpacing('normal')} />
                        <SpacingButton id="loose" label={t('commandBar.layout.loose')} selected={spacing === 'loose'} onClick={() => setSpacing('loose')} />
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Button
                    onClick={handleApply}
                    variant="primary"
                    className="w-full py-2.5 h-auto rounded-[var(--radius-md)] shadow-sm shadow-[var(--brand-primary-200)] justify-center"
                >
                    <Zap className="w-4 h-4 mr-2" />
                    {t('commandBar.layout.applyLayout')}
                </Button>
            </div>
        </div>
    );
};
