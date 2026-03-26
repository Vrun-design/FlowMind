import React from 'react';
import type { NodeData } from '@/lib/types';
import { JourneyScoreControl } from '@/components/journey/JourneyScoreControl';
import { createPropertyInputKeyDownHandler } from '@/components/properties/propertyInputBehavior';
import { INSPECTOR_INPUT_COMPACT_CLASSNAME, InspectorField } from '@/components/properties/InspectorPrimitives';

interface JourneyNodeSectionProps {
  nodeId: string;
  data: NodeData;
  onChange: (id: string, data: Partial<NodeData>) => void;
}

export function JourneyNodeSection({
  nodeId,
  data,
  onChange,
}: JourneyNodeSectionProps): React.ReactElement {
  const handleInputKeyDown = createPropertyInputKeyDownHandler({ blurOnEnter: true });
  const titleValue = data.journeyTask || data.label || '';
  const actorValue = data.journeyActor || data.subLabel || '';

  return (
    <div className="space-y-3">
      <InspectorField label="Section">
        <input
          value={data.journeySection || ''}
          onChange={(event) => onChange(nodeId, { journeySection: event.target.value })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          placeholder="Discovery"
        />
      </InspectorField>

      <InspectorField label="Step Title">
        <input
          value={titleValue}
          onChange={(event) => onChange(nodeId, { label: event.target.value, journeyTask: event.target.value })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          placeholder="Click Get Started"
        />
      </InspectorField>

      <InspectorField label="Actor">
        <input
          value={actorValue}
          onChange={(event) => onChange(nodeId, { subLabel: event.target.value, journeyActor: event.target.value })}
          onKeyDown={handleInputKeyDown}
          className={INSPECTOR_INPUT_COMPACT_CLASSNAME}
          placeholder="New Visitor"
        />
      </InspectorField>

      <InspectorField label="Experience Score">
        <JourneyScoreControl
          score={data.journeyScore}
          onChange={(score) => onChange(nodeId, { journeyScore: score })}
          className="justify-between"
          starClassName="text-lg"
        />
      </InspectorField>
    </div>
  );
}
