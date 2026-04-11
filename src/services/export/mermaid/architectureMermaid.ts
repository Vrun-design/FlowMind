import type { FlowEdge, FlowNode } from '@/lib/types';
import { handleIdToSide as handleIdToFlowSide } from '@/lib/nodeHandles';
import { sanitizeId, sanitizeLabel, sanitizeEdgeLabel } from '../formatting';

const ARCHITECTURE_NODE_KINDS = new Set([
  'service',
  'person',
  'system',
  'container',
  'component',
  'database_container',
  'router',
  'switch',
  'firewall',
  'load_balancer',
  'cdn',
  'dns',
]);

function normalizeArchitectureDirection(direction: string | undefined): '-->' | '<--' | '<-->' {
  if (direction === '<--' || direction === '<-->') return direction;
  return '-->';
}

function normalizeArchitectureSide(side: string | undefined): 'L' | 'R' | 'T' | 'B' | undefined {
  if (!side) return undefined;
  const normalized = side.trim().toUpperCase();
  if (normalized === 'L' || normalized === 'R' || normalized === 'T' || normalized === 'B') {
    return normalized;
  }
  return undefined;
}

function handleIdToSide(handleId: string | null | undefined): 'L' | 'R' | 'T' | 'B' | undefined {
  const side = handleIdToFlowSide(handleId);
  if (side === 'left') return 'L';
  if (side === 'right') return 'R';
  if (side === 'top') return 'T';
  if (side === 'bottom') return 'B';
  return undefined;
}

function toArchitectureNodeStatement(node: FlowNode): string {
  const id = sanitizeId(node.id);
  const label = sanitizeLabel(node.data.label);
  const kind = (node.data.archResourceType || 'service').toLowerCase();
  const parent = node.data.archBoundaryId ? sanitizeId(node.data.archBoundaryId) : '';
  const provider = typeof node.data.archProvider === 'string' ? node.data.archProvider : '';
  const icon =
    provider && provider !== 'custom' && !(kind === 'group' && provider === 'group')
      ? `(${sanitizeLabel(provider)})`
      : '';
  const suffix = parent ? ` in ${parent}` : '';

  if (kind === 'group') {
    return `    group ${id}${icon}[${label}]${suffix}`;
  }

  if (kind === 'junction') {
    return `    junction ${id}${icon}[${label}]${suffix}`;
  }
  const statementKind = ARCHITECTURE_NODE_KINDS.has(kind) ? kind : 'service';

  return `    ${statementKind} ${id}${icon}[${label}]${suffix}`;
}

export function toArchitectureMermaid(nodes: FlowNode[], edges: FlowEdge[]): string {
  const lines: string[] = ['architecture-beta'];
  const titleNode = nodes.find(
    (node) => typeof node.data.archTitle === 'string' && node.data.archTitle.trim().length > 0
  );
  const title = typeof titleNode?.data.archTitle === 'string' ? sanitizeLabel(titleNode.data.archTitle) : '';

  if (title) {
    lines.push(`    title "${title}"`);
  }

  nodes.forEach((node) => {
    lines.push(toArchitectureNodeStatement(node));
  });

  edges.forEach((edge) => {
    const source = sanitizeId(edge.source);
    const target = sanitizeId(edge.target);
    const edgeData = edge.data as
      | {
          archProtocol?: string;
          archPort?: string;
          archDirection?: '-->' | '<--' | '<-->';
          archSourceSide?: 'L' | 'R' | 'T' | 'B';
          archTargetSide?: 'L' | 'R' | 'T' | 'B';
        }
      | undefined;
    const protocol = edgeData?.archProtocol;
    const port = edgeData?.archPort;
    const label = edge.label ? sanitizeEdgeLabel(String(edge.label)) : undefined;
    const sourceSide =
      normalizeArchitectureSide(edgeData?.archSourceSide) || handleIdToSide(edge.sourceHandle);
    const targetSide =
      normalizeArchitectureSide(edgeData?.archTargetSide) || handleIdToSide(edge.targetHandle);
    const direction = normalizeArchitectureDirection(
      edgeData?.archDirection ||
        (edge.markerStart && edge.markerEnd ? '<-->' : edge.markerStart ? '<--' : '-->')
    );

    const resolvedLabel = protocol
      ? `${sanitizeLabel(protocol).toUpperCase()}${port ? `:${sanitizeLabel(String(port))}` : ''}`
      : label;
    const sourceToken = sourceSide ? `${source}:${sourceSide}` : source;
    const targetToken = targetSide ? `${targetSide}:${target}` : target;

    if (resolvedLabel) {
      lines.push(`    ${sourceToken} ${direction} ${targetToken} : ${resolvedLabel}`);
    } else {
      lines.push(`    ${sourceToken} ${direction} ${targetToken}`);
    }
  });

  return `${lines.join('\n')}\n`;
}
