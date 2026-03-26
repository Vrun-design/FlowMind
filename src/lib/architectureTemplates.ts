import type { EdgeData, FlowEdge, FlowNode, NodeData } from './types';

export type ArchitectureTemplateId = 'three-tier-web' | 'microservices' | 'event-driven';

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
];

export function getArchitectureTemplateOptions(): ArchitectureTemplateOption[] {
  return TEMPLATE_DEFINITIONS.map(({ id, label, description }) => ({ id, label, description }));
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
        archProvider: sourceNode.data.archProvider || template.anchor.archProvider || 'custom',
        archEnvironment: sourceNode.data.archEnvironment || 'default',
        archBoundaryId: sourceNode.data.archBoundaryId,
        archZone: sourceNode.data.archZone,
        archTrustDomain: sourceNode.data.archTrustDomain,
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
      archProvider: sourceNode.data.archProvider || template.anchor.archProvider || 'custom',
      archEnvironment: sourceNode.data.archEnvironment || 'default',
      archBoundaryId: sourceNode.data.archBoundaryId,
      archZone: sourceNode.data.archZone,
      archTrustDomain: sourceNode.data.archTrustDomain,
    },
    nodes,
    edges,
  };
}
