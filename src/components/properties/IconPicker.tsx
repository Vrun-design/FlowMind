import React, { useMemo, useState } from 'react';
import { Ban, Upload } from 'lucide-react';
import { ICON_NAMES, ICON_PICKER_PRIORITY_NAMES, NamedIcon } from '../IconMap';
import { Tooltip } from '../Tooltip';
import { IconSearchField, IconTileScrollGrid } from './IconTilePickerPrimitives';

const DEFAULT_ICON_COUNT = 48;
const SEARCH_RESULT_COUNT = 50;

function readFileAsDataUrl(file: File, onLoad: (result: string) => void): void {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            onLoad(reader.result);
        }
    };
    reader.readAsDataURL(file);
}

interface IconPickerProps {
    selectedIcon?: string;
    customIconUrl?: string;
    onChange: (icon: string) => void;
    onCustomIconChange: (url?: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
    selectedIcon,
    customIconUrl,
    onChange,
    onCustomIconChange
}) => {
    const [iconSearch, setIconSearch] = useState('');

    const filteredIcons = useMemo(() => {
        const term = iconSearch.toLowerCase();

        if (!term) {
            const others = ICON_NAMES.filter((name) => !ICON_PICKER_PRIORITY_NAMES.includes(name)).slice(0, DEFAULT_ICON_COUNT);
            return [...ICON_PICKER_PRIORITY_NAMES.filter((name) => ICON_NAMES.includes(name)), ...others];
        }

        return ICON_NAMES.filter((name) => name.toLowerCase().includes(term)).slice(0, SEARCH_RESULT_COUNT);
    }, [iconSearch]);

    function handleCustomIconFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        readFileAsDataUrl(file, onCustomIconChange);
    }

    return (
        <div className="space-y-3">
            <IconSearchField
                value={iconSearch}
                onChange={(event) => setIconSearch(event.target.value)}
                placeholder="Search icons..."
            />

            <IconTileScrollGrid>
                <Tooltip text="No Icon" className="block w-full aspect-square">
                    <button
                        onClick={() => onChange('none')}
                        className={`
                            h-full w-full p-2 rounded-lg flex items-center justify-center transition-all
                            ${selectedIcon === 'none'
                                ? 'bg-red-100 text-red-600 ring-1 ring-red-400'
                                : 'hover:bg-white hover:shadow-sm text-slate-400'
                            }
                        `}
                        aria-label="No Icon"
                    >
                        <Ban className="w-5 h-5" />
                    </button>
                </Tooltip>

                {filteredIcons.map((key) => (
                    <Tooltip key={key} text={key} className="block w-full aspect-square">
                        <button
                            onClick={() => onChange(key)}
                            className={`
                                h-full w-full p-2 rounded-lg flex items-center justify-center transition-all
                                ${selectedIcon === key
                                    ? 'bg-[var(--brand-primary-100)] text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary-400)]'
                                    : 'hover:bg-[var(--brand-surface)] hover:shadow-sm text-[var(--brand-secondary)]'
                                }
                            `}
                            aria-label={key}
                        >
                            <NamedIcon name={key} className="w-5 h-5" />
                        </button>
                    </Tooltip>
                ))}
            </IconTileScrollGrid>

            <div className="flex items-center gap-2">
                {customIconUrl ? (
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                            <img src={customIconUrl} alt="custom" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="text-xs text-slate-500 flex-1">Custom icon</span>
                        <button
                            onClick={() => onCustomIconChange(undefined)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <label className="flex items-center gap-2 w-full px-3 py-2 border border-dashed border-slate-300 rounded-[var(--brand-radius)] hover:bg-[var(--brand-background)] hover:border-[var(--brand-primary-400)] transition-all cursor-pointer text-xs text-[var(--brand-secondary)] hover:text-[var(--brand-primary)]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload custom icon</span>
                        <input
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleCustomIconFileChange}
                        />
                    </label>
                )}
            </div>
        </div>
    );
};
