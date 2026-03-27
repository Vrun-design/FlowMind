import React, { useState } from 'react';
import type { Edge } from '@/lib/reactflowCompat';
import type { FlowEdge } from '@/lib/types';
import { useFlowStore } from '@/store';
import { Activity, GitBranch, MessageSquareText, Network, Palette, Route, Trash2, Waypoints } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { EdgeConditionSection } from './edge/EdgeConditionSection';
import { EdgeColorSection } from './edge/EdgeColorSection';
import { EdgeLabelSection } from './edge/EdgeLabelSection';
import { EdgeRouteSection } from './edge/EdgeRouteSection';
import { EdgeStyleSection } from './edge/EdgeStyleSection';
import { ArchitectureEdgeSemanticsSection } from './edge/ArchitectureEdgeSemanticsSection';
import { EdgeRelationSection } from './edge/EdgeRelationSection';
import { SequenceMessageSection } from './edge/SequenceMessageSection';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { InspectorFooter, InspectorSectionDivider } from './InspectorPrimitives';

interface EdgePropertiesProps {
    selectedEdge: Edge;
    onChange: (id: string, updates: Partial<Edge>) => void;
    onDelete: (id: string) => void;
}

export const EdgeProperties: React.FC<EdgePropertiesProps> = ({
    selectedEdge,
    onChange,
    onDelete
}) => {
    const { t } = useTranslation();
    const { nodes } = useFlowStore();
    const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
    const targetNode = nodes.find((node) => node.id === selectedEdge.target);
    const isArchitectureEdge = sourceNode?.type === 'architecture' && targetNode?.type === 'architecture';
    const isEntityRelationEdge = sourceNode?.type === 'er_entity' && targetNode?.type === 'er_entity';
    const isSequenceEdge = selectedEdge.type === 'sequence_message';
    const defaultSection = isArchitectureEdge ? 'architecture' : isSequenceEdge ? 'sequence' : 'route';
    const [panelState, setPanelState] = useState<{ edgeId: string; activeSection: string }>({
        edgeId: selectedEdge.id,
        activeSection: defaultSection,
    });
    const activeSection = panelState.edgeId === selectedEdge.id
        ? panelState.activeSection
        : defaultSection;

    function toggleSection(section: string): void {
        setPanelState((currentState) => ({
            edgeId: selectedEdge.id,
            activeSection: currentState.edgeId === selectedEdge.id && currentState.activeSection === section ? '' : section,
        }));
    }

    return (
        <>
            <InspectorSectionDivider />

            {isArchitectureEdge && (
                <CollapsibleSection
                    title={t('connectionPanel.architecture', 'Architecture')}
                    icon={<Network className="w-3.5 h-3.5" />}
                    isOpen={activeSection === 'architecture'}
                    onToggle={() => toggleSection('architecture')}
                >
                    <ArchitectureEdgeSemanticsSection selectedEdge={selectedEdge} onChange={onChange} />
                </CollapsibleSection>
            )}

            {isEntityRelationEdge && (
                <CollapsibleSection
                    title="Relation"
                    icon={<GitBranch className="w-3.5 h-3.5" />}
                    isOpen={activeSection === 'relation'}
                    onToggle={() => toggleSection('relation')}
                >
                    <EdgeRelationSection selectedEdge={selectedEdge as FlowEdge} onChange={onChange} />
                </CollapsibleSection>
            )}

            {isSequenceEdge && (
                <CollapsibleSection
                    title="Message"
                    icon={<MessageSquareText className="w-3.5 h-3.5" />}
                    isOpen={activeSection === 'sequence'}
                    onToggle={() => toggleSection('sequence')}
                >
                    <SequenceMessageSection selectedEdge={selectedEdge as FlowEdge} onChange={onChange} />
                </CollapsibleSection>
            )}

            {!isSequenceEdge && (
                <>
                    <CollapsibleSection
                        title={t('connectionPanel.label', 'Label')}
                        icon={<MessageSquareText className="w-3.5 h-3.5" />}
                        isOpen={activeSection === 'label'}
                        onToggle={() => toggleSection('label')}
                    >
                        <EdgeLabelSection selectedEdge={selectedEdge} onChange={onChange} />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title={t('connectionPanel.route', 'Route')}
                        icon={<Route className="w-3.5 h-3.5" />}
                        isOpen={activeSection === 'route'}
                        onToggle={() => toggleSection('route')}
                    >
                        <EdgeRouteSection selectedEdge={selectedEdge} onChange={onChange} />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title={t('properties.color', 'Color')}
                        icon={<Palette className="w-3.5 h-3.5" />}
                        isOpen={activeSection === 'color'}
                        onToggle={() => toggleSection('color')}
                    >
                        <EdgeColorSection selectedEdge={selectedEdge} onChange={onChange} />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title={t('connectionPanel.appearance', 'Appearance')}
                        icon={<Activity className="w-3.5 h-3.5" />}
                        isOpen={activeSection === 'appearance'}
                        onToggle={() => toggleSection('appearance')}
                    >
                        <EdgeStyleSection selectedEdge={selectedEdge} onChange={onChange} />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title={t('connectionPanel.condition', 'Condition')}
                        icon={<Waypoints className="w-3.5 h-3.5" />}
                        isOpen={activeSection === 'condition'}
                        onToggle={() => toggleSection('condition')}
                    >
                        <EdgeConditionSection selectedEdge={selectedEdge} onChange={onChange} />
                    </CollapsibleSection>
                </>
            )}

            <InspectorFooter>
                <Button
                    onClick={() => onDelete(selectedEdge.id)}
                    variant="danger"
                    className="w-full"
                    icon={<Trash2 className="w-4 h-4" />}
                >
                    {t('connectionPanel.deleteConnection', 'Delete Connection')}
                </Button>
            </InspectorFooter>
        </>
    );
};
