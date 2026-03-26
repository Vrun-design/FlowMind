import React from 'react';
import { Node, Edge } from '@/lib/reactflowCompat';
import { NodeData } from '@/lib/types';
import type { ArchitectureTemplateId } from '@/lib/architectureTemplates';
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
    onAddMindmapSibling: (nodeId: string) => void;
    onAddArchitectureService: (sourceId: string) => void;
    onCreateArchitectureBoundary: (sourceId: string) => void;
    onApplyArchitectureTemplate: (sourceId: string, templateId: ArchitectureTemplateId) => void;
    onGenerateEntityFields: (nodeId: string) => Promise<void> | void;
    onSuggestArchitectureNode: (nodeId: string) => Promise<void> | void;
    onConvertEntitySelectionToClassDiagram: () => void;
    onOpenMermaidCodeEditor: () => void;
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
    onAddMindmapSibling,
    onAddArchitectureService,
    onCreateArchitectureBoundary,
    onApplyArchitectureTemplate,
    onGenerateEntityFields,
    onSuggestArchitectureNode,
    onConvertEntitySelectionToClassDiagram,
    onOpenMermaidCodeEditor,
    onClose
}) => {
    const { t } = useTranslation();

    if (!selectedNode && !selectedEdge && selectedNodes.length < 2) return null;

    const isBulkEdit = selectedNodes.length > 1;
    const panelTitle = isBulkEdit
        ? `Bulk edit (${selectedNodes.length})`
        : selectedEdge
            ? t('propertiesPanel.connection')
            : t('properties.title');

    return (
        <SidebarShell>
            <SidebarHeader
                title={panelTitle}
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
                        onAddMindmapSibling={onAddMindmapSibling}
                        onAddArchitectureService={onAddArchitectureService}
                        onCreateArchitectureBoundary={onCreateArchitectureBoundary}
                        onApplyArchitectureTemplate={onApplyArchitectureTemplate}
                        onGenerateEntityFields={onGenerateEntityFields}
                        onSuggestArchitectureNode={onSuggestArchitectureNode}
                        onConvertEntitySelectionToClassDiagram={onConvertEntitySelectionToClassDiagram}
                        onOpenMermaidCodeEditor={onOpenMermaidCodeEditor}
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
