import { describe, expect, it } from 'vitest';
import { buildArchitectureServiceSuggestionPrompt, buildEntityFieldGenerationPrompt } from './nodeActionPrompts';
import type { FlowNode } from '@/lib/types';

function createEntityNode(): FlowNode {
  return {
    id: 'entity-1',
    type: 'er_entity',
    position: { x: 0, y: 0 },
    data: {
      label: 'users',
      erFields: ['id: UUID PK', 'email: VARCHAR UNIQUE'],
    },
  };
}

function createArchitectureNode(): FlowNode {
  return {
    id: 'arch-1',
    type: 'architecture',
    position: { x: 0, y: 0 },
    data: {
      label: 'orders',
      archProvider: 'aws',
      archResourceType: 'service',
      archEnvironment: 'production',
      archZone: 'private',
      archTrustDomain: 'internal',
    },
  };
}

describe('nodeActionPrompts', () => {
  it('builds a focused entity field generation prompt with current field context', () => {
    const prompt = buildEntityFieldGenerationPrompt(createEntityNode());

    expect(prompt).toContain('selected table "users"');
    expect(prompt).toContain('Only update the selected ER entity.');
    expect(prompt).toContain('id: UUID PK');
  });

  it('builds a focused architecture suggestion prompt with infrastructure metadata', () => {
    const prompt = buildArchitectureServiceSuggestionPrompt(createArchitectureNode());

    expect(prompt).toContain('Provider: aws');
    expect(prompt).toContain('Resource type: service');
    expect(prompt).toContain('Only update the selected architecture node');
  });
});
