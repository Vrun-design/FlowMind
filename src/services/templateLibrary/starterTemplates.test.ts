import { describe, expect, it } from 'vitest';
import { createStarterTemplateRegistry, STARTER_TEMPLATE_MANIFESTS } from './starterTemplates';

describe('starter template manifests', () => {
  it('includes the curated launch starter catalog', () => {
    const ids = STARTER_TEMPLATE_MANIFESTS.map((template) => template.id);

    expect(ids).toHaveLength(23);
    expect(ids).toContain('aws-event-api');
    expect(ids).toContain('architecture-c4-context');
    expect(ids).toContain('architecture-network-edge');
    expect(ids).toContain('azure-ai-platform');
    expect(ids).toContain('cncf-gitops');
    expect(ids).toContain('mindmap-product-discovery');
    expect(ids).toContain('wireframe-saas-starter');
  });

  it('has deterministic graph integrity for every starter template', () => {
    STARTER_TEMPLATE_MANIFESTS.forEach((template) => {
      const nodeIds = new Set(template.graph.nodes.map((node) => node.id));
      const edgeIds = new Set(template.graph.edges.map((edge) => edge.id));

      expect(nodeIds.size).toBe(template.graph.nodes.length);
      expect(edgeIds.size).toBe(template.graph.edges.length);

      template.graph.edges.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });
  });

  it('is consumable by template registry scaffold', () => {
    const registry = createStarterTemplateRegistry();

    expect(registry.listTemplates()).toHaveLength(23);
    expect(registry.getTemplate('flow-subscription-upgrade')?.graph.nodes).toHaveLength(7);
    expect(registry.getTemplate('aws-event-api')?.graph.nodes).toHaveLength(7);
    expect(registry.getTemplate('architecture-c4-context')?.graph.nodes).toHaveLength(5);
    expect(registry.getTemplate('mindmap-product-discovery')?.graph.nodes).toHaveLength(9);
  });
});
