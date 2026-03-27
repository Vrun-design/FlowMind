import React from 'react';
import type { NodeData } from '@/lib/types';
import { createPropertyInputKeyDownHandler } from '@/components/properties/propertyInputBehavior';
import { INSPECTOR_INPUT_COMPACT_CLASSNAME, InspectorField } from '@/components/properties/InspectorPrimitives';
import { SegmentedChoice } from '@/components/properties/SegmentedChoice';

interface SequenceNodeSectionProps {
  nodeId: string;
  data: NodeData;
  onChange: (id: string, data: Partial<NodeData>) => void;
}

const KIND_ITEMS = [
  { id: 'participant', label: 'Box' },
  { id: 'actor', label: 'Actor' },
];

export function SequenceNodeSection({
  nodeId,
  data,
  onChange,
}: SequenceNodeSectionProps): React.ReactElement {
  const handleInputKeyDown = createPropertyInputKeyDownHandler({ blurOnEnter: true });

  return (
    <div className="space-y-3">
      <InspectorField label="Name">
        <input
          value={data.label || ''}
          onChange={(event) => onChange(nodeId, { label: event.target.value })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          placeholder="Alice"
        />
      </InspectorField>

      <InspectorField label="Kind">
        <SegmentedChoice
          items={KIND_ITEMS}
          selectedId={data.seqParticipantKind || 'participant'}
          onSelect={(id) => onChange(nodeId, { seqParticipantKind: id as 'participant' | 'actor' })}
          columns={2}
        />
      </InspectorField>

      <InspectorField label="Alias">
        <input
          value={data.seqParticipantAlias || ''}
          onChange={(event) => onChange(nodeId, { seqParticipantAlias: event.target.value })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          placeholder="A"
        />
      </InspectorField>
    </div>
  );
}
