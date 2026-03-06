import type { Edge, Node } from '@/lib/reactflowCompat';
import { getNodeParentId } from '@/lib/nodeParent';
import { orderGraphForSerialization, type ExportSerializationMode } from './canonicalSerialization';

const TYPE_TO_DSL: Record<string, string> = {
    start: 'start',
    process: 'process',
    decision: 'decision',
    end: 'end',
    custom: 'system',
    annotation: 'note',
    section: 'section',
    browser: 'browser',
    mobile: 'mobile',
    container: 'container',
};

/**
 * Export FlowMind nodes/edges to our custom DSL V2 text format.
 */
export interface OpenFlowDSLExportOptions {
    mode?: ExportSerializationMode;
}

export interface OpenFlowDSLExportDiagnostic {
    edgeId: string;
    source: string;
    target: string;
    message: string;
}

function getStringField(data: Record<string, unknown> | undefined, key: string): string | undefined {
    const value = data?.[key];
    if (typeof value !== 'string') return undefined;
    return value;
}

export function getOpenFlowDSLExportDiagnostics(nodes: Node[], edges: Edge[]): OpenFlowDSLExportDiagnostic[] {
    const nodeIdSet = new Set(nodes.map((node) => node.id));
    const diagnostics: OpenFlowDSLExportDiagnostic[] = [];

    edges.forEach((edge) => {
        const sourceNodeExists = nodeIdSet.has(edge.source);
        const targetNodeExists = nodeIdSet.has(edge.target);
        if (sourceNodeExists && targetNodeExists) return;

        const missingParts: string[] = [];
        if (!sourceNodeExists) missingParts.push(`source "${edge.source}"`);
        if (!targetNodeExists) missingParts.push(`target "${edge.target}"`);

        diagnostics.push({
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            message: `Edge "${edge.id}" skipped in DSL export (missing ${missingParts.join(' and ')}).`,
        });
    });

    return diagnostics;
}

export function toOpenFlowDSL(nodes: Node[], edges: Edge[], options: OpenFlowDSLExportOptions = {}): string {
    const lines: string[] = [];
    const mode = options.mode ?? 'deterministic';
    const { nodes: orderedNodes, edges: orderedEdges } = orderGraphForSerialization(nodes, edges, mode);
    const diagnosticsByEdgeId = new Set(getOpenFlowDSLExportDiagnostics(orderedNodes, orderedEdges).map((item) => item.edgeId));

    // Metadata
    lines.push('flow: "Untitled Flow"');
    lines.push('direction: TB');
    lines.push('');

    const formatAttributes = (data: Record<string, unknown> | undefined): string => {
        if (!data) return '';

        const attrs: string[] = [];
        const color = getStringField(data, 'color');
        const icon = getStringField(data, 'icon');
        if (color && color !== 'slate') attrs.push(`color: "${color}"`);
        if (icon) attrs.push(`icon: "${icon}"`);

        if (attrs.length === 0) return '';
        return ` { ${attrs.join(', ')} }`;
    };

    const parentNodes = orderedNodes.filter((n) => !getNodeParentId(n));
    const childrenByParent = new Map<string, Node[]>();
    for (const node of orderedNodes) {
        const parentId = getNodeParentId(node);
        if (!parentId) continue;
        const children = childrenByParent.get(parentId);
        if (children) {
            children.push(node);
        } else {
            childrenByParent.set(parentId, [node]);
        }
    }

    const renderedIds = new Set<string>();

    const renderNode = (node: Node, indent: string = '') => {
        if (renderedIds.has(node.id)) return;
        renderedIds.add(node.id);

        const children = childrenByParent.get(node.id) || [];

        if (children.length > 0) {
            const label = getStringField(node.data, 'label') || 'Group';
            lines.push(`${indent}group "${label}" {`);
            children.forEach((childNode) => renderNode(childNode, indent + '  '));
            lines.push(`${indent}}`);
        } else {
            const dslType = TYPE_TO_DSL[node.type || 'process'] || 'process';
            const label = getStringField(node.data, 'label') || 'Node';
            const attrs = formatAttributes(node.data);

            lines.push(`${indent}[${dslType}] ${node.id}: ${label}${attrs}`);
        }
    };

    parentNodes.forEach((n) => renderNode(n));

    if (edges.length > 0) {
        lines.push('');
        lines.push('# Edges');
        for (const edge of orderedEdges) {
            if (diagnosticsByEdgeId.has(edge.id)) continue;

            const labelPart = edge.label ? `|${edge.label}|` : '';
            if (edge.label) {
                lines.push(`${edge.source} ->${labelPart} ${edge.target}`);
            } else {
                lines.push(`${edge.source} -> ${edge.target}`);
            }
        }
    }

    return lines.join('\n');
}
