import { describe, expect, it } from 'vitest';
import { createArchitectureServiceNode, createProcessNode } from './utils';

describe('createProcessNode', () => {
  it('creates blank generic shape content by default', () => {
    const node = createProcessNode('shape-1', { x: 10, y: 20 });

    expect(node.type).toBe('process');
    expect(node.data.label).toBe('');
    expect(node.data.subLabel).toBe('');
    expect(node.width).toBeUndefined();
    expect(node.height).toBeUndefined();
  });
});

describe('createArchitectureServiceNode', () => {
  it('inherits custom provider metadata from the source node', () => {
    const node = createArchitectureServiceNode({
      id: 'arch-2',
      position: { x: 50, y: 75 },
      layerId: 'layer-1',
      sourceNode: {
        id: 'arch-1',
        type: 'architecture',
        position: { x: 0, y: 0 },
        data: {
          label: 'Gateway',
          archProvider: 'custom',
          archProviderLabel: 'Hetzner',
          customIconUrl: 'data:image/svg+xml;base64,abc',
          archEnvironment: 'production',
        },
      } as never,
    });

    expect(node.data.archProvider).toBe('custom');
    expect(node.data.archProviderLabel).toBe('Hetzner');
    expect(node.data.customIconUrl).toBe('data:image/svg+xml;base64,abc');
    expect(node.data.archEnvironment).toBe('production');
  });
});
