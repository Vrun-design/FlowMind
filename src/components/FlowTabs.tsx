import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { IS_BEVELED } from '@/lib/brand';
import { useTranslation } from 'react-i18next';
import { getSegmentedTabButtonClass } from './ui/SegmentedTabs';
import type { EditorPage } from '@/store/editorPageHooks';

interface FlowTabsProps {
  pages: EditorPage[];
  activePageId: string;
  onSwitchPage: (pageId: string) => void;
  onAddPage: () => void;
  onClosePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
}

export const FlowTabs: React.FC<FlowTabsProps> = ({
  pages,
  activePageId,
  onSwitchPage,
  onAddPage,
  onClosePage,
  onRenamePage,
}) => {
  const { t } = useTranslation();
  const isBeveled = IS_BEVELED;
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const activeTabClassName = `${getSegmentedTabButtonClass(true, 'sm')} h-10 sm:h-9 border-[var(--brand-primary-200)] bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)]`;
  const inactiveTabClassName = `${getSegmentedTabButtonClass(false, 'sm')} h-10 sm:h-9 border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700`;

  const handleStartEdit = (page: EditorPage) => {
    setEditingTabId(page.id);
    setEditName(page.name);
  };

  const handleFinishEdit = () => {
    if (editingTabId && editName.trim()) {
      onRenamePage(editingTabId, editName.trim());
    }
    setEditingTabId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditName('');
    }
  };

  return (
    <div className="pointer-events-auto flex min-w-0 items-center justify-center px-2 sm:px-4">
      <div className="flex max-w-full min-w-0 items-center gap-1 overflow-x-auto no-scrollbar">
        {pages.map((page) => (
          <div
            key={page.id}
            data-testid="flow-page-tab"
            className={`
              group relative flex items-center gap-2 cursor-pointer select-none transition-all
              ${activePageId === page.id
                ? activeTabClassName
                : inactiveTabClassName
              }
            `}
            onClick={() => onSwitchPage(page.id)}
            onDoubleClick={() => handleStartEdit(page)}
            title={page.name}
          >
            {editingTabId === page.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                className="bg-white border border-[var(--brand-primary-300)] rounded-[var(--radius-xs)] px-1 py-0 text-xs font-medium w-24 outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="max-w-[96px] truncate text-xs sm:max-w-[120px]">{page.name}</span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClosePage(page.id);
              }}
              title={t('flowTabs.closeTab', 'Close page')}
              className={`
                rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100 hover:bg-slate-200
                ${activePageId === page.id ? 'text-[var(--brand-primary-400)] hover:text-[var(--brand-primary)]' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          onClick={onAddPage}
          data-testid="flow-page-add"
          className={`ml-1 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] sm:h-9 sm:w-9 ${isBeveled ? 'btn-beveled bg-white' : ''}`}
          title={t('flowTabs.newFlowTab', 'New page')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div >
  );
};
