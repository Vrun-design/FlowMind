import React from 'react';
import type { FlowEdge } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { buildEdgeLabelUpdates, getEditableEdgeLabel, hasEditableEdgeLabel } from './edgeLabelModel';

interface EdgeLabelSectionProps {
    selectedEdge: FlowEdge;
    onChange: (id: string, updates: Partial<FlowEdge>) => void;
}

export function EdgeLabelSection({ selectedEdge, onChange }: EdgeLabelSectionProps): React.ReactElement {
    const editableLabel = getEditableEdgeLabel(selectedEdge);

    return (
        <div className="space-y-3">
            <Input
                label="Label"
                value={editableLabel}
                onChange={(event) => onChange(selectedEdge.id, buildEdgeLabelUpdates(selectedEdge, event.target.value))}
                placeholder="e.g., 'If yes', 'On success'"
            />

            {hasEditableEdgeLabel(selectedEdge) && (
                <div className="space-y-1 pt-2">
                    <Slider
                        label="Position"
                        valueDisplay={`${Math.round((selectedEdge.data?.labelPosition ?? 0.5) * 100)}%`}
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round((selectedEdge.data?.labelPosition ?? 0.5) * 100)}
                        onChange={(event) => {
                            onChange(selectedEdge.id, {
                                data: {
                                    ...selectedEdge.data,
                                    labelPosition: parseInt(event.target.value, 10) / 100,
                                    labelOffsetX: 0,
                                    labelOffsetY: 0,
                                },
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
