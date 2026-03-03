import { Edge, Node, MarkerType } from 'reactflow';
import { NodeType } from '@/lib/types';
import { createId } from '@/lib/id';

// --- Edge Styles (inline for reliable SVG rendering) ---
export const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };
export const EDGE_LABEL_STYLE = { fill: '#334155', fontWeight: 500, fontSize: 12 };
export const EDGE_LABEL_BG_STYLE = { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 };

/** Shared edge configuration — use `createDefaultEdge()` for most cases. */
export const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep' as const,
  markerEnd: { type: MarkerType.ArrowClosed },
  animated: true,
  style: EDGE_STYLE,
  labelStyle: EDGE_LABEL_STYLE,
  labelBgStyle: EDGE_LABEL_BG_STYLE,
  labelBgPadding: [8, 4] as [number, number],
  labelBgBorderRadius: 4,
};

/** Creates a fully-configured edge with standard OpenFlow styling. */
export const createDefaultEdge = (
  source: string,
  target: string,
  label?: string,
  id?: string
): Edge => ({
  id: id || createId(`e-${source}-${target}`),
  source,
  target,
  label,
  ...DEFAULT_EDGE_OPTIONS,
});

export const EDGE_CONDITION_STYLES = {
  default: { stroke: '#94a3b8', strokeWidth: 2 },
  yes: { stroke: '#10b981', strokeWidth: 2 },
  no: { stroke: '#ef4444', strokeWidth: 2 },
  success: { stroke: '#10b981', strokeWidth: 2 },
  error: { stroke: '#ef4444', strokeWidth: 2 },
  timeout: { stroke: '#f59e0b', strokeWidth: 2 },
};

export const EDGE_CONDITION_LABELS = {
  yes: 'Yes',
  no: 'No',
  success: 'Success',
  error: 'Error',
  timeout: 'Timeout',
};

// --- Layout ---
export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 150;

// --- Node Colors for MiniMap ---
export const MINIMAP_NODE_COLORS: Record<string, string> = {
  start: '#10b981', // emerald-500
  process: '#3b82f6', // blue-500
  decision: '#f59e0b', // amber-500
  end: '#ef4444', // red-500
  custom: '#6366f1', // indigo-500
  annotation: '#e2e8f0', // slate-200
  section: 'rgba(241, 245, 249, 0.5)', // slate-100/50
  text: 'transparent'
};

// --- Initial Data ---
export const INITIAL_NODES: Node[] = [];

export const INITIAL_EDGES: Edge[] = [];

// Dash pattern definitions for edge styling
export const EDGE_DASH_PATTERNS: Record<string, { label: string; strokeDasharray: string }> = {
  solid: { label: 'Solid', strokeDasharray: '' },
  dashed: { label: 'Dashed', strokeDasharray: '8 4' },
  dotted: { label: 'Dotted', strokeDasharray: '2 4' },
  dashdot: { label: 'Dash-Dot', strokeDasharray: '8 4 2 4' },
};

// --- Keyboard Shortcuts ---
export const KEYBOARD_SHORTCUTS = [
  {
    title: 'shortcuts.essentials',
    items: [
      { label: 'common.undo', keys: ['Cmd', 'Z'] },
      { label: 'common.redo', keys: ['Cmd', 'Shift', 'Z'] },
      { label: 'common.selectAll', keys: ['Cmd', 'A'] },
      { label: 'common.delete', keys: ['Backspace'] },
    ]
  },
  {
    title: 'shortcuts.manipulation',
    items: [
      { label: 'common.duplicate', keys: ['Cmd', 'D'] },
      { label: 'common.duplicateDrag', keys: ['Alt', 'Drag'] },
      { label: 'common.copy', keys: ['Cmd', 'C'] },
      { label: 'common.paste', keys: ['Cmd', 'V'] },
      { label: 'common.groupSelection', keys: ['Cmd', 'G'] },
    ]
  },
  {
    title: 'shortcuts.navigation',
    items: [
      { label: 'common.panCanvas', keys: ['Space', 'Drag'] },
      { label: 'common.zoomInOut', keys: ['Cmd', '+/-'] },
      { label: 'common.fitView', keys: ['Shift', '1'] },
      { label: 'common.nudgeNode', keys: ['Arrows'] },
    ]
  },
  {
    title: 'shortcuts.help',
    items: [
      { label: 'common.keyboardShortcuts', keys: ['?'] },
      { label: 'common.commandBar', keys: ['Cmd', 'K'] },
    ]
  },
];
