import type { FlowEdge, FlowNode } from '@/lib/types';
import type { EdgeMatcher, LintRule, LintViolation, NodeMatcher } from './types';

function matchesNode(node: FlowNode, matcher: NodeMatcher | undefined): boolean {
    if (!matcher) return true;

    if (matcher.id !== undefined && node.id !== matcher.id) return false;

    const label = typeof node.data.label === 'string' ? node.data.label : '';

    if (matcher.labelEquals !== undefined && label.toLowerCase() !== matcher.labelEquals.toLowerCase()) return false;

    if (matcher.labelContains !== undefined && !label.toLowerCase().includes(matcher.labelContains.toLowerCase())) return false;

    if (matcher.nodeType !== undefined && node.type !== matcher.nodeType) return false;

    return true;
}

function matchesEdge(edge: FlowEdge, matcher: EdgeMatcher | undefined): boolean {
    if (!matcher) return true;

    const label = typeof edge.label === 'string' ? edge.label : '';

    if (matcher.labelEquals !== undefined && label.toLowerCase() !== matcher.labelEquals.toLowerCase()) return false;

    if (matcher.labelContains !== undefined && !label.toLowerCase().includes(matcher.labelContains.toLowerCase())) return false;

    if (matcher.edgeType !== undefined && edge.type !== matcher.edgeType) return false;

    return true;
}

function evaluateCannotConnect(rule: LintRule, nodes: FlowNode[], edges: FlowEdge[]): LintViolation[] {
    const violations: LintViolation[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;
        if (matchesNode(source, rule.from) && matchesNode(target, rule.to) && matchesEdge(edge, rule.edge)) {
            const fromLabel = source.data.label || source.id;
            const toLabel = target.data.label || target.id;
            violations.push({
                ruleId: rule.id,
                message: rule.description ?? `"${fromLabel}" cannot connect to "${toLabel}"`,
                severity: rule.severity,
                nodeIds: [source.id, target.id],
                edgeIds: [edge.id],
            });
        }
    }

    return violations;
}

function evaluateMustConnect(rule: LintRule, nodes: FlowNode[], edges: FlowEdge[]): LintViolation[] {
    const violations: LintViolation[] = [];
    const fromNodes = nodes.filter((n) => matchesNode(n, rule.from));

    for (const fromNode of fromNodes) {
        const hasConnection = edges.some((edge) => {
            if (edge.source !== fromNode.id) return false;
            const target = nodes.find((n) => n.id === edge.target);
            return target ? matchesNode(target, rule.to) : false;
        });

        if (!hasConnection) {
            const fromLabel = fromNode.data.label || fromNode.id;
            violations.push({
                ruleId: rule.id,
                message: rule.description ?? `"${fromLabel}" must connect to a matching node`,
                severity: rule.severity,
                nodeIds: [fromNode.id],
                edgeIds: [],
            });
        }
    }

    return violations;
}

function evaluateForbiddenCycle(rule: LintRule, nodes: FlowNode[], edges: FlowEdge[]): LintViolation[] {
    const scopedNodes = nodes.filter((n) => matchesNode(n, rule.from));
    const scopedIds = new Set(scopedNodes.map((n) => n.id));

    const adj = new Map<string, string[]>();
    const edgeBySourceTarget = new Map<string, string>();
    for (const node of scopedNodes) adj.set(node.id, []);

    for (const edge of edges) {
        if (!scopedIds.has(edge.source) || !scopedIds.has(edge.target)) continue;
        adj.get(edge.source)!.push(edge.target);
        edgeBySourceTarget.set(`${edge.source}->${edge.target}`, edge.id);
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();
    const parent = new Map<string, string>();

    function dfs(nodeId: string): string[] | null {
        visited.add(nodeId);
        inStack.add(nodeId);

        for (const neighbor of adj.get(nodeId) ?? []) {
            if (!visited.has(neighbor)) {
                parent.set(neighbor, nodeId);
                const cycle = dfs(neighbor);
                if (cycle) return cycle;
            } else if (inStack.has(neighbor)) {
                const cyclePath: string[] = [neighbor, nodeId];
                let cur = nodeId;
                while (cur !== neighbor && parent.has(cur)) {
                    cur = parent.get(cur)!;
                    cyclePath.push(cur);
                }
                return cyclePath;
            }
        }

        inStack.delete(nodeId);
        return null;
    }

    for (const node of scopedNodes) {
        if (!visited.has(node.id)) {
            const cycle = dfs(node.id);
            if (cycle) {
                const cycleEdgeIds: string[] = [];
                for (let i = 0; i < cycle.length - 1; i++) {
                    const eid = edgeBySourceTarget.get(`${cycle[i + 1]}->${cycle[i]}`);
                    if (eid) cycleEdgeIds.push(eid);
                }
                return [{
                    ruleId: rule.id,
                    message: rule.description ?? 'Circular dependency detected',
                    severity: rule.severity,
                    nodeIds: [...new Set(cycle)],
                    edgeIds: cycleEdgeIds,
                }];
            }
        }
    }

    return [];
}

function evaluateMustHaveNode(rule: LintRule, nodes: FlowNode[]): LintViolation[] {
    const matching = nodes.filter((n) => matchesNode(n, rule.from));
    if (matching.length > 0) return [];

    return [{
        ruleId: rule.id,
        message: rule.description ?? 'Diagram is missing a required node type',
        severity: rule.severity,
        nodeIds: [],
        edgeIds: [],
    }];
}

function evaluateNodeCount(rule: LintRule, nodes: FlowNode[]): LintViolation[] {
    const matching = nodes.filter((n) => matchesNode(n, rule.from));
    const count = matching.length;
    const { min, max } = rule;

    if (min !== undefined && count < min) {
        return [{
            ruleId: rule.id,
            message: rule.description ?? `Expected at least ${min} matching node(s), found ${count}`,
            severity: rule.severity,
            nodeIds: matching.map((n) => n.id),
            edgeIds: [],
        }];
    }

    if (max !== undefined && count > max) {
        return [{
            ruleId: rule.id,
            message: rule.description ?? `Expected at most ${max} matching node(s), found ${count}`,
            severity: rule.severity,
            nodeIds: matching.map((n) => n.id),
            edgeIds: [],
        }];
    }

    return [];
}

export function evaluateRules(nodes: FlowNode[], edges: FlowEdge[], rules: LintRule[]): LintViolation[] {
    const violations: LintViolation[] = [];

    for (const rule of rules) {
        switch (rule.type) {
            case 'cannot-connect':
                violations.push(...evaluateCannotConnect(rule, nodes, edges));
                break;
            case 'must-connect':
                violations.push(...evaluateMustConnect(rule, nodes, edges));
                break;
            case 'forbidden-cycle':
                violations.push(...evaluateForbiddenCycle(rule, nodes, edges));
                break;
            case 'must-have-node':
                violations.push(...evaluateMustHaveNode(rule, nodes));
                break;
            case 'node-count':
                violations.push(...evaluateNodeCount(rule, nodes));
                break;
        }
    }

    return violations;
}

export function parseRulesJson(json: string | undefined | null): { rules: LintRule[]; error: string | null } {
    if (!json?.trim()) return { rules: [], error: null };

    try {
        const parsed: unknown = JSON.parse(json);
        if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as { rules?: unknown }).rules)) {
            return { rules: [], error: 'Expected { "rules": [...] }' };
        }
        const rules = (parsed as { rules: LintRule[] }).rules;
        return { rules, error: null };
    } catch (e) {
        return { rules: [], error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
}
