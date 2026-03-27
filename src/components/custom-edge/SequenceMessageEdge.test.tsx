import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CinematicExportProvider } from '@/context/CinematicExportContext';
import SequenceMessageEdge from './SequenceMessageEdge';

function renderSequenceEdge(
  overrideProps: Partial<React.ComponentProps<typeof SequenceMessageEdge>> = {}
): ReturnType<typeof render> {
  const props: React.ComponentProps<typeof SequenceMessageEdge> = {
    id: 'seq-1',
    source: 'client',
    target: 'api',
    sourceX: 100,
    sourceY: 0,
    targetX: 320,
    targetY: 0,
    sourcePosition: 'top' as never,
    targetPosition: 'top' as never,
    label: 'POST /checkout',
    data: {
      seqMessageKind: 'sync',
      seqMessageOrder: 0,
      sourceIsActor: true,
      targetIsActor: false,
    },
    ...overrideProps,
  };

  return render(
    <svg>
      <CinematicExportProvider>
        <SequenceMessageEdge {...props} />
      </CinematicExportProvider>
    </svg>
  );
}

describe('SequenceMessageEdge', () => {
  it('renders a visible label for standard messages', () => {
    renderSequenceEdge();
    expect(screen.getByText('POST /checkout')).toBeInTheDocument();
  });

  it('uses markerEnd for rightward messages', () => {
    const { container } = renderSequenceEdge();
    const path = container.querySelector('path[marker-end]');

    expect(path).not.toBeNull();
    expect(path?.getAttribute('marker-start')).toBeNull();
  });

  it('uses markerStart for leftward messages', () => {
    const { container } = renderSequenceEdge({
      source: 'api',
      target: 'client',
      sourceX: 320,
      targetX: 100,
      label: '202 Accepted',
      data: {
        seqMessageKind: 'return',
        seqMessageOrder: 1,
        sourceIsActor: false,
        targetIsActor: true,
      },
    });
    const path = container.querySelector('path[marker-start]');

    expect(path).not.toBeNull();
    expect(path?.getAttribute('marker-end')).toBeNull();
    expect(screen.getByText('202 Accepted')).toBeInTheDocument();
  });
});
