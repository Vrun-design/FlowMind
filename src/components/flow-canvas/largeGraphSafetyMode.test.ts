import { describe, expect, it } from 'vitest';
import type { Edge } from 'reactflow';
import {
  getSafetyAdjustedEdges,
  isFarZoomReductionActive,
  isInteractionLowDetailModeActive,
  isLowDetailModeActive,
  isLargeGraphSafetyActive,
  shouldEnableViewportCulling,
} from './largeGraphSafetyMode';

describe('largeGraphSafetyMode', () => {
  it('activates by mode override and auto threshold', () => {
    expect(isLargeGraphSafetyActive(10, 10, 'on')).toBe(true);
    expect(isLargeGraphSafetyActive(2000, 2000, 'off')).toBe(false);
    expect(isLargeGraphSafetyActive(120, 10, 'auto')).toBe(true);
    expect(isLargeGraphSafetyActive(99, 500, 'auto')).toBe(false);
  });

  it('disables animated edges when safety mode is active', () => {
    const animated = { id: 'e1', source: 'a', target: 'b', animated: true } as Edge;
    const staticEdge = { id: 'e2', source: 'b', target: 'c', animated: false } as Edge;
    const edges = [animated, staticEdge];

    const adjusted = getSafetyAdjustedEdges(edges, true);
    expect(adjusted).not.toBe(edges);
    expect(adjusted[0]).not.toBe(animated);
    expect(adjusted[0].animated).toBe(false);
    expect(adjusted[1]).toBe(staticEdge);
    expect(getSafetyAdjustedEdges(edges, false)).toBe(edges);
  });

  it('enables viewport culling only when safety mode is active', () => {
    expect(shouldEnableViewportCulling(true)).toBe(true);
    expect(shouldEnableViewportCulling(false)).toBe(false);
  });

  it('enables low-detail mode only for large-graph safety with far zoom', () => {
    expect(isLowDetailModeActive(false, 0.4)).toBe(false);
    expect(isLowDetailModeActive(true, 0.7)).toBe(false);
    expect(isLowDetailModeActive(true, 0.55)).toBe(false);
    expect(isLowDetailModeActive(true, 0.5)).toBe(true);
    expect(isLowDetailModeActive(true, 0.45)).toBe(true);
  });

  it('enables interaction low-detail mode only when interacting under safety mode', () => {
    expect(isInteractionLowDetailModeActive(false, true)).toBe(false);
    expect(isInteractionLowDetailModeActive(true, false)).toBe(false);
    expect(isInteractionLowDetailModeActive(true, true)).toBe(true);
  });

  it('enables far-zoom reductions only at very low zoom under safety mode', () => {
    expect(isFarZoomReductionActive(false, 0.3)).toBe(false);
    expect(isFarZoomReductionActive(true, 0.45)).toBe(false);
    expect(isFarZoomReductionActive(true, 0.4)).toBe(true);
    expect(isFarZoomReductionActive(true, 0.3)).toBe(true);
  });
});
