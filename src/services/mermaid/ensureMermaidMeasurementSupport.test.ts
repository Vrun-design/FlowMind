import { describe, expect, it } from 'vitest';
import { ensureMermaidMeasurementSupport } from './ensureMermaidMeasurementSupport';

describe('ensureMermaidMeasurementSupport', () => {
  it('installs measurement shims for SVG elements that lack getBBox', () => {
    const proto = window.SVGElement?.prototype as { getBBox?: unknown; getComputedTextLength?: unknown };
    const originalGetBBox = proto?.getBBox;
    const originalGetComputedTextLength = proto?.getComputedTextLength;

    try {
      if (proto) {
        // Simulate the missing measurement methods that break Mermaid render.
        delete proto.getBBox;
        delete proto.getComputedTextLength;
      }

      ensureMermaidMeasurementSupport();

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = 'Mermaid Label';
      svg.appendChild(text);
      document.body.appendChild(svg);

      expect(typeof text.getBBox).toBe('function');
      expect(typeof text.getComputedTextLength).toBe('function');
      expect(text.getBBox().width).toBeGreaterThan(0);
      expect(text.getComputedTextLength()).toBeGreaterThan(0);
    } finally {
      if (proto) {
        proto.getBBox = originalGetBBox;
        proto.getComputedTextLength = originalGetComputedTextLength;
      }
      document.body.innerHTML = '';
    }
  });
});
