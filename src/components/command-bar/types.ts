import type { FlowEdge, FlowNode } from '@/lib/types';
import { FlowTemplate } from '../../services/templates';
import { LayoutAlgorithm } from '../../services/elkLayout';

export type CommandView = 'root' | 'templates' | 'search' | 'layout' | 'design-system' | 'wireframes' | 'layers' | 'pages' | 'libraries';

export interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    action?: () => void;
    type: 'action' | 'navigation' | 'ai' | 'toggle';
    description?: string;
    value?: boolean;
    view?: CommandView;
    hidden?: boolean;
}

export interface CommandBarProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: FlowNode[];
    edges: FlowEdge[];
    onUndo?: () => void;
    onRedo?: () => void;
    onLayout?: (direction?: 'TB' | 'LR' | 'RL' | 'BT', algorithm?: LayoutAlgorithm, spacing?: 'compact' | 'normal' | 'loose') => void;
    onSelectTemplate?: (template: FlowTemplate) => void;
    onOpenStudioAI?: () => void;
    onOpenStudioFlowMind?: () => void;
    onOpenStudioMermaid?: () => void;
    initialView?: CommandView;
    settings?: {
        showGrid: boolean;
        onToggleGrid: () => void;
        snapToGrid: boolean;
        onToggleSnap: () => void;
    };
}
