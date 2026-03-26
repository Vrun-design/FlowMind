import { useCallback } from 'react';
import { LEGACY_STORAGE_KEYS } from '@/lib/legacyBranding';
import type { NodeData } from '@/lib/types';
import { readLocalStorageString, writeLocalStorageJson } from '@/services/storage/uiLocalStorage';
import { useCanvasActions, useCanvasState } from '@/store/canvasHooks';

const STYLE_CLIPBOARD_STORAGE_KEY = LEGACY_STORAGE_KEYS.styleClipboard;

const STYLE_FIELDS: Array<keyof NodeData> = [
  'align',
  'backgroundColor',
  'color',
  'colorMode',
  'customColor',
  'customIconUrl',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'icon',
  'rotation',
  'shape',
  'subLabel',
  'transparency',
  'variant',
];

function pickStyleData(data: NodeData): Partial<NodeData> {
  return STYLE_FIELDS.reduce<Partial<NodeData>>((styleData, key) => {
    if (typeof data[key] !== 'undefined') {
      styleData[key] = data[key];
    }
    return styleData;
  }, {});
}

export function useStyleClipboard(recordHistory: () => void) {
  const { nodes } = useCanvasState();
  const { setNodes } = useCanvasActions();

  const copyStyleSelection = useCallback(() => {
    const sourceNode = nodes.find((node) => node.selected);
    if (!sourceNode) {
      return;
    }

    writeLocalStorageJson(STYLE_CLIPBOARD_STORAGE_KEY, pickStyleData(sourceNode.data));
  }, [nodes]);

  const pasteStyleSelection = useCallback(() => {
    const styleDataRaw = readLocalStorageString(STYLE_CLIPBOARD_STORAGE_KEY);
    if (!styleDataRaw) {
      return;
    }

    const selectedIds = new Set(nodes.filter((node) => node.selected).map((node) => node.id));
    if (selectedIds.size === 0) {
      return;
    }

    const styleData = JSON.parse(styleDataRaw) as Partial<NodeData>;
    recordHistory();
    setNodes((currentNodes) => currentNodes.map((node) => (
      selectedIds.has(node.id)
        ? { ...node, data: { ...node.data, ...styleData } }
        : node
    )));
  }, [nodes, recordHistory, setNodes]);

  return {
    copyStyleSelection,
    pasteStyleSelection,
  };
}
