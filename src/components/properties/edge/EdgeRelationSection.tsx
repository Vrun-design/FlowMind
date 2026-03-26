import React from 'react';
import type { FlowEdge } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { ER_RELATION_OPTIONS } from './erRelationOptions';

interface EdgeRelationSectionProps {
  selectedEdge: FlowEdge;
  onChange: (id: string, updates: Partial<FlowEdge>) => void;
}

export function EdgeRelationSection({
  selectedEdge,
  onChange,
}: EdgeRelationSectionProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Crow&apos;s Foot
        </label>
        <Select
          value={(selectedEdge.data?.erRelation as string) || '||--||'}
          onChange={(value) => {
            onChange(selectedEdge.id, {
              data: {
                ...selectedEdge.data,
                erRelation: value as FlowEdge['data']['erRelation'],
              },
            });
          }}
          options={ER_RELATION_OPTIONS.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
        />
      </div>
      <p className="text-xs text-slate-500">
        Controls the ER cardinality markers rendered on this connection.
      </p>
    </div>
  );
}
