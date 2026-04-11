import React, { memo, useMemo } from 'react';
import { useNodes, type LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { getNodeParentId } from '@/lib/nodeParent';
import { Group, Lock, EyeOff } from 'lucide-react';
import { NamedIcon } from './IconMap';
import { getNumericNodeDimension } from './nodeHelpers';
import { resolveSectionVisualStyle } from '../theme';
import { useInlineNodeTextEdit } from '@/hooks/useInlineNodeTextEdit';
import { InlineTextEditSurface } from './InlineTextEditSurface';
import { NodeChrome } from './NodeChrome';
import { useSelectionState } from '@/store/selectionHooks';
import { readMermaidImportedNodeMetadataFromData } from '@/services/mermaid/importProvenance';

type SectionRenderVariant = 'default' | 'mermaid-import';

interface SectionRenderConfig {
  variant: SectionRenderVariant;
  bodyBorderRadius: string;
  bodyInset: number;
  titleTop: number;
  titleLeft: number;
  titlePadding: string;
  titleBackgroundColor: string;
  titleMaxWidth: string;
  showLeadingIcon: boolean;
  showImportedBadge: boolean;
  showChildCount: boolean;
}

function getSectionRenderConfig(
  isImportedMermaidContainer: boolean,
  borderColor: string
): SectionRenderConfig {
  if (isImportedMermaidContainer) {
    return {
      variant: 'mermaid-import',
      bodyBorderRadius: '12px',
      bodyInset: 0,
      titleTop: 8,
      titleLeft: 10,
      titlePadding: '0.15rem 0.45rem',
      titleBackgroundColor: 'rgba(255,255,255,0.9)',
      titleMaxWidth: 'calc(100% - 72px)',
      showLeadingIcon: false,
      showImportedBadge: true,
      showChildCount: false,
    };
  }

  return {
    variant: 'default',
    bodyBorderRadius: '16px',
    bodyInset: 0,
    titleTop: -36,
    titleLeft: 0,
    titlePadding: '0.375rem 0.625rem',
    titleBackgroundColor: `${borderColor}22`,
    titleMaxWidth: 'calc(100% - 8px)',
    showLeadingIcon: true,
    showImportedBadge: true,
    showChildCount: true,
  };
}

function SectionNode(props: LegacyNodeProps<NodeData>): React.ReactElement {
  const { id, data, selected } = props;
  const explicitNodeStyle = (props as { style?: React.CSSProperties }).style;
  const explicitWidth = getNumericNodeDimension(explicitNodeStyle?.width);
  const explicitHeight = getNumericNodeDimension(explicitNodeStyle?.height);
  const allNodes = useNodes();
  const { hoveredSectionId } = useSelectionState();
  const theme = resolveSectionVisualStyle(data.color, data.colorMode, data.customColor, 'blue');
  const iconName = data.icon || 'Group';
  const labelEdit = useInlineNodeTextEdit(id, 'label', data.label || '');
  const subLabelEdit = useInlineNodeTextEdit(id, 'subLabel', data.subLabel || '');
  const childCount = useMemo(
    () => allNodes.filter((node) => getNodeParentId(node) === id).length,
    [allNodes, id]
  );
  const isDropTarget = hoveredSectionId === id;
  const isLocked = data.sectionLocked === true;
  const isHidden = data.sectionHidden === true;
  const isImportedMermaidContainer =
    readMermaidImportedNodeMetadataFromData(data)?.role === 'container';
  const minWidth = isImportedMermaidContainer ? explicitWidth ?? 350 : 350;
  const minHeight = isImportedMermaidContainer ? explicitHeight ?? 250 : 250;

  const borderColor = isDropTarget ? theme.title : theme.border;
  const bgColor = isDropTarget
    ? `color-mix(in srgb, ${theme.bg} 85%, white 15%)`
    : theme.bg;
  const renderConfig = getSectionRenderConfig(isImportedMermaidContainer, borderColor);

  return (
    <NodeChrome
      nodeId={id}
      selected={Boolean(selected)}
      minWidth={minWidth}
      minHeight={minHeight}
      handleClassName="!w-3 !h-3 !border-2 !border-white transition-opacity"
      handleVisibilityOptions={{ includeConnectingState: false }}
    >
      <div
        className={`group relative w-full h-full ${selected ? 'z-10' : ''}`}
        style={{ minWidth, minHeight }}
        data-section-render-variant={renderConfig.variant}
      >
        <div
          className="pointer-events-auto absolute left-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{
            top: renderConfig.titleTop,
            left: renderConfig.titleLeft,
            padding: renderConfig.titlePadding,
            backgroundColor: renderConfig.titleBackgroundColor,
            maxWidth: renderConfig.titleMaxWidth,
            zIndex: 1,
          }}
        >
          {renderConfig.showLeadingIcon ? (
            iconName ? (
              <NamedIcon
                name={iconName}
                fallbackName="Group"
                className="w-3.5 h-3.5 shrink-0 flow-lod-far-target"
                style={{ color: theme.title }}
              />
            ) : (
              <Group
                className="w-3.5 h-3.5 shrink-0 flow-lod-far-target"
                style={{ color: theme.title }}
              />
            )
          ) : null}
          <InlineTextEditSurface
            isEditing={labelEdit.isEditing}
            draft={labelEdit.draft}
            displayValue={data.label || 'Section'}
            onBeginEdit={labelEdit.beginEdit}
            onDraftChange={labelEdit.setDraft}
            onCommit={labelEdit.commit}
            onKeyDown={labelEdit.handleKeyDown}
            className={`font-semibold leading-tight tracking-tight whitespace-nowrap ${
              isImportedMermaidContainer ? 'text-[12px]' : 'text-[13px]'
            }`}
            style={{ color: theme.title }}
            inputClassName="font-semibold"
            isSelected={Boolean(selected)}
          />
          {data.subLabel && (
            <InlineTextEditSurface
              isEditing={subLabelEdit.isEditing}
              draft={subLabelEdit.draft}
              displayValue={data.subLabel}
              onBeginEdit={subLabelEdit.beginEdit}
              onDraftChange={subLabelEdit.setDraft}
              onCommit={subLabelEdit.commit}
              onKeyDown={subLabelEdit.handleKeyDown}
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full flow-lod-secondary"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
              }}
              inputClassName="px-0"
              isSelected={Boolean(selected)}
            />
          )}
          {(isLocked || isHidden) && (
            <div className="flex items-center gap-1 ml-0.5">
              {isLocked && <Lock className="h-3 w-3 flow-lod-secondary shrink-0" style={{ color: theme.title }} />}
              {isHidden && <EyeOff className="h-3 w-3 flow-lod-secondary shrink-0" style={{ color: theme.title }} />}
            </div>
          )}
          {renderConfig.showImportedBadge && isImportedMermaidContainer && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flow-lod-secondary"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
              }}
            >
              Imported
            </span>
          )}
        </div>

        <div
          className="absolute inset-0 rounded-xl transition-all duration-150"
          style={{
            inset: renderConfig.bodyInset,
            backgroundColor: bgColor,
            border: `1.5px solid ${borderColor}`,
            borderRadius: renderConfig.bodyBorderRadius,
            boxShadow: selected
              ? `0 0 0 2px ${theme.title}33, 0 2px 8px rgba(0,0,0,0.06)`
              : isDropTarget
                ? `0 0 0 1px ${theme.title}55, 0 4px 16px rgba(0,0,0,0.10)`
                : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        />

        <div className="pointer-events-auto absolute inset-x-0 top-0 h-3 rounded-t-xl" />
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 h-3 rounded-b-xl" />
        <div className="pointer-events-auto absolute inset-y-0 left-0 w-3 rounded-l-xl" />
        <div className="pointer-events-auto absolute inset-y-0 right-0 w-3 rounded-r-xl" />

        {renderConfig.showChildCount && childCount > 0 && (
          <span
            className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-medium flow-lod-secondary select-none"
            style={{ color: theme.title, opacity: 0.55 }}
          >
            {childCount} {childCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
    </NodeChrome>
  );
}

export default memo(SectionNode);
