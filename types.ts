import { Edge, Node } from 'reactflow';

export enum NodeType {
  START = 'start',
  PROCESS = 'process',
  DECISION = 'decision',
  END = 'end',
  CUSTOM = 'custom',
  ANNOTATION = 'annotation',
  SECTION = 'section'
}

export interface NodeData {
  label: string;
  subLabel?: string; // Supports Markdown
  icon?: string; // Key for the icon map
  imageUrl?: string; // Base64 or URL
  color?: string; // Tailwind color class key (e.g., 'blue', 'red')
  align?: 'left' | 'center' | 'right';
  shape?: 'rectangle' | 'rounded' | 'capsule';
  rotation?: number; // New Rotation Property
  width?: number;
  height?: number;
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
}

export interface AIRequestParams {
  prompt: string;
  apiKey: string;
}

export type FlowNode = Node<NodeData>;

export interface EdgeData {
  condition?: EdgeCondition;
  labelOffsetX?: number;
  labelOffsetY?: number;
  labelPosition?: number; // 0 to 1, default 0.5
}

export type FlowEdge = Edge<EdgeData>;

export interface GeneratedFlowData {
  nodes: {
    id: string;
    type: string;
    label: string;
    description?: string;
    x: number;
    y: number;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
  }[];
}

export interface FlowHistoryState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowTab {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  history: {
    past: FlowHistoryState[];
    future: FlowHistoryState[];
  };
}

export type EdgeCondition = 'default' | 'yes' | 'no' | 'success' | 'error' | 'timeout';

export interface FlowSnapshot {
  id: string;
  name: string;
  timestamp: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}