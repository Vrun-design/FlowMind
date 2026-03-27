import React from 'react';
import type { FlowEdge } from '@/lib/types';
import {
  INSPECTOR_INPUT_COMPACT_CLASSNAME,
  InspectorField,
} from '@/components/properties/InspectorPrimitives';
import { SegmentedChoice } from '@/components/properties/SegmentedChoice';
import { createPropertyInputKeyDownHandler } from '@/components/properties/propertyInputBehavior';

interface SequenceMessageSectionProps {
  selectedEdge: FlowEdge;
  onChange: (id: string, updates: Partial<FlowEdge>) => void;
}

const KIND_ITEMS = [
  { id: 'sync', label: 'Sync' },
  { id: 'async', label: 'Async' },
  { id: 'return', label: 'Return' },
  { id: 'destroy', label: 'Destroy' },
];

export function SequenceMessageSection({
  selectedEdge,
  onChange,
}: SequenceMessageSectionProps): React.ReactElement {
  const handleInputKeyDown = createPropertyInputKeyDownHandler({ blurOnEnter: true });

  const kind = typeof selectedEdge.data?.seqMessageKind === 'string'
    ? selectedEdge.data.seqMessageKind
    : 'sync';
  const order = typeof selectedEdge.data?.seqMessageOrder === 'number'
    ? selectedEdge.data.seqMessageOrder
    : 0;
  const label = typeof selectedEdge.label === 'string' ? selectedEdge.label : '';

  function updateData(updates: Partial<NonNullable<FlowEdge['data']>>): void {
    onChange(selectedEdge.id, { data: { ...selectedEdge.data, ...updates } });
  }

  return (
    <div className="space-y-3">
      <InspectorField label="Label">
        <input
          value={label}
          onChange={(event) => onChange(selectedEdge.id, { label: event.target.value || undefined })}
          onKeyDown={handleInputKeyDown}
          placeholder="Message label..."
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
        />
      </InspectorField>

      <InspectorField label="Kind">
        <SegmentedChoice
          items={KIND_ITEMS}
          selectedId={kind}
          onSelect={(id) => updateData({ seqMessageKind: id as FlowEdge['data']['seqMessageKind'] })}
          columns={2}
        />
      </InspectorField>

      <InspectorField label="Order">
        <input
          type="number"
          min={0}
          value={order}
          onChange={(event) => updateData({ seqMessageOrder: Math.max(0, parseInt(event.target.value, 10) || 0) })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
        />
      </InspectorField>
    </div>
  );
}
