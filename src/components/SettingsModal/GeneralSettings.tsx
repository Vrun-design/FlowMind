import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFlowStore } from '../../store';
import { Switch } from '../ui/Switch';
import { Grid, Magnet, Map } from 'lucide-react';

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const { viewSettings, toggleGrid, toggleSnap, toggleMiniMap } = useFlowStore();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('settingsModal.canvas.title')}</h3>
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
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-400">{description}</p>
            </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);
