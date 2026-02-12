import React, { useState } from 'react';
import {
  Undo2, Redo2, MousePointer2, Hand, Wand2, Plus,
  Square, StickyNote, Group, Type, Layout, Workflow,
  Maximize, Trash2, Image as ImageIcon, Palette
} from 'lucide-react';
import { Button } from './ui/Button';
import { Tooltip } from './Tooltip';
import { Node, Edge } from 'reactflow';

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
  onDesignSystemPanel: () => void;
  isDesignSystemPanelOpen: boolean;
  onAddNode: (position: { x: number, y: number }) => void;
  onAddAnnotation: (position: { x: number, y: number }) => void;
  onAddSection: (position: { x: number, y: number }) => void;
  onAddText: (position: { x: number, y: number }) => void;
  onAddImage: (imageUrl: string, position: { x: number, y: number }) => void;
  onTemplates: () => void;
  onLayout: () => void;
  onFitView: () => void;
  onClear: () => void;
  getCenter: () => { x: number, y: number };
}

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-slate-200 mx-1" />
);

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
  onDesignSystemPanel,
  isDesignSystemPanelOpen,
  onAddNode,
  onAddAnnotation,
  onAddSection,
  onAddText,
  onAddImage,
  onTemplates,
  onLayout,
  onFitView,
  onClear,
  getCenter
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) {
          onAddImage(imageUrl, getCenter());
          setShowAddMenu(false);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transform-gpu">
      <div className="flex items-center p-1.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl border border-slate-100 ring-1 ring-slate-900/5">

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* Group 1: Undo/Redo */}
        <div className="flex items-center gap-0.5 px-1">
          <Tooltip text="Undo (Ctrl+Z)">
            <Button
              onClick={onUndo}
              disabled={!canUndo}
              variant="ghost"
              size="icon"
              className="rounded-xl"
              icon={<Undo2 className="w-4 h-4" />}
            />
          </Tooltip>
          <Tooltip text="Redo (Ctrl+Y)">
            <Button
              onClick={onRedo}
              disabled={!canRedo}
              variant="ghost"
              size="icon"
              className="rounded-xl"
              icon={<Redo2 className="w-4 h-4" />}
            />
          </Tooltip>
        </div>

        <ToolbarDivider />

        {/* Group 2: Mode Selection */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-0.5 mx-1">
          <Tooltip text="Select Mode">
            <Button
              onClick={onToggleSelectMode}
              variant="ghost"
              size="icon"
              className={`rounded-lg h-8 w-8 ${isSelectMode ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              icon={<MousePointer2 className="w-4 h-4" />}
            />
          </Tooltip>
          <Tooltip text="Pan Mode">
            <Button
              onClick={onTogglePanMode}
              variant="ghost"
              size="icon"
              className={`rounded-lg h-8 w-8 ${!isSelectMode ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              icon={<Hand className="w-4 h-4" />}
            />
          </Tooltip>
        </div>

        <ToolbarDivider />

        {/* Group 3: Core Actions */}
        <div className="flex items-center gap-0.5 px-1">
          <Tooltip text="Design Systems">
            <Button
              onClick={onDesignSystemPanel}
              variant="ghost"
              size="icon"
              className={`rounded-xl ${isDesignSystemPanelOpen ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              icon={<Palette className="w-4 h-4" />}
            />
          </Tooltip>

          <Tooltip text="Command Bar">
            <Button
              onClick={onCommandBar}
              variant="ghost"
              size="icon"
              className={`rounded-xl relative overflow-hidden group ${isCommandBarOpen ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            >
              <Wand2 className="w-4 h-4" />
              <div className="absolute inset-0 bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Tooltip>

          <div className="relative">
            <Tooltip text="Add Item">
              <Button
                onClick={() => setShowAddMenu(!showAddMenu)}
                variant="ghost"
                size="icon"
                className={`rounded-xl ${showAddMenu ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                icon={<Plus className="w-4 h-4" />}
              />
            </Tooltip>

            {showAddMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-1 flex flex-col gap-0.5 z-50 animate-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                <Button onClick={() => { onAddNode(getCenter()); setShowAddMenu(false); }} variant="ghost" className="w-full justify-start h-8 px-2 text-xs" icon={<Square className="w-4 h-4 text-slate-400" />}>
                  Node
                </Button>
                <Button onClick={() => { onAddAnnotation(getCenter()); setShowAddMenu(false); }} variant="ghost" className="w-full justify-start h-8 px-2 text-xs" icon={<StickyNote className="w-4 h-4 text-yellow-500" />}>
                  Note
                </Button>
                <Button onClick={() => { onAddSection(getCenter()); setShowAddMenu(false); }} variant="ghost" className="w-full justify-start h-8 px-2 text-xs" icon={<Group className="w-4 h-4 text-blue-500" />}>
                  Section
                </Button>
                <Button onClick={() => { onAddText(getCenter()); setShowAddMenu(false); }} variant="ghost" className="w-full justify-start h-8 px-2 text-xs" icon={<Type className="w-4 h-4 text-slate-500" />}>
                  Text
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="ghost" className="w-full justify-start h-8 px-2 text-xs" icon={<ImageIcon className="w-4 h-4 text-pink-500" />}>
                  Image
                </Button>
              </div>
            )}
          </div>

          <Tooltip text="Templates">
            <Button
              onClick={onTemplates}
              variant="ghost"
              size="icon"
              className="rounded-xl"
              icon={<Layout className="w-4 h-4" />}
            />
          </Tooltip>
        </div>

        <ToolbarDivider />

        {/* Group 4: Layout & View */}
        <div className="flex items-center gap-0.5 px-1">
          <Tooltip text="Layout Studio">
            <Button
              onClick={() => onLayout()}
              variant="ghost"
              size="icon"
              className="rounded-xl text-amber-500 hover:text-amber-600"
              icon={<Workflow className="w-4 h-4" />}
            />
          </Tooltip>

          <Tooltip text="Fit View">
            <Button
              onClick={onFitView}
              variant="ghost"
              size="icon"
              className="rounded-xl"
              icon={<Maximize className="w-4 h-4" />}
            />
          </Tooltip>
        </div>

        <ToolbarDivider />

        {/* Clear */}
        <div className="flex items-center px-1">
          <Tooltip text="Clear Canvas">
            <Button
              onClick={onClear}
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-red-50 hover:text-red-600 group"
              icon={<Trash2 className="w-4 h-4 group-hover:stroke-red-600 transition-colors" />}
            />
          </Tooltip>
        </div>

      </div>
    </div>
  );
};