import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { EdgeRelationSection } from './EdgeRelationSection';

function createEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id: 'edge-1',
    source: 'entity-a',
    target: 'entity-b',
    data: { erRelation: '||--||' },
    ...overrides,
  };
}

describe('EdgeRelationSection', () => {
  it('updates the ER relation token from the select control', () => {
    const onChange = vi.fn();
    render(<EdgeRelationSection selectedEdge={createEdge()} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /one to one/i }));
    fireEvent.click(screen.getByRole('button', { name: 'One to zero or many' }));

    expect(onChange).toHaveBeenCalledWith('edge-1', {
      data: {
        erRelation: '||--o{',
      },
    });
  });
});
