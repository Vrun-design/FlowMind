import { describe, expect, it } from 'vitest';
import { buildArchitectureTemplate, getArchitectureTemplateOptions } from './architectureTemplates';
import type { FlowNode } from './types';

function createSourceNode(): FlowNode {
  return {
    id: 'arch-root',
    type: 'architecture',
    position: { x: 100, y: 200 },
    data: {
      label: 'Entry',
      color: 'slate',
      archProvider: 'aws',
      archEnvironment: 'production',
      archBoundaryId: 'section-1',
      archZone: 'public',
      archTrustDomain: 'external',
    },
    selected: true,
  };
}

describe('architectureTemplates', () => {
  it('lists the available starter layouts', () => {
    expect(getArchitectureTemplateOptions().map((option) => option.id)).toEqual([
      'three-tier-web',
      'microservices',
      'event-driven',
      'c4-system-context',
      'network-edge-security',
    ]);
  });

  it('builds a template anchored to the selected architecture node', () => {
    const template = buildArchitectureTemplate(
      'three-tier-web',
      createSourceNode(),
      (key) => `node-${key}`,
      (key) => `edge-${key}`,
    );

    expect(template).not.toBeNull();
    expect(template?.sourceData.label).toBe('Web App');
    expect(template?.nodes).toHaveLength(3);
    expect(template?.nodes[0].data.archProvider).toBe('aws');
    expect(template?.nodes[0].data.archBoundaryId).toBe('section-1');
    expect(template?.edges.map((edge) => `${edge.source}:${edge.target}`)).toEqual([
      'arch-root:node-api',
      'node-api:node-cache',
      'node-api:node-database',
    ]);
  });

  it('builds the C4 system context template with C4 resource types', () => {
    const template = buildArchitectureTemplate(
      'c4-system-context',
      createSourceNode(),
      (key) => `node-${key}`,
      (key) => `edge-${key}`,
    );

    expect(template).not.toBeNull();
    expect(template?.sourceData.archResourceType).toBe('system');
    expect(template?.nodes.map((node) => node.data.archResourceType)).toEqual([
      'person',
      'container',
      'container',
      'database_container',
    ]);
  });

  it('builds the network edge security template with network resource types', () => {
    const template = buildArchitectureTemplate(
      'network-edge-security',
      createSourceNode(),
      (key) => `node-${key}`,
      (key) => `edge-${key}`,
    );

    expect(template).not.toBeNull();
    expect(template?.sourceData.archResourceType).toBe('dns');
    expect(template?.nodes.map((node) => node.data.archResourceType)).toEqual([
      'cdn',
      'firewall',
      'load_balancer',
      'service',
      'service',
    ]);
    expect(template?.edges.map((edge) => edge.label)).toContain('allows 443');
  });
});
