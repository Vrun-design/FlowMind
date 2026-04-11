import { describe, expect, it } from 'vitest';
import { buildResolvedLayoutConfiguration } from './options';

describe('buildResolvedLayoutConfiguration', () => {
  it('uses standard compact spacing for import diagrams', () => {
    const config = buildResolvedLayoutConfiguration({
      direction: 'TB',
      spacing: 'compact',
      contentDensity: 'compact',
      diagramType: 'flowchart',
      source: 'import',
    });

    // Import no longer gets an extra spacing reduction — diagrams should
    // breathe the same as any other compact flowchart.
    expect(config.dims.nodeNode).toBe('32');
    expect(config.dims.nodeLayer).toBe('50');
  });

  it('keeps architecture diagrams from collapsing below readable spacing', () => {
    const config = buildResolvedLayoutConfiguration({
      direction: 'TB',
      spacing: 'compact',
      contentDensity: 'compact',
      diagramType: 'architecture',
      source: 'import',
    });

    expect(config.dims.nodeNode).toBe('56');
    expect(config.dims.nodeLayer).toBe('88');
  });
});
