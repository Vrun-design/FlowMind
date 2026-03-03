import { Node, Edge } from 'reactflow';
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
    wireframe_button: 'button',
    wireframe_input: 'input',
    icon: 'icon',
    wireframe_image: 'placeholder',
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

export const toOpenFlowDSL = (nodes: Node[], edges: Edge[], options: OpenFlowDSLExportOptions = {}): string => {
    const lines: string[] = [];
    const mode = options.mode ?? 'deterministic';
    const { nodes: orderedNodes, edges: orderedEdges } = orderGraphForSerialization(nodes, edges, mode);
    const diagnosticsByEdgeId = new Set(getOpenFlowDSLExportDiagnostics(orderedNodes, orderedEdges).map((item) => item.edgeId));

    // Metadata
    lines.push('flow: "Untitled Flow"');
    lines.push('direction: TB');
    lines.push('');

    // Declarations
    // We want to export clearer syntax: [type] id: Label { attributes }

    // Helper to format attributes
    const formatAttributes = (data: any): string => {
        const attrs: string[] = [];
        // Extract relevant visual attributes from data
        // For now, let's just support a few common ones if they exist
        if (data.color && data.color !== 'slate') attrs.push(`color: "${data.color}"`);
        if (data.icon) attrs.push(`icon: "${data.icon}"`);

        if (attrs.length === 0) return '';
        return ` { ${attrs.join(', ')} }`;
    };

    // 1. Groups first? Or just flat list?
    // If we support hierarchy, we should print groups.
    // For now, let's stick to flat export until we implement full hierarchy management in the store/UI
    // But V2 parser supports groups.

    // Let's filter out sections/groups and handle them if they are parent nodes?
    // ReactFlow uses `parentId`.

    const getParentRef = (node: Node & { parentId?: string }) => node.parentNode ?? node.parentId;
    const parentNodes = orderedNodes.filter(n => !getParentRef(n as Node & { parentId?: string }));
    const childNodes = orderedNodes.filter(n => Boolean(getParentRef(n as Node & { parentId?: string })));

    // We need to recursively print nodes? Or just one level deep for groups?

    const printNode = (node: Node, indent: string = '') => {
        const dslType = TYPE_TO_DSL[node.type || 'process'] || 'process';
        const label = node.data?.label || 'Node';
        const id = node.id;

        // If label is simple alphanumeric and distinct, maybe we don't need explicit ID?
        // But V2 prefers explicit IDs to be safe.
        // Format: [type] id: Label { attrs }

        // Clean label for display?
        // If label == id, we can omit "id:" part if we want, but "id: Label" is consistently parsable.
        // Actually, V2 parser: [type] id: Label
        // If we output: [process] myNode: My Node Label

        lines.push(`${indent}[${dslType}] ${id}: ${label}${formatAttributes(node.data)}`);

        // Print children
        const children = childNodes.filter(c => getParentRef(c as Node & { parentId?: string }) === node.id);
        if (children.length > 0) {
            // It's a group?
            // Wait, dsl parser handles "group" keyword.
            // If the node itself is a group type?
            // "group" syntax in DSL is: group "Label" { ... }
            // But here we are printing it as a node first.
            // Adjust logic: if it has children, print as group block?
        }
    };

    // Better approach:
    // Iterate over top-level nodes.
    // If a node has children, print it as a group block.
    // If not, print as node.

    // Note: 'section' type might be used as group.

    const renderedIds = new Set<string>();

    const renderNode = (node: Node, indent: string = '') => {
        if (renderedIds.has(node.id)) return;
        renderedIds.add(node.id);

        const children = childNodes.filter(c => c.parentId === node.id);

        if (children.length > 0) {
            // Render as group
            const label = node.data?.label || 'Group';
            lines.push(`${indent}group "${label}" {`);
            children.forEach(child => renderNode(child, indent + '  '));
            lines.push(`${indent}}`);
        } else {
            // Render as normal node
            const dslType = TYPE_TO_DSL[node.type || 'process'] || 'process';
            const label = node.data?.label || 'Node';
            // sanitizing label?

            // Only output attributes if necessary
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

            // We use IDs for connections in V2
            const arrow = '->';
            // Check edge style?
            // if (edge.data?.styleType === 'dashed') arrow = '..>';
            // if (edge.data?.styleType === 'thick') arrow = '==>';
            // We can infer from edge.type or edge.animated?

            // For now default arrow

            const labelPart = edge.label ? `|${edge.label}|` : '';
            // edge.label might contain pipes? escape?

            // Output: SourceID -> TargetID { attrs }
            if (edge.label) {
                // Inline label syntax: A ->|Label| B
                lines.push(`${edge.source} ->${labelPart} ${edge.target}`);
            } else {
                lines.push(`${edge.source} -> ${edge.target}`);
            }
        }
    }

    return lines.join('\n');
};
