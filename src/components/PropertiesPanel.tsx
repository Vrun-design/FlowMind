import React from 'react';
import { Node, Edge } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import { EdgeProperties } from './properties/EdgeProperties';
import { BulkNodeProperties } from './properties/BulkNodeProperties';
import { useTranslation } from 'react-i18next';
import { DiagramNodePropertiesRouter } from './properties/DiagramNodePropertiesRouter';
import { SidebarBody, SidebarHeader, SidebarShell } from './SidebarShell';

interface PropertiesPanelProps {
    selectedNodes: Node<NodeData>[];
    selectedNode: Node<NodeData> | null;
    selectedEdge: Edge | null;
    onChangeNode: (id: string, data: Partial<NodeData>) => void;
    onBulkChangeNodes: (updates: Partial<NodeData>, labelPrefix?: string, labelSuffix?: string) => number;
    onChangeNodeType: (id: string, type: string) => void;
    onChangeEdge: (id: string, updates: Partial<Edge>) => void;
    onDeleteNode: (id: string) => void;
    onDuplicateNode: (id: string) => void;
    onDeleteEdge: (id: string) => void;
    onUpdateZIndex: (id: string, action: 'front' | 'back') => void;
    onAddMindmapChild: (parentId: string) => void;
    onAddArchitectureService: (sourceId: string) => void;
    onCreateArchitectureBoundary: (sourceId: string) => void;
    onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    selectedNodes,
    selectedNode,
    selectedEdge,
    onChangeNode,
    onBulkChangeNodes,
    onChangeEdge,
    onDeleteNode,
    onDuplicateNode,
    onDeleteEdge,
    onAddMindmapChild,
    onAddArchitectureService,
    onCreateArchitectureBoundary,
    onClose
}) => {
    const { t } = useTranslation();

    if (!selectedNode && !selectedEdge) return null;

    const isAnnotation = selectedNode?.type === 'annotation';
    const isBulkEdit = selectedNodes.length > 1;
    const getSingleNodeTitle = (): string => {
        if (!selectedNode) {
            return t('propertiesPanel.nodeSettings');
        }

        switch (selectedNode.type) {
            case 'text':
                return t('propertiesPanel.textSettings', 'Text Settings');
            case 'annotation':
                return t('propertiesPanel.stickyNote');
            case 'section':
                return t('propertiesPanel.sectionSettings', 'Section Settings');
            case 'class':
                return t('propertiesPanel.classSettings', 'Class Settings');
            case 'er_entity':
                return t('propertiesPanel.erEntitySettings', 'ER Entity Settings');
            case 'mindmap':
                return t('propertiesPanel.mindmapNodeSettings', 'Mindmap Node Settings');
            case 'journey':
                return t('propertiesPanel.journeyNodeSettings', 'Journey Node Settings');
            case 'architecture':
                return t('propertiesPanel.architectureNodeSettings', 'Architecture Node Settings');
            case 'image':
                return t('propertiesPanel.imageSettings', 'Image Settings');
            default:
                return t('propertiesPanel.nodeSettings');
        }
    };

    return (
        <SidebarShell>
            <SidebarHeader
                title={
                    isBulkEdit
                        ? `Bulk edit (${selectedNodes.length})`
                        : (isAnnotation ? t('propertiesPanel.stickyNote') : selectedNode ? getSingleNodeTitle() : t('propertiesPanel.connection'))
                }
                onClose={onClose}
            />

            <SidebarBody className="space-y-5">
                {isBulkEdit && (
                    <BulkNodeProperties
                        selectedNodes={selectedNodes}
                        onApply={onBulkChangeNodes}
                    />
                )}

                {selectedNode && !isBulkEdit && (
                    <DiagramNodePropertiesRouter
                        selectedNode={selectedNode}
                        onChange={onChangeNode}
                        onDuplicate={onDuplicateNode}
                        onDelete={onDeleteNode}
                        onAddMindmapChild={onAddMindmapChild}
                        onAddArchitectureService={onAddArchitectureService}
                        onCreateArchitectureBoundary={onCreateArchitectureBoundary}
                    />
                )}

                {selectedEdge && (
                    <EdgeProperties
                        selectedEdge={selectedEdge}
                        onChange={onChangeEdge}
                        onDelete={onDeleteEdge}
                    />
                )}
            </SidebarBody>
        </SidebarShell>
    );
};
