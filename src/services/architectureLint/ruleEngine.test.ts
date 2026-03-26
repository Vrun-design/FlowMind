import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { LintRule } from './types';
import { evaluateRules, parseRulesJson } from './ruleEngine';

function node(id: string, label: string, type = 'process'): FlowNode {
  return { id, type, position: { x: 0, y: 0 }, data: { label } };
}

function edge(id: string, source: string, target: string, label?: string, edgeType?: string): FlowEdge {
  return { id, source, target, ...(label !== undefined ? { label } : {}), ...(edgeType !== undefined ? { type: edgeType } : {}) } as FlowEdge;
}

describe('evaluateRules — cannot-connect', () => {
  const rule: LintRule = {
    id: 'r1', severity: 'error', type: 'cannot-connect',
    from: { labelContains: 'ui' }, to: { labelContains: 'db' },
  };

  it('flags a direct UI → DB connection', () => {
    const nodes = [node('ui', 'UI Layer'), node('db', 'DB Layer')];
    const edges = [edge('e1', 'ui', 'db')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(1);
    expect(violations[0].edgeIds).toContain('e1');
  });

  it('does not flag when no matching connection', () => {
    const nodes = [node('api', 'API'), node('db', 'DB Layer')];
    const edges = [edge('e1', 'api', 'db')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(0);
  });

  it('uses edge matcher to restrict which edges trigger the rule', () => {
    const ruleWithEdge: LintRule = {
      ...rule, edge: { labelContains: 'direct' },
    };
    const nodes = [node('ui', 'UI Layer'), node('db', 'DB Layer')];
    const proxiedEdge = edge('e1', 'ui', 'db', 'via cache');
    const directEdge = edge('e2', 'ui', 'db', 'direct write');
    const violations = evaluateRules(nodes, [proxiedEdge, directEdge], [ruleWithEdge]);
    expect(violations).toHaveLength(1);
    expect(violations[0].edgeIds).toContain('e2');
  });
});

describe('evaluateRules — must-connect', () => {
  const rule: LintRule = {
    id: 'r2', severity: 'warning', type: 'must-connect',
    from: { labelContains: 'service' }, to: { labelContains: 'db' },
  };

  it('flags a service node with no DB connection', () => {
    const nodes = [node('svc', 'UserService'), node('db', 'DB Layer')];
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(1);
    expect(violations[0].nodeIds).toContain('svc');
  });

  it('passes when service has a DB connection', () => {
    const nodes = [node('svc', 'UserService'), node('db', 'DB Layer')];
    const edges = [edge('e1', 'svc', 'db')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(0);
  });
});

describe('evaluateRules — forbidden-cycle', () => {
  const rule: LintRule = {
    id: 'r3', severity: 'error', type: 'forbidden-cycle',
  };

  it('detects a direct cycle (A → B → A)', () => {
    const nodes = [node('a', 'A'), node('b', 'B')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'a')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(1);
    expect(violations[0].nodeIds).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('detects a longer cycle (A → B → C → A)', () => {
    const nodes = [node('a', 'A'), node('b', 'B'), node('c', 'C')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'c'), edge('e3', 'c', 'a')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(1);
  });

  it('returns no violations for a DAG', () => {
    const nodes = [node('a', 'A'), node('b', 'B'), node('c', 'C')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'c')];
    const violations = evaluateRules(nodes, edges, [rule]);
    expect(violations).toHaveLength(0);
  });

  it('only checks nodes matching the from matcher', () => {
    const rule2: LintRule = { ...rule, from: { labelContains: 'layer' } };
    const nodes = [node('a', 'Layer A'), node('b', 'Service B'), node('c', 'Layer C')];
    // cycle between b and c, but only a and c are in scope
    const edges = [edge('e1', 'b', 'c'), edge('e2', 'c', 'b')];
    // b is not in scope so c→b edge is ignored; no cycle in scoped nodes
    const violations = evaluateRules(nodes, edges, [rule2]);
    expect(violations).toHaveLength(0);
  });
});

describe('evaluateRules — must-have-node', () => {
  const rule: LintRule = {
    id: 'r4', severity: 'warning', type: 'must-have-node',
    from: { nodeType: 'database' },
  };

  it('flags when no matching node exists', () => {
    const nodes = [node('api', 'API', 'process')];
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe('r4');
  });

  it('passes when at least one matching node exists', () => {
    const nodes = [node('api', 'API', 'process'), node('db', 'DB', 'database')];
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(0);
  });
});

describe('evaluateRules — node-count', () => {
  const nodes = [
    node('s1', 'Service A', 'process'),
    node('s2', 'Service B', 'process'),
    node('s3', 'Service C', 'process'),
  ];

  it('flags when count is below min', () => {
    const rule: LintRule = { id: 'r5', severity: 'error', type: 'node-count', from: { nodeType: 'process' }, min: 5 };
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(1);
  });

  it('flags when count exceeds max', () => {
    const rule: LintRule = { id: 'r6', severity: 'warning', type: 'node-count', from: { nodeType: 'process' }, max: 2 };
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(1);
  });

  it('passes when count is within range', () => {
    const rule: LintRule = { id: 'r7', severity: 'error', type: 'node-count', from: { nodeType: 'process' }, min: 2, max: 4 };
    const violations = evaluateRules(nodes, [], [rule]);
    expect(violations).toHaveLength(0);
  });
});

describe('parseRulesJson', () => {
  it('returns empty rules for empty/null/undefined input', () => {
    expect(parseRulesJson('').rules).toHaveLength(0);
    expect(parseRulesJson(null).rules).toHaveLength(0);
    expect(parseRulesJson(undefined).rules).toHaveLength(0);
  });

  it('returns error for invalid JSON', () => {
    const { error } = parseRulesJson('{bad json}');
    expect(error).toBeTruthy();
  });

  it('returns error when rules key is missing', () => {
    const { error } = parseRulesJson('{"foo": []}');
    expect(error).toContain('rules');
  });

  it('parses valid rules JSON', () => {
    const json = JSON.stringify({
      rules: [{ id: 'r1', severity: 'error', type: 'cannot-connect' }],
    });
    const { rules, error } = parseRulesJson(json);
    expect(error).toBeNull();
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe('r1');
  });
});
