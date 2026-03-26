export type LintSeverity = 'error' | 'warning' | 'info';

export type LintRuleType = 'cannot-connect' | 'must-connect' | 'forbidden-cycle' | 'must-have-node' | 'node-count';

export interface NodeMatcher {
    /** Matches node.id exactly */
    id?: string;
    /** Matches node.data.label (case-insensitive contains) */
    labelContains?: string;
    /** Matches node.data.label (case-insensitive exact) */
    labelEquals?: string;
    /** Matches the React Flow node type (e.g. 'process', 'decision', 'start', 'end', 'section', 'group') */
    nodeType?: string;
}

export interface EdgeMatcher {
    /** Matches edge.label (case-insensitive contains) */
    labelContains?: string;
    /** Matches edge.label (case-insensitive exact) */
    labelEquals?: string;
    /** Matches edge.type (e.g. 'default', 'step', 'smoothstep') */
    edgeType?: string;
}

export interface LintRule {
    id: string;
    description?: string;
    severity: LintSeverity;
    type: LintRuleType;
    /** For cannot-connect / must-connect / forbidden-cycle: the source node matcher */
    from?: NodeMatcher;
    /** For cannot-connect / must-connect: the target node matcher */
    to?: NodeMatcher;
    /** For cannot-connect: optional edge matcher to further filter which edges are checked */
    edge?: EdgeMatcher;
    /** For node-count: minimum number of matching nodes required (inclusive) */
    min?: number;
    /** For node-count: maximum number of matching nodes allowed (inclusive) */
    max?: number;
}

export interface LintRuleFile {
    rules: LintRule[];
}

export interface LintViolation {
    ruleId: string;
    message: string;
    severity: LintSeverity;
    /** IDs of nodes implicated in this violation */
    nodeIds: string[];
    /** IDs of edges implicated in this violation */
    edgeIds: string[];
}
