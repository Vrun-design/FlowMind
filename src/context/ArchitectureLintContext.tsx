import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { LintViolation } from '@/services/architectureLint/types';
import { evaluateRules, parseRulesJson } from '@/services/architectureLint/ruleEngine';
import { loadWorkspaceRules, WORKSPACE_RULES_CHANGED_EVENT } from '@/services/architectureLint/workspaceRules';

interface ArchitectureLintContextValue {
    violations: LintViolation[];
    violatingNodeIds: ReadonlySet<string>;
    violatingEdgeIds: ReadonlySet<string>;
    parseError: string | null;
}

const ArchitectureLintContext = createContext<ArchitectureLintContextValue>({
    violations: [],
    violatingNodeIds: new Set(),
    violatingEdgeIds: new Set(),
    parseError: null,
});

export function useArchitectureLint(): ArchitectureLintContextValue {
    return useContext(ArchitectureLintContext);
}

interface ArchitectureLintProviderProps {
    nodes: FlowNode[];
    edges: FlowEdge[];
    rulesJson: string;
    children: React.ReactNode;
}

export function ArchitectureLintProvider({ nodes, edges, rulesJson, children }: ArchitectureLintProviderProps): React.ReactElement {
    const { rules: diagramRules, error: diagramParseError } = useMemo(() => parseRulesJson(rulesJson), [rulesJson]);

    const [workspaceRulesJson, setWorkspaceRulesJson] = useState(() => loadWorkspaceRules());
    useEffect(() => {
        const refresh = () => setWorkspaceRulesJson(loadWorkspaceRules());
        window.addEventListener(WORKSPACE_RULES_CHANGED_EVENT, refresh);
        return () => window.removeEventListener(WORKSPACE_RULES_CHANGED_EVENT, refresh);
    }, []);

    const { rules: workspaceRules } = useMemo(() => parseRulesJson(workspaceRulesJson), [workspaceRulesJson]);
    const rules = useMemo(() => [...workspaceRules, ...diagramRules], [workspaceRules, diagramRules]);

    const violations = useMemo(
        () => (rules.length > 0 ? evaluateRules(nodes, edges, rules) : []),
        [nodes, edges, rules],
    );

    const violatingNodeIds = useMemo(
        () => new Set(violations.flatMap((v) => v.nodeIds)),
        [violations],
    );

    const violatingEdgeIds = useMemo(
        () => new Set(violations.flatMap((v) => v.edgeIds)),
        [violations],
    );

    const value = useMemo(
        () => ({ violations, violatingNodeIds, violatingEdgeIds, parseError: diagramParseError }),
        [violations, violatingNodeIds, violatingEdgeIds, diagramParseError],
    );

    return <ArchitectureLintContext.Provider value={value}>{children}</ArchitectureLintContext.Provider>;
}
