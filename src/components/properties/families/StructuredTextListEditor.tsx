import React from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { createPropertyInputKeyDownHandler } from '@/components/properties/propertyInputBehavior';

interface StructuredTextListEditorProps {
  title: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (items: string[]) => void;
}

function updateItem(items: string[], index: number, value: string): string[] {
  const nextItems = [...items];
  nextItems[index] = value;
  return nextItems;
}

function removeItem(items: string[], index: number): string[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function moveItem(items: string[], index: number, direction: -1 | 1): string[] {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

export function StructuredTextListEditor({
  title,
  items,
  placeholder,
  addLabel,
  onChange,
}: StructuredTextListEditorProps): React.ReactElement {
  const handleInputKeyDown = createPropertyInputKeyDownHandler({ blurOnEnter: true });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600">{title}</label>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
          onClick={() => onChange([...items, ''])}
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      </div>

      <div className="space-y-2 rounded-[var(--radius-lg)] border border-slate-200 bg-white p-2">
        {items.length > 0 ? items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(event) => onChange(updateItem(items, index, event.target.value))}
              onKeyDown={handleInputKeyDown}
              className="flex-1 rounded-[var(--radius-sm)] border border-slate-200 px-2 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
              placeholder={placeholder}
            />
            <button
              type="button"
              className="rounded-[var(--radius-xs)] border border-slate-200 p-1 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40"
              onClick={() => onChange(moveItem(items, index, -1))}
              disabled={index === 0}
              aria-label={`Move ${title} item up`}
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-xs)] border border-slate-200 p-1 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40"
              onClick={() => onChange(moveItem(items, index, 1))}
              disabled={index === items.length - 1}
              aria-label={`Move ${title} item down`}
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-xs)] border border-slate-200 p-1 text-slate-500 hover:border-rose-300 hover:text-rose-600"
              onClick={() => onChange(removeItem(items, index))}
              aria-label={`Remove ${title} item`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )) : (
          <button
            type="button"
            className="w-full rounded-[var(--radius-sm)] border border-dashed border-slate-200 px-3 py-2 text-left text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600"
            onClick={() => onChange([''])}
          >
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
