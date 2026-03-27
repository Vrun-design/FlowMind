import type { EdgeData, FlowEdge, FlowNode, NodeData } from './types';

export type ArchitectureTemplateId =
  | 'three-tier-web'
  | 'microservices'
  | 'event-driven'
  | 'c4-system-context'
  | 'network-edge-security';

interface TemplateNodeSpec {
  key: string;
  offsetX: number;
  offsetY: number;
  data: Partial<NodeData> & Pick<NodeData, 'label'>;
}

interface TemplateEdgeSpec {
  source: string;
  target: string;
  label?: string;
  data?: Partial<EdgeData>;
}

interface ArchitectureTemplateDefinition {
  id: ArchitectureTemplateId;
  label: string;
  description: string;
  anchor: Partial<NodeData> & Pick<NodeData, 'label'>;
  nodes: TemplateNodeSpec[];
  edges: TemplateEdgeSpec[];
}

type InheritedArchitectureData = Pick<
  NodeData,
  'archProvider' | 'archEnvironment' | 'archBoundaryId' | 'archZone' | 'archTrustDomain'
>;

export interface ArchitectureTemplateOption {
  id: ArchitectureTemplateId;
  label: string;
  description: string;
}

export interface BuiltArchitectureTemplate {
  sourceData: Partial<NodeData>;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const TEMPLATE_DEFINITIONS: ArchitectureTemplateDefinition[] = [
  {
    id: 'three-tier-web',
    label: '3-tier web',
    description: 'Presentation, application, and data services.',
    anchor: {
      label: 'Web App',
      subLabel: 'Presentation tier',
      archProvider: 'custom',
      archResourceType: 'service',
      icon: 'Monitor',
      color: 'blue',
    },
    nodes: [
      {
        key: 'api',
        offsetX: 260,
        offsetY: 0,
        data: {
          label: 'API Layer',
          subLabel: 'Business logic',
          icon: 'Server',
          color: 'violet',
          archResourceType: 'service',
        },
      },
      {
        key: 'cache',
        offsetX: 520,
        offsetY: -90,
        data: {
          label: 'Cache',
          subLabel: 'Session and query cache',
          icon: 'Zap',
          color: 'amber',
          archResourceType: 'service',
        },
      },
      {
        key: 'database',
        offsetX: 520,
        offsetY: 90,
        data: {
          label: 'Primary Database',
          subLabel: 'Persistent storage',
          icon: 'Database',
          color: 'emerald',
          archResourceType: 'database',
        },
      },
    ],
    edges: [
      { source: 'source', target: 'api', label: 'HTTPS' },
      { source: 'api', target: 'cache', label: 'read/write' },
      { source: 'api', target: 'database', label: 'SQL' },
    ],
  },
  {
    id: 'microservices',
    label: 'Microservices',
    description: 'Gateway, services, and async processing.',
    anchor: {
      label: 'API Gateway',
      subLabel: 'Ingress and routing',
      archProvider: 'custom',
      archResourceType: 'service',
      icon: 'Network',
      color: 'blue',
    },
    nodes: [
      {
        key: 'auth',
        offsetX: 250,
        offsetY: -120,
        data: {
          label: 'Auth Service',
          subLabel: 'Identity and tokens',
          icon: 'Lock',
          color: 'violet',
          archResourceType: 'service',
        },
      },
      {
        key: 'orders',
        offsetX: 250,
        offsetY: 0,
        data: {
          label: 'Orders Service',
          subLabel: 'Checkout orchestration',
          icon: 'Package',
          color: 'violet',
          archResourceType: 'service',
        },
      },
      {
        key: 'notifications',
        offsetX: 250,
        offsetY: 120,
        data: {
          label: 'Notifications',
          subLabel: 'Email and alerts',
          icon: 'Bell',
          color: 'blue',
          archResourceType: 'service',
        },
      },
      {
        key: 'queue',
        offsetX: 520,
        offsetY: 60,
        data: {
          label: 'Event Queue',
          subLabel: 'Async delivery',
          icon: 'MessageSquare',
          color: 'amber',
          archResourceType: 'queue',
        },
      },
    ],
    edges: [
      { source: 'source', target: 'auth', label: 'auth' },
      { source: 'source', target: 'orders', label: 'REST' },
      { source: 'orders', target: 'queue', label: 'publish' },
      { source: 'queue', target: 'notifications', label: 'consume' },
    ],
  },
  {
    id: 'event-driven',
    label: 'Event-driven',
    description: 'Producer, broker, and consumer layout.',
    anchor: {
      label: 'Event Producer',
      subLabel: 'Application domain event',
      archProvider: 'custom',
      archResourceType: 'service',
      icon: 'Send',
      color: 'blue',
    },
    nodes: [
      {
        key: 'broker',
        offsetX: 270,
        offsetY: 0,
        data: {
          label: 'Event Broker',
          subLabel: 'Topic routing',
          icon: 'GitBranch',
          color: 'amber',
          archResourceType: 'queue',
        },
      },
      {
        key: 'consumer-a',
        offsetX: 540,
        offsetY: -110,
        data: {
          label: 'Consumer A',
          subLabel: 'Realtime processing',
          icon: 'Zap',
          color: 'violet',
          archResourceType: 'service',
        },
      },
      {
        key: 'consumer-b',
        offsetX: 540,
        offsetY: 0,
        data: {
          label: 'Consumer B',
          subLabel: 'Analytics pipeline',
          icon: 'BarChart3',
          color: 'blue',
          archResourceType: 'service',
        },
      },
      {
        key: 'storage',
        offsetX: 540,
        offsetY: 110,
        data: {
          label: 'Event Store',
          subLabel: 'Durable retention',
          icon: 'Database',
          color: 'emerald',
          archResourceType: 'database',
        },
      },
    ],
    edges: [
      { source: 'source', target: 'broker', label: 'publish' },
      { source: 'broker', target: 'consumer-a', label: 'subscribe' },
      { source: 'broker', target: 'consumer-b', label: 'fan out' },
      { source: 'broker', target: 'storage', label: 'persist' },
    ],
  },
  {
    id: 'c4-system-context',
    label: 'C4 system context',
    description: 'People, platform boundary, and supporting systems.',
    anchor: {
      label: 'OpenFlowKit Platform',
      subLabel: 'Primary software system',
      archProvider: 'custom',
      archResourceType: 'system',
      icon: 'Box',
      color: 'slate',
    },
    nodes: [
      {
        key: 'developer',
        offsetX: -280,
        offsetY: 0,
        data: {
          label: 'Developer',
          subLabel: 'Creates and updates diagrams',
          icon: 'User',
          color: 'blue',
          archResourceType: 'person',
        },
      },
      {
        key: 'docs',
        offsetX: 280,
        offsetY: -120,
        data: {
          label: 'Docs Site',
          subLabel: 'Embeds published diagrams',
          icon: 'BookOpen',
          color: 'violet',
          archResourceType: 'container',
        },
      },
      {
        key: 'repo',
        offsetX: 280,
        offsetY: 120,
        data: {
          label: 'Source Repo',
          subLabel: 'Versioned diagram definitions',
          icon: 'GitBranch',
          color: 'emerald',
          archResourceType: 'container',
        },
      },
      {
        key: 'database',
        offsetX: 540,
        offsetY: 120,
        data: {
          label: 'Project Data',
          subLabel: 'Snapshots and exports',
          icon: 'Database',
          color: 'cyan',
          archResourceType: 'database_container',
        },
      },
    ],
    edges: [
      { source: 'developer', target: 'source', label: 'edits' },
      { source: 'source', target: 'docs', label: 'publishes views' },
      { source: 'source', target: 'repo', label: 'exports JSON / Mermaid' },
      { source: 'repo', target: 'database', label: 'stores artifacts' },
    ],
  },
  {
    id: 'network-edge-security',
    label: 'Network edge security',
    description: 'DNS, CDN, firewall, and private service tiers.',
    anchor: {
      label: 'Public DNS',
      subLabel: 'Traffic entrypoint',
      archProvider: 'custom',
      archResourceType: 'dns',
      icon: 'Globe2',
      color: 'lime',
    },
    nodes: [
      {
        key: 'cdn',
        offsetX: 240,
        offsetY: 0,
        data: {
          label: 'CDN Edge',
          subLabel: 'Cache and TLS termination',
          icon: 'Globe',
          color: 'violet',
          archResourceType: 'cdn',
        },
      },
      {
        key: 'firewall',
        offsetX: 500,
        offsetY: 0,
        data: {
          label: 'WAF / Firewall',
          subLabel: 'Ingress filtering',
          icon: 'Shield',
          color: 'red',
          archResourceType: 'firewall',
        },
      },
      {
        key: 'load-balancer',
        offsetX: 760,
        offsetY: 0,
        data: {
          label: 'Load Balancer',
          subLabel: 'Traffic distribution',
          icon: 'Scale',
          color: 'orange',
          archResourceType: 'load_balancer',
        },
      },
      {
        key: 'services',
        offsetX: 1020,
        offsetY: -100,
        data: {
          label: 'Application Services',
          subLabel: 'Private app tier',
          icon: 'ServerCog',
          color: 'blue',
          archResourceType: 'service',
        },
      },
      {
        key: 'vpn',
        offsetX: 1020,
        offsetY: 100,
        data: {
          label: 'VPN Access',
          subLabel: 'Operator private path',
          icon: 'Cable',
          color: 'violet',
          archResourceType: 'service',
        },
      },
    ],
    edges: [
      { source: 'source', target: 'cdn', label: 'resolves' },
      { source: 'cdn', target: 'firewall', label: 'forwards' },
      { source: 'firewall', target: 'load-balancer', label: 'allows 443' },
      { source: 'load-balancer', target: 'services', label: 'routes HTTPS' },
      { source: 'vpn', target: 'services', label: 'private ops' },
    ],
  },
];

export function getArchitectureTemplateOptions(): ArchitectureTemplateOption[] {
  return TEMPLATE_DEFINITIONS.map(({ id, label, description }) => ({ id, label, description }));
}

function resolveInheritedArchitectureData(
  sourceNode: FlowNode,
  anchor: Partial<NodeData>,
): InheritedArchitectureData {
  return {
    archProvider: sourceNode.data.archProvider || anchor.archProvider || 'custom',
    archEnvironment: sourceNode.data.archEnvironment || 'default',
    archBoundaryId: sourceNode.data.archBoundaryId,
    archZone: sourceNode.data.archZone,
    archTrustDomain: sourceNode.data.archTrustDomain,
  };
}

function createTemplateEdge(
  id: string,
  source: string,
  target: string,
  label: string | undefined,
  data: Partial<EdgeData> | undefined,
): FlowEdge {
  return {
    id,
    source,
    target,
    label,
    type: 'default',
    animated: false,
    data,
  };
}

export function buildArchitectureTemplate(
  templateId: ArchitectureTemplateId,
  sourceNode: FlowNode,
  createNodeId: (key: string) => string,
  createEdgeId: (key: string) => string,
): BuiltArchitectureTemplate | null {
  const template = TEMPLATE_DEFINITIONS.find((candidate) => candidate.id === templateId);
  if (!template) {
    return null;
  }

  const inheritedData = resolveInheritedArchitectureData(sourceNode, template.anchor);
  const nodeIdByKey = new Map<string, string>([['source', sourceNode.id]]);
  const nodes = template.nodes.map((definition) => {
    const id = createNodeId(definition.key);
    nodeIdByKey.set(definition.key, id);

    return {
      id,
      type: 'architecture',
      position: {
        x: sourceNode.position.x + definition.offsetX,
        y: sourceNode.position.y + definition.offsetY,
      },
      data: {
        ...sourceNode.data,
        ...definition.data,
        ...inheritedData,
      },
      selected: false,
    } satisfies FlowNode;
  });

  const edges = template.edges.map((definition, index) => {
    const source = nodeIdByKey.get(definition.source);
    const target = nodeIdByKey.get(definition.target);
    if (!source || !target) {
      throw new Error(`Architecture template "${templateId}" has an invalid edge definition at index ${index}.`);
    }

    return createTemplateEdge(
      createEdgeId(`${definition.source}-${definition.target}`),
      source,
      target,
      definition.label,
      definition.data,
    );
  });

  return {
    sourceData: {
      ...template.anchor,
      ...inheritedData,
    },
    nodes,
    edges,
  };
}
