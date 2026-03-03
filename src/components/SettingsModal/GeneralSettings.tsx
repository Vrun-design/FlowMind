import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFlowStore } from '../../store';
import { Switch } from '../ui/Switch';
import { Grid, Magnet, Map, Network, Zap } from 'lucide-react';
import type { GlobalEdgeOptions } from '@/lib/types';

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const {
        viewSettings,
        globalEdgeOptions,
        toggleGrid,
        toggleSnap,
        toggleMiniMap,
        setGlobalEdgeOptions,
        setDefaultIconsEnabled,
        setSmartRoutingEnabled,
        setLargeGraphSafetyMode,
    } = useFlowStore();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">{t('settingsModal.canvas.title')}</h3>
                <div className="space-y-2">
                    <SettingRow
                        icon={<Grid className="w-4 h-4" />}
                        label={t('settingsModal.canvas.showGrid')}
                        description={t('settingsModal.canvas.showGridDesc')}
                        checked={viewSettings.showGrid}
                        onChange={toggleGrid}
                    />
                    <SettingRow
                        icon={<Magnet className="w-4 h-4" />}
                        label={t('settingsModal.canvas.snapToGrid')}
                        description={t('settingsModal.canvas.snapToGridDesc')}
                        checked={viewSettings.snapToGrid}
                        onChange={toggleSnap}
                    />
                    <SettingRow
                        icon={<Map className="w-4 h-4" />}
                        label={t('settingsModal.canvas.miniMap')}
                        description={t('settingsModal.canvas.miniMapDesc')}
                        checked={viewSettings.showMiniMap}
                        onChange={toggleMiniMap}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-3">
                    {t('commandBar.visuals.title', 'Connection Styles')}
                </h3>
                <div className="space-y-3">
                    <div className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-3">
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-secondary)]">
                            {t('commandBar.visuals.edgeStyle')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { type: 'default', label: t('commandBar.visuals.bezier') },
                                { type: 'straight', label: t('commandBar.visuals.straight') },
                                { type: 'smoothstep', label: t('commandBar.visuals.smoothStep') },
                                { type: 'step', label: t('commandBar.visuals.step') },
                            ].map((style) => (
                                <button
                                    key={style.type}
                                    onClick={() => setGlobalEdgeOptions({ type: style.type as GlobalEdgeOptions['type'] })}
                                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                                        globalEdgeOptions.type === style.type
                                            || (style.type === 'default' && globalEdgeOptions.type === 'bezier')
                                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]'
                                            : 'border-[var(--color-brand-border)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]'
                                    }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <SettingRow
                        icon={<Network className="w-4 h-4" />}
                        label={t('commandBar.visuals.intelligentRouting')}
                        description={t('commandBar.visuals.intelligentRoutingDesc')}
                        checked={viewSettings.smartRoutingEnabled}
                        onChange={(checked) => setSmartRoutingEnabled(checked)}
                    />
                    <SettingRow
                        icon={<Zap className="w-4 h-4" />}
                        label={t('commandBar.visuals.animatedEdges')}
                        description={t('commandBar.visuals.animatedEdgesDesc')}
                        checked={globalEdgeOptions.animated}
                        onChange={(checked) => setGlobalEdgeOptions({ animated: checked })}
                    />
                    <SettingRow
                        icon={<Grid className="w-4 h-4" />}
                        label={t('commandBar.visuals.defaultIcons')}
                        description={t('commandBar.visuals.defaultIconsDesc')}
                        checked={viewSettings.defaultIconsEnabled}
                        onChange={(checked) => setDefaultIconsEnabled(checked)}
                    />

                    <div className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-3">
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-secondary)]">
                            {t('commandBar.visuals.strokeWidth')}
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((width) => (
                                <button
                                    key={width}
                                    onClick={() => setGlobalEdgeOptions({ strokeWidth: width })}
                                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                                        globalEdgeOptions.strokeWidth === width
                                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]'
                                            : 'border-[var(--color-brand-border)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]'
                                    }`}
                                >
                                    {width}px
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-3">
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-secondary)]">
                            {t('commandBar.visuals.largeGraphSafety', 'Large Graph Safety')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { mode: 'auto', label: t('commandBar.visuals.largeGraphSafetyAuto', 'Auto') },
                                { mode: 'on', label: t('commandBar.visuals.largeGraphSafetyOn', 'On') },
                                { mode: 'off', label: t('commandBar.visuals.largeGraphSafetyOff', 'Off') },
                            ].map((option) => (
                                <button
                                    key={option.mode}
                                    onClick={() => setLargeGraphSafetyMode(option.mode as 'auto' | 'on' | 'off')}
                                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                                        viewSettings.largeGraphSafetyMode === option.mode
                                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]'
                                            : 'border-[var(--color-brand-border)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingRow = ({
    icon, label, description, checked, onChange
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <div className="flex items-center justify-between p-3 bg-[var(--brand-surface)] rounded-xl border border-[var(--color-brand-border)] hover:border-[var(--brand-primary)] transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-background)] flex items-center justify-center text-[var(--brand-secondary)] border border-[var(--color-brand-border)]">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-[var(--brand-text)]">{label}</p>
                <p className="text-[11px] text-[var(--brand-secondary)]">{description}</p>
            </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);
