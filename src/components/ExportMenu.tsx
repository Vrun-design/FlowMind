import React, { Suspense, lazy } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './Tooltip';
import { Button } from './ui/Button';
import { useExportMenu } from './useExportMenu';

const LazyExportMenuPanel = lazy(async () => {
    const module = await import('./ExportMenuPanel');
    return { default: module.ExportMenuPanel };
});

interface ExportMenuProps {
    onExportPNG: (format: 'png' | 'jpeg') => void;
    onExportSVG: () => void;
    onExportPDF: () => void;
    onExportAnimated: (format: 'video' | 'gif') => void;
    onExportReveal: (format: 'reveal-video' | 'reveal-gif') => void;
    onExportJSON: () => void;
    onExportMermaid: () => void;
    onExportPlantUML: () => void;
    onExportOpenFlowDSL: () => void;
    onExportFigma: () => void;
    onShare: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
    onExportPNG,
    onExportSVG,
    onExportPDF,
    onExportAnimated,
    onExportReveal,
    onExportJSON,
    onExportMermaid,
    onExportPlantUML,
    onExportOpenFlowDSL,
    onExportFigma,
    onShare,
}) => {
    const { t } = useTranslation();
    const exportLabel = t('export.title', 'Export');
    const { isOpen, menuRef, toggleMenu, handleSelect } = useExportMenu({
        onExportPNG,
        onExportSVG,
        onExportPDF,
        onExportAnimated,
        onExportReveal,
        onExportJSON,
        onExportMermaid,
        onExportPlantUML,
        onExportOpenFlowDSL,
        onExportFigma,
        onShare,
    });

    return (
        <div className="relative" ref={menuRef}>
            <Tooltip text={t('export.exportOrShare', 'Export or share this canvas')} side="bottom">
                <Button
                    onClick={toggleMenu}
                    data-testid="topnav-export"
                    size="sm"
                    aria-label={exportLabel}
                    className="h-10 w-10 px-0 sm:h-9 sm:w-auto sm:px-3"
                >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{exportLabel}</span>
                </Button>
            </Tooltip>

            {isOpen && (
                <Suspense fallback={null}>
                    <LazyExportMenuPanel onSelect={handleSelect} />
                </Suspense>
            )}
        </div>
    );
};
