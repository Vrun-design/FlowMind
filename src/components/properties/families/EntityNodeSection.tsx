import React from 'react';
import type { NodeData } from '@/lib/types';
import { normalizeErFields } from '@/lib/entityFields';
import { EntityFieldListEditor } from './EntityFieldListEditor';
import { INSPECTOR_BUTTON_CLASSNAME } from '@/components/properties/InspectorPrimitives';

interface EntityNodeSectionProps {
  nodeId: string;
  data: NodeData;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onGenerateEntityFields?: (nodeId: string) => Promise<void> | void;
}

export function EntityNodeSection({
  nodeId,
  data,
  onChange,
  onGenerateEntityFields,
}: EntityNodeSectionProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className={INSPECTOR_BUTTON_CLASSNAME + ' w-full px-3 py-2 text-sm'}
        onClick={() => void onGenerateEntityFields?.(nodeId)}
      >
        Generate fields with AI
      </button>

      <EntityFieldListEditor
        fields={normalizeErFields(data.erFields)}
        onChange={(fields) => onChange(nodeId, { erFields: fields })}
      />
    </div>
  );
}
