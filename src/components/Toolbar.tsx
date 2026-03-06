import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  WandSparkles,
  Trash2,
  Workflow,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Tooltip } from './Tooltip';
import { ToolbarAddMenu } from './toolbar/ToolbarAddMenu';
import { ToolbarHistoryControls } from './toolbar/ToolbarHistoryControls';
import { ToolbarModeControls } from './toolbar/ToolbarModeControls';
import { getToolbarIconButtonClass, TOOLBAR_DIVIDER_CLASS } from './toolbar/toolbarButtonStyles';

interface ToolbarProps {
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  onTogglePanMode: () => void;
  onCommandBar: () => void;
  isCommandBarOpen: boolean;
  onToggleStudio: () => void;
  isStudioOpen: boolean;
  onAddNode: (position: { x: number, y: number }) => void;
  onAddAnnotation: (position: { x: number, y: number }) => void;
  onAddSection: (position: { x: number, y: number }) => void;
  onAddText: (position: { x: number, y: number }) => void;
  onAddImage: (imageUrl: string, position: { x: number, y: number }) => void;
  onAddWireframes: () => void;
  onLayout: () => void;
  onClear: () => void;
  getCenter: () => { x: number, y: number };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onToggleSelectMode,
  isSelectMode,
  onTogglePanMode,
  onCommandBar,
  isCommandBarOpen,
  onToggleStudio,
  isStudioOpen,
  onAddNode,
  onAddAnnotation,
  onAddSection,
  onAddText,
  onAddImage,
  onAddWireframes,
  onLayout,
  onClear,
  getCenter
}) => {
  const { t } = useTranslation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const flowPilotIconClass = `w-4 h-4 transition-transform ${isStudioOpen ? 'scale-110 text-[var(--brand-primary)]' : 'group-hover:scale-110'}`;

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as globalThis.Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCommandBarOpen || isStudioOpen) {
      setShowAddMenu(false);
    }
  }, [isCommandBarOpen, isStudioOpen]);

  // Interaction guard: If command bar is open, disable all toolbar interactions
  const isInteractive = !isCommandBarOpen;

  const containerClasses = `flex items-center p-1.5 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[var(--radius-lg)] border border-white/20 ring-1 ring-black/5 transition-all duration-300 ${!isInteractive ? 'opacity-50 pointer-events-none grayscale' : ''}`;

  return (
    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 ${containerClasses}`}>
      {/* Group 1: Tools */}
      <ToolbarModeControls
        isInteractive={isInteractive}
        isSelectMode={isSelectMode}
        onToggleSelectMode={onToggleSelectMode}
        onTogglePanMode={onTogglePanMode}
      />

      <div className={`mx-2 ${TOOLBAR_DIVIDER_CLASS}`} />

      {/* Group 2: Actions */}
      <div className="flex items-center gap-1">
        <Tooltip text={t('toolbar.flowpilotAI', 'Open FlowPilot')}>
          <Button
            onClick={onToggleStudio}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={`${getToolbarIconButtonClass({ active: isStudioOpen })} group relative overflow-hidden`}
          >
            <WandSparkles className={flowPilotIconClass} />
          </Button>
        </Tooltip>

        <div ref={addMenuRef}>
          <ToolbarAddMenu
            isInteractive={isInteractive}
            showAddMenu={showAddMenu}
            onToggleMenu={() => setShowAddMenu(!showAddMenu)}
            onCloseMenu={() => setShowAddMenu(false)}
            onAddNode={onAddNode}
            onAddAnnotation={onAddAnnotation}
            onAddSection={onAddSection}
            onAddText={onAddText}
            onAddImage={onAddImage}
            onAddWireframes={onAddWireframes}
            getCenter={getCenter}
          />
        </div>

        <Tooltip text={t('toolbar.commandBar', 'Open command bar')}>
          <Button
            onClick={onCommandBar}
            disabled={!isInteractive}
            variant="primary"
            size="icon"
            className={`group h-10 w-10 rounded-[var(--radius-md)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all hover:scale-105 active:scale-95 ${isCommandBarOpen ? 'bg-slate-800 hover:bg-slate-900' : 'bg-[var(--brand-primary)] hover:brightness-110'}`}
            icon={<Plus className={`w-5 h-5 text-white transition-transform duration-200 ${isCommandBarOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} />}
          />
        </Tooltip>

        <Tooltip text={t('toolbar.autoLayout')}>
          <Button
            onClick={() => onLayout()}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={getToolbarIconButtonClass()}
            icon={<Workflow className="w-4 h-4 transition-transform group-hover:scale-110" />}
          />
        </Tooltip>

        <Tooltip text={t('toolbar.clearCanvas')}>
          <Button
            onClick={onClear}
            disabled={!isInteractive}
            variant="ghost"
            size="icon"
            className={getToolbarIconButtonClass()}
            icon={<Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />}
          />
        </Tooltip>
      </div>

      <div className={`mx-2 ${TOOLBAR_DIVIDER_CLASS}`} />

      {/* Group 3: History */}
      <ToolbarHistoryControls
        isInteractive={isInteractive}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </div>
  );
};
