import type { Edge, Node } from 'reactflow';

export const DIAGRAM_DOCUMENT_VERSION = '1.0';
const DIAGRAM_DOCUMENT_NAME = 'FlowMind Diagram';

export interface DiagramDocumentV1 {
  version: string;
  name: string;
  createdAt: string;
  nodes: Node[];
  edges: Edge[];
}

export interface ImportCompatibilityResult {
  nodes: Node[];
  edges: Edge[];
  warnings: string[];
}

function isArrayPairDocument(value: unknown): value is { nodes: unknown; edges: unknown } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

function getVersionParts(version: string): { major: number | null; minor: number | null } {
  const [majorRaw, minorRaw] = version.split('.', 2);
  const major = Number(majorRaw);
  const minor = Number(minorRaw ?? '0');
  return {
    major: Number.isFinite(major) ? major : null,
    minor: Number.isFinite(minor) ? minor : null,
  };
}

export function createDiagramDocument(nodes: Node[], edges: Edge[]): DiagramDocumentV1 {
  return {
    version: DIAGRAM_DOCUMENT_VERSION,
    name: DIAGRAM_DOCUMENT_NAME,
    createdAt: new Date().toISOString(),
    nodes,
    edges,
  };
}

export function parseDiagramDocumentImport(raw: unknown): ImportCompatibilityResult {
  if (!isArrayPairDocument(raw)) {
    throw new Error('Invalid flow file: missing nodes or edges arrays.');
  }

  const candidate = raw as Record<string, unknown>;
  const warnings: string[] = [];
  const versionRaw = typeof candidate.version === 'string' ? candidate.version : null;
  const { major } = getVersionParts(versionRaw ?? DIAGRAM_DOCUMENT_VERSION);

  if (versionRaw === null) {
    warnings.push('Imported legacy JSON without version metadata; loaded with compatibility mode.');
  } else if (major !== null && major > 1) {
    throw new Error(
      `Unsupported flow file version "${versionRaw}". This app supports version ${DIAGRAM_DOCUMENT_VERSION}.x.`
    );
  }

  return {
    nodes: candidate.nodes as Node[],
    edges: candidate.edges as Edge[],
    warnings,
  };
}
