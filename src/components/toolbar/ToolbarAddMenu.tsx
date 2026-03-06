import React, { useRef } from 'react';
import {
    AppWindow,
    Group,
    Image as ImageIcon,
    Square,
    StickyNote,
    Type,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Tooltip } from '../Tooltip';
import { getToolbarIconButtonClass } from './toolbarButtonStyles';

interface ToolbarAddMenuProps {
    isInteractive: boolean;
    showAddMenu: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onAddNode: (position: { x: number; y: number }) => void;
    onAddAnnotation: (position: { x: number; y: number }) => void;
    onAddSection: (position: { x: number; y: number }) => void;
    onAddText: (position: { x: number; y: number }) => void;
    onAddImage: (imageUrl: string, position: { x: number; y: number }) => void;
    onAddWireframes: () => void;
    getCenter: () => { x: number; y: number };
}

export function ToolbarAddMenu({
    isInteractive,
    showAddMenu,
    onToggleMenu,
    onCloseMenu,
    onAddNode,
    onAddAnnotation,
    onAddSection,
    onAddText,
    onAddImage,
    onAddWireframes,
    getCenter,
}: ToolbarAddMenuProps): React.ReactElement {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toggleIconClass = `w-4 h-4 transition-transform ${showAddMenu ? 'scale-110 text-[var(--brand-primary)]' : 'group-hover:scale-110'}`;

    function addNodeAtCenter(handler: (position: { x: number; y: number }) => void): void {
        handler(getCenter());
        onCloseMenu();
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const imageUrl = loadEvent.target?.result as string;
                if (imageUrl) {
                    onAddImage(imageUrl, getCenter());
                    onCloseMenu();
                }
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    }

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            <Tooltip text={t('toolbar.addToCanvas')}>
                <Button
                    onClick={onToggleMenu}
                    disabled={!isInteractive}
                    data-testid="toolbar-add-toggle"
                    variant="ghost"
                    size="icon"
                    className={getToolbarIconButtonClass({ active: showAddMenu })}
                    icon={<Square className={toggleIconClass} />}
                />
            </Tooltip>

            {showAddMenu && isInteractive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white/95 backdrop-blur-md rounded-[var(--radius-lg)] shadow-xl border border-white/20 ring-1 ring-black/5 p-1 flex flex-col gap-0.5 z-50 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 origin-bottom pointer-events-auto">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('toolbar.addToCanvas')}</div>

                    <Button
                        onClick={() => {
                            addNodeAtCenter(onAddNode);
                        }}
                        data-testid="toolbar-add-node"
                        variant="ghost"
                        className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-indigo-50 hover:text-[var(--brand-primary)] transition-colors"
                        icon={<Square className="w-4 h-4 mr-2" />}
                    >
                        <span>{t('toolbar.node')}</span>
                    </Button>

                    <Button onClick={() => addNodeAtCenter(onAddAnnotation)} variant="ghost" className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-yellow-50 hover:text-yellow-600 transition-colors" icon={<StickyNote className="w-4 h-4 mr-2" />}>
                        {t('toolbar.stickyNote')}
                    </Button>
                    <Button onClick={() => addNodeAtCenter(onAddSection)} variant="ghost" className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-blue-50 hover:text-blue-600 transition-colors" icon={<Group className="w-4 h-4 mr-2" />}>
                        {t('toolbar.section')}
                    </Button>
                    <Button onClick={() => addNodeAtCenter(onAddText)} variant="ghost" className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-slate-100 transition-colors" icon={<Type className="w-4 h-4 mr-2" />}>
                        {t('toolbar.text')}
                    </Button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <Button onClick={() => { onAddWireframes(); onCloseMenu(); }} variant="ghost" className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] transition-colors" icon={<AppWindow className="w-4 h-4 mr-2" />}>
                        {t('toolbar.wireframes')}
                    </Button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <Button onClick={() => fileInputRef.current?.click()} variant="ghost" className="w-full justify-start h-9 px-3 text-sm rounded-[var(--radius-sm)] hover:bg-pink-50 hover:text-pink-600 transition-colors" icon={<ImageIcon className="w-4 h-4 mr-2" />}>
                        {t('toolbar.image')}
                    </Button>
                </div>
            )}
        </div>
    );
}
