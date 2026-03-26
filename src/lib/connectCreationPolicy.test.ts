import { describe, expect, it } from 'vitest';
import {
  getDefaultConnectedNodeSpec,
  getMindmapChildSideFromSourceHandle,
  resolveMindmapChildSide,
  isMindmapConnectorSource,
  shouldBypassConnectMenu,
} from './connectCreationPolicy';

describe('connectCreationPolicy', () => {
  it('defaults generic connectors to a rounded process node', () => {
    expect(getDefaultConnectedNodeSpec('process')).toEqual({
      type: 'process',
      shape: 'rounded',
    });
  });

  it('propagates structured node families through connector creation', () => {
    expect(getDefaultConnectedNodeSpec('class')).toEqual({ type: 'class' });
    expect(getDefaultConnectedNodeSpec('er_entity')).toEqual({ type: 'er_entity' });
    expect(getDefaultConnectedNodeSpec('architecture')).toEqual({ type: 'architecture' });
    expect(getDefaultConnectedNodeSpec('journey')).toEqual({ type: 'journey' });
    expect(getDefaultConnectedNodeSpec('annotation')).toEqual({ type: 'annotation' });
  });

  it('defaults mindmap connectors to a mindmap topic', () => {
    expect(getDefaultConnectedNodeSpec('mindmap')).toEqual({
      type: 'mindmap',
    });
    expect(isMindmapConnectorSource('mindmap')).toBe(true);
    expect(shouldBypassConnectMenu('mindmap')).toBe(true);
  });

  it('derives mindmap child side from the dragged source handle', () => {
    expect(getMindmapChildSideFromSourceHandle('left')).toBe('left');
    expect(getMindmapChildSideFromSourceHandle('right')).toBe('right');
    expect(getMindmapChildSideFromSourceHandle('top')).toBeUndefined();
    expect(getMindmapChildSideFromSourceHandle(null)).toBeUndefined();
  });

  it('resolves mindmap child side deterministically for root and branch topics', () => {
    expect(resolveMindmapChildSide(0, null, 'left')).toBe('left');
    expect(resolveMindmapChildSide(0, null, 'right')).toBe('right');
    expect(resolveMindmapChildSide(0, null, null)).toBe('right');
    expect(resolveMindmapChildSide(1, 'left', null)).toBe('left');
    expect(resolveMindmapChildSide(1, 'right', null)).toBe('right');
  });
});
