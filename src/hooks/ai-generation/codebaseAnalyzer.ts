import type { SupportedLanguage } from './codeToArchitecture';
import {
  type DirectoryNode,
  type FileImport,
  buildFileTree,
  shouldIncludeFile,
  detectLanguage,
  parseImports,
  parseTsConfigAliases,
  resolveAliasImport,
} from './codebaseParser';

// ── Types ───────────────────────────────────────────────────────────

export interface CodebaseFile {
  path: string;
  content: string;
  language: SupportedLanguage | null;
  imports: FileImport[];
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export type CloudPlatform = 'aws' | 'gcp' | 'azure' | 'cncf' | 'docker' | 'mixed' | 'unknown';
export type DetectedServiceType =
  | 'database'
  | 'cache'
  | 'queue'
  | 'api'
  | 'compute'
  | 'storage'
  | 'identity'
  | 'network'
  | 'observability'
  | 'service'
  | 'messaging';
export type DetectedServiceProvider =
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'cncf'
  | 'docker'
  | 'third-party'
  | 'unknown';
export type SuggestedArchitectureResourceType =
  | 'service'
  | 'database'
  | 'queue'
  | 'cdn'
  | 'dns'
  | 'load_balancer'
  | 'firewall';
export type SuggestedNodeColor =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'slate'
  | 'pink'
  | 'yellow';

export interface DetectedService {
  name: string;
  type: DetectedServiceType;
  provider: DetectedServiceProvider;
  resourceType: SuggestedArchitectureResourceType;
  suggestedColor: SuggestedNodeColor;
  iconPackId?: string;
  iconShapeId?: string;
  evidence: string[];
}

export interface CodebaseAnalysis {
  files: CodebaseFile[];
  edges: DependencyEdge[];
  entryPoints: string[];
  cloudPlatform: CloudPlatform;
  detectedServices: DetectedService[];
  infraFiles: string[];
  stats: {
    totalFiles: number;
    sourceFiles: number;
    languages: Record<string, number>;
    directories: number;
  };
  summary: string;
}

// ── Analysis ────────────────────────────────────────────────────────

const ENTRY_POINT_PATTERNS = [
  /^index\.[jt]sx?$/,
  /^main\.[jt]sx?$/,
  /^app\.[jt]sx?$/,
  /^main\.py$/,
  /^app\.py$/,
  /^main\.go$/,
  /^cmd\//,
  /^src\/index\.[jt]sx?$/,
  /^src\/main\.[jt]sx?$/,
  /^src\/app\.[jt]sx?$/,
];

function resolveRelativeImport(fromPath: string, importSource: string): string | null {
  if (!importSource.startsWith('.')) return null;
  const dir = fromPath.split('/').slice(0, -1).join('/');
  const resolved = [...dir.split('/').filter(Boolean), ...importSource.split('/').filter(Boolean)];
  const normalized: string[] = [];
  for (const part of resolved) {
    if (part === '..') normalized.pop();
    else if (part !== '.') normalized.push(part);
  }
  return normalized.join('/');
}

function tryResolvePath(path: string, allFiles: Set<string>): string | null {
  const extensions = [
    '',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '/index.ts',
    '/index.tsx',
    '/index.js',
  ];
  for (const ext of extensions) {
    const candidate = path + ext;
    if (allFiles.has(candidate)) return candidate;
  }
  return null;
}

export function analyzeCodebase(
  rawFiles: Array<{ path: string; content: string }>,
  maxFiles = 500
): CodebaseAnalysis {
  const tsconfigContent = rawFiles.find(
    (f) => f.path === 'tsconfig.json' || f.path === 'jsconfig.json'
  )?.content;
  const packageJsonContent = rawFiles.find((f) => f.path === 'package.json')?.content;
  const aliases = parseTsConfigAliases(tsconfigContent ?? null, packageJsonContent ?? null);

  const filteredFiles = rawFiles
    .filter((f) => shouldIncludeFile(f.path) && !f.path.endsWith('.json'))
    .slice(0, maxFiles);

  const allPaths = new Set(filteredFiles.map((f) => f.path));

  const files: CodebaseFile[] = filteredFiles.map((f) => {
    const language = detectLanguage(f.path);
    const imports = parseImports(f.content, language, aliases);
    return { path: f.path, content: f.content, language, imports };
  });

  const edges: DependencyEdge[] = [];
  for (const file of files) {
    for (const imp of file.imports) {
      let resolved: string | null = null;
      if (imp.isLocal && imp.source.startsWith('.')) {
        resolved = resolveRelativeImport(file.path, imp.source);
      } else if (imp.isLocal) {
        resolved = resolveAliasImport(imp.source, aliases);
      }
      if (!resolved) continue;
      const target = tryResolvePath(resolved, allPaths);
      if (target && target !== file.path) {
        edges.push({ from: file.path, to: target });
      }
    }
  }

  const entryPoints = files
    .filter((f) => ENTRY_POINT_PATTERNS.some((p) => p.test(f.path)))
    .map((f) => f.path);

  const languages: Record<string, number> = {};
  for (const file of files) {
    if (file.language) {
      languages[file.language] = (languages[file.language] ?? 0) + 1;
    }
  }

  const dirSet = new Set<string>();
  for (const file of files) {
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      dirSet.add(parts.slice(0, i).join('/'));
    }
  }

  const tree = buildFileTree(files.map((f) => f.path));
  const cloudPlatform = detectCloudPlatform(rawFiles);
  const detectedServices = detectServices(rawFiles);
  const infraFiles = detectInfraFiles(rawFiles);
  const summary = buildSummary(
    files,
    edges,
    entryPoints,
    tree,
    languages,
    dirSet.size,
    cloudPlatform,
    detectedServices,
    infraFiles
  );

  return {
    files,
    edges,
    entryPoints,
    cloudPlatform,
    detectedServices,
    infraFiles,
    stats: {
      totalFiles: rawFiles.length,
      sourceFiles: files.length,
      languages,
      directories: dirSet.size,
    },
    summary,
  };
}

function buildSummary(
  files: CodebaseFile[],
  edges: DependencyEdge[],
  entryPoints: string[],
  tree: DirectoryNode,
  languages: Record<string, number>,
  dirCount: number,
  cloudPlatform: CloudPlatform,
  detectedServices: DetectedService[],
  infraFiles: string[]
): string {
  const lines: string[] = [];

  const langSummary = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `${lang}: ${count}`)
    .join(', ');

  lines.push(`CODEBASE STRUCTURE`);
  lines.push(`Files: ${files.length} source files across ${dirCount} directories`);
  lines.push(`Languages: ${langSummary}`);
  lines.push(`Detected platform: ${cloudPlatform}`);
  lines.push('');

  if (detectedServices.length > 0) {
    lines.push('DETECTED SERVICES:');
    for (const service of detectedServices.slice(0, 12)) {
      const evidence = service.evidence.length > 0 ? ` — ${service.evidence.join(', ')}` : '';
      const iconHint =
        service.iconPackId && service.iconShapeId
          ? ` icon=${service.iconPackId}:${service.iconShapeId}`
          : '';
      lines.push(
        `  ${service.name} [${service.type}] via ${service.provider} -> ${service.resourceType}/${service.suggestedColor}${iconHint}${evidence}`
      );
    }
    lines.push('');
  }

  if (infraFiles.length > 0) {
    lines.push('INFRA FILES:');
    for (const infraFile of infraFiles.slice(0, 12)) {
      lines.push(`  ${infraFile}`);
    }
    lines.push('');
  }

  if (entryPoints.length > 0) {
    lines.push('ENTRY POINTS:');
    for (const ep of entryPoints.slice(0, 10)) {
      lines.push(`  ${ep}`);
    }
    lines.push('');
  }

  const depCounts = new Map<string, { incoming: number; outgoing: number }>();
  for (const edge of edges) {
    const from = depCounts.get(edge.from) ?? { incoming: 0, outgoing: 0 };
    from.outgoing++;
    depCounts.set(edge.from, from);
    const to = depCounts.get(edge.to) ?? { incoming: 0, outgoing: 0 };
    to.incoming++;
    depCounts.set(edge.to, to);
  }

  const hotFiles = [...depCounts.entries()]
    .filter(([, counts]) => counts.incoming >= 2)
    .sort((a, b) => b[1].incoming - a[1].incoming)
    .slice(0, 10);

  if (hotFiles.length > 0) {
    lines.push('KEY MODULES (most depended-on):');
    for (const [path, counts] of hotFiles) {
      lines.push(`  ${path} (${counts.incoming} dependents)`);
    }
    lines.push('');
  }

  const topDirs = getTopDirectories(tree);
  if (topDirs.length > 0) {
    lines.push('TOP-LEVEL STRUCTURE:');
    for (const dir of topDirs.slice(0, 15)) {
      lines.push(`  ${dir.path}/ — ${dir.fileCount} files`);
    }
    lines.push('');
  }

  if (edges.length > 0) {
    lines.push('DEPENDENCY GRAPH (local imports only):');
    const grouped = new Map<string, string[]>();
    for (const edge of edges.slice(0, 100)) {
      const dir = edge.from.split('/').slice(0, -1).join('/') || '/';
      if (!grouped.has(dir)) grouped.set(dir, []);
      grouped.get(dir)!.push(`  ${edge.from} → ${edge.to}`);
    }
    for (const [dir, deps] of grouped) {
      lines.push(`[${dir}]`);
      for (const dep of deps.slice(0, 5)) {
        lines.push(dep);
      }
    }
  }

  return lines.join('\n');
}

interface DirInfo {
  path: string;
  fileCount: number;
}

function getTopDirectories(tree: DirectoryNode): DirInfo[] {
  const dirs: DirInfo[] = [];
  for (const [name, child] of tree.children) {
    dirs.push({ path: name, fileCount: countFilesInNode(child) });
  }
  return dirs.sort((a, b) => b.fileCount - a.fileCount);
}

function countFilesInNode(node: DirectoryNode): number {
  let count = node.files.length;
  for (const child of node.children.values()) {
    count += countFilesInNode(child);
  }
  return count;
}

interface DetectionRule {
  name: string;
  type: DetectedServiceType;
  provider: DetectedServiceProvider;
  resourceType?: SuggestedArchitectureResourceType;
  suggestedColor?: SuggestedNodeColor;
  patterns: RegExp[];
}

const SERVICE_DETECTION_RULES: DetectionRule[] = [
  {
    name: 'PostgreSQL',
    type: 'database',
    provider: 'unknown',
    resourceType: 'database',
    patterns: [/\bpsycopg\b/i, /\bpostgres\b/i, /\bpostgresql\b/i, /\bpg\b/i],
  },
  {
    name: 'MySQL',
    type: 'database',
    provider: 'unknown',
    resourceType: 'database',
    patterns: [/\bmysql2?\b/i, /\bpymysql\b/i],
  },
  {
    name: 'MongoDB',
    type: 'database',
    provider: 'unknown',
    resourceType: 'database',
    patterns: [/\bmongodb\b/i, /\bmongoose\b/i],
  },
  {
    name: 'Redis',
    type: 'cache',
    provider: 'unknown',
    resourceType: 'service',
    suggestedColor: 'yellow',
    patterns: [/\bioredis\b/i, /\bredis\b/i],
  },
  {
    name: 'Kafka',
    type: 'messaging',
    provider: 'unknown',
    resourceType: 'queue',
    patterns: [/\bkafkajs\b/i, /\bconfluent-kafka\b/i, /\bkafka-python\b/i],
  },
  {
    name: 'RabbitMQ',
    type: 'queue',
    provider: 'unknown',
    resourceType: 'queue',
    patterns: [/\bamqplib\b/i, /\bpika\b/i],
  },
  {
    name: 'S3',
    type: 'storage',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\bS3Client\b/, /\bs3\b/i, /\bboto3\b/i],
  },
  {
    name: 'CloudFront',
    type: 'network',
    provider: 'aws',
    resourceType: 'cdn',
    patterns: [/\bcloudfront\b/i],
  },
  {
    name: 'RDS',
    type: 'database',
    provider: 'aws',
    resourceType: 'database',
    patterns: [/\bRDS\b/, /\brds\b/i],
  },
  {
    name: 'DynamoDB',
    type: 'database',
    provider: 'aws',
    resourceType: 'database',
    patterns: [/\bDynamoDB\b/, /\bdynamodb\b/i],
  },
  {
    name: 'Lambda',
    type: 'compute',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\bLambda\b/, /@aws-sdk\/client-lambda/, /\blambda\b/i],
  },
  {
    name: 'API Gateway',
    type: 'api',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\bapigateway\b/i, /\bapi gateway\b/i],
  },
  {
    name: 'ElastiCache',
    type: 'cache',
    provider: 'aws',
    resourceType: 'service',
    suggestedColor: 'yellow',
    patterns: [/\belasticache\b/i],
  },
  {
    name: 'SQS',
    type: 'queue',
    provider: 'aws',
    resourceType: 'queue',
    patterns: [/\bSQS\b/, /\bsqs\b/i],
  },
  {
    name: 'SNS',
    type: 'messaging',
    provider: 'aws',
    resourceType: 'queue',
    patterns: [/\bSNS\b/, /\bsns\b/i],
  },
  {
    name: 'EventBridge',
    type: 'messaging',
    provider: 'aws',
    resourceType: 'queue',
    patterns: [/\beventbridge\b/i],
  },
  {
    name: 'ECS',
    type: 'compute',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\baws ecs\b/i, /\becs\b/i, /ecsTaskDefinition/i],
  },
  {
    name: 'EKS',
    type: 'compute',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\baws eks\b/i, /\beks\b/i],
  },
  {
    name: 'Cognito',
    type: 'identity',
    provider: 'aws',
    resourceType: 'service',
    patterns: [/\bCognito\b/, /\bcognito\b/i],
  },
  {
    name: 'Azure Functions',
    type: 'compute',
    provider: 'azure',
    resourceType: 'service',
    patterns: [/@azure\/functions/i, /\bfunctionapp\b/i, /\bazure functions\b/i],
  },
  {
    name: 'Azure SQL',
    type: 'database',
    provider: 'azure',
    resourceType: 'database',
    patterns: [/\bazure sql\b/i, /\bmssql\b/i],
  },
  {
    name: 'Azure Storage',
    type: 'storage',
    provider: 'azure',
    resourceType: 'service',
    patterns: [/\bblob storage\b/i, /@azure\/storage/i],
  },
  {
    name: 'Azure API Management',
    type: 'api',
    provider: 'azure',
    resourceType: 'service',
    patterns: [/\bapi management\b/i, /api-management-services/i],
  },
  {
    name: 'Azure Front Door',
    type: 'network',
    provider: 'azure',
    resourceType: 'cdn',
    patterns: [/\bfront door\b/i, /front-door-and-cdn-profiles/i],
  },
  {
    name: 'Azure Service Bus',
    type: 'messaging',
    provider: 'azure',
    resourceType: 'queue',
    patterns: [/\bservice bus\b/i, /@azure\/service-bus/i],
  },
  {
    name: 'AKS',
    type: 'compute',
    provider: 'azure',
    resourceType: 'service',
    patterns: [/\bazure kubernetes service\b/i, /\baks\b/i],
  },
  {
    name: 'Cloud Storage',
    type: 'storage',
    provider: 'gcp',
    resourceType: 'service',
    patterns: [/@google-cloud\/storage/, /\bcloud storage\b/i],
  },
  {
    name: 'Cloud SQL',
    type: 'database',
    provider: 'gcp',
    resourceType: 'database',
    patterns: [/\bcloud sql\b/i, /@google-cloud\/sql/i],
  },
  {
    name: 'Cloud Run',
    type: 'compute',
    provider: 'gcp',
    resourceType: 'service',
    patterns: [/\bcloud run\b/i],
  },
  {
    name: 'Cloud Functions',
    type: 'compute',
    provider: 'gcp',
    resourceType: 'service',
    patterns: [/@google-cloud\/functions/i, /\bcloud functions?\b/i],
  },
  {
    name: 'Pub/Sub',
    type: 'messaging',
    provider: 'gcp',
    resourceType: 'queue',
    patterns: [/@google-cloud\/pubsub/i, /\bpubsub\b/i, /\bpub\/sub\b/i],
  },
  {
    name: 'BigQuery',
    type: 'database',
    provider: 'gcp',
    resourceType: 'database',
    patterns: [/@google-cloud\/bigquery/i, /\bbigquery\b/i],
  },
  {
    name: 'Kubernetes',
    type: 'compute',
    provider: 'cncf',
    resourceType: 'service',
    patterns: [/\bapiVersion:\s*apps\//i, /\bkind:\s*Deployment\b/i, /\bkubernetes\b/i, /\bkubectl\b/i],
  },
  {
    name: 'Docker Compose',
    type: 'compute',
    provider: 'docker',
    resourceType: 'service',
    patterns: [/\bservices:\b/i, /\bimage:\b/i, /\bdocker-compose\b/i],
  },
  {
    name: 'Stripe',
    type: 'api',
    provider: 'third-party',
    resourceType: 'service',
    suggestedColor: 'pink',
    patterns: [/\bstripe\b/i],
  },
];

const INFRA_FILE_SUFFIXES = ['.tf', '.tfvars', '.tfstate', 'compose.yaml', 'compose.yml', 'chart.yaml'] as const;
const INFRA_PATH_SNIPPETS = ['docker-compose'] as const;
const STRUCTURED_INFRA_CONTENT = /\bapiVersion:\b|\bkind:\b|\bterraform_version\b|\bresources\b/;
const PROVIDER_ICON_PACK_IDS = {
  aws: 'aws-official-starter-v1',
  azure: 'azure-official-icons-v20',
  cncf: 'cncf-artwork-icons-v1',
} as const satisfies Partial<Record<DetectedServiceProvider, string>>;
const SERVICE_ICON_HINTS: Partial<
  Record<
    DetectedServiceProvider,
    Partial<Record<string, { packId: string; shapeId: string }>>
  >
> = {
  aws: {
    'API Gateway': { packId: 'aws-official-starter-v1', shapeId: 'app-integration-api-gateway' },
    CloudFront: {
      packId: 'aws-official-starter-v1',
      shapeId: 'networking-content-delivery-cloudfront',
    },
    Cognito: {
      packId: 'aws-official-starter-v1',
      shapeId: 'security-identity-compliance-cognito',
    },
    DynamoDB: { packId: 'aws-official-starter-v1', shapeId: 'database-dynamodb' },
    ElastiCache: { packId: 'aws-official-starter-v1', shapeId: 'database-elasticache' },
    ECS: {
      packId: 'aws-official-starter-v1',
      shapeId: 'containers-elastic-container-service',
    },
    EKS: {
      packId: 'aws-official-starter-v1',
      shapeId: 'containers-elastic-kubernetes-service',
    },
    EventBridge: {
      packId: 'aws-official-starter-v1',
      shapeId: 'app-integration-eventbridge',
    },
    Lambda: { packId: 'aws-official-starter-v1', shapeId: 'compute-lambda' },
    RDS: { packId: 'aws-official-starter-v1', shapeId: 'database-rds' },
    S3: { packId: 'aws-official-starter-v1', shapeId: 'storage-simple-storage-service' },
    SNS: {
      packId: 'aws-official-starter-v1',
      shapeId: 'app-integration-simple-notification-service',
    },
    SQS: {
      packId: 'aws-official-starter-v1',
      shapeId: 'app-integration-simple-queue-service',
    },
  },
  azure: {
    'Azure Functions': { packId: 'azure-official-icons-v20', shapeId: 'compute-function-apps' },
    AKS: { packId: 'azure-official-icons-v20', shapeId: 'compute-kubernetes-services' },
    'Azure API Management': {
      packId: 'azure-official-icons-v20',
      shapeId: 'web-api-management-services',
    },
    'Azure Front Door': {
      packId: 'azure-official-icons-v20',
      shapeId: 'web-front-door-and-cdn-profiles',
    },
    'Azure Service Bus': {
      packId: 'azure-official-icons-v20',
      shapeId: 'integration-azure-service-bus',
    },
    'Azure SQL': { packId: 'azure-official-icons-v20', shapeId: 'databases-azure-sql' },
    'Azure Storage': {
      packId: 'azure-official-icons-v20',
      shapeId: 'storage-storage-accounts',
    },
  },
  cncf: {
    Kubernetes: { packId: 'cncf-artwork-icons-v1', shapeId: 'projects-clusternet' },
  },
};

function getSuggestedColor(type: DetectedServiceType, provider: DetectedServiceProvider): SuggestedNodeColor {
  if (provider === 'third-party') {
    return 'pink';
  }

  switch (type) {
    case 'database':
    case 'storage':
      return 'emerald';
    case 'cache':
      return 'yellow';
    case 'queue':
    case 'messaging':
      return 'amber';
    case 'identity':
      return 'amber';
    case 'network':
      return 'blue';
    case 'api':
    case 'compute':
    case 'service':
      return 'violet';
    case 'observability':
      return 'slate';
    default:
      return 'slate';
  }
}

function getServiceIconHint(
  name: string,
  provider: DetectedServiceProvider
): { iconPackId?: string; iconShapeId?: string } {
  const exactMatch = SERVICE_ICON_HINTS[provider]?.[name];
  if (exactMatch) {
    return {
      iconPackId: exactMatch.packId,
      iconShapeId: exactMatch.shapeId,
    };
  }

  const packId = PROVIDER_ICON_PACK_IDS[provider];
  if (!packId) {
    return {};
  }

  return { iconPackId: packId };
}

function matchesRule(file: { path: string; content: string }, patterns: RegExp[]): boolean {
  const normalizedPath = file.path.toLowerCase();
  return patterns.some((pattern) => pattern.test(file.content) || pattern.test(normalizedPath));
}

function matchesInfraFilePath(normalizedPath: string): boolean {
  return (
    INFRA_FILE_SUFFIXES.some((suffix) => normalizedPath.endsWith(suffix)) ||
    INFRA_PATH_SNIPPETS.some((snippet) => normalizedPath.includes(snippet))
  );
}

function detectCloudPlatform(files: Array<{ path: string; content: string }>): CloudPlatform {
  const joinedContent = files.map((file) => file.content).join('\n');
  const paths = files.map((file) => file.path.toLowerCase());
  const hits = new Set<Exclude<CloudPlatform, 'mixed' | 'unknown'>>();

  if (/@aws-sdk\/|aws-sdk|boto3|botocore|provider\s+"aws"/i.test(joinedContent)) {
    hits.add('aws');
  }
  if (/@google-cloud|google\.cloud|firebase|provider\s+"google"/i.test(joinedContent)) {
    hits.add('gcp');
  }
  if (/@azure\/|azure-identity|azurerm/i.test(joinedContent)) {
    hits.add('azure');
  }
  if (
    /\bkubernetes\b|\bkubectl\b|\bkind:\s*(Deployment|Service|Ingress|ConfigMap|StatefulSet)\b/i.test(
      joinedContent
    ) ||
    paths.some((path) => path.endsWith('chart.yaml') || path.includes('/charts/'))
  ) {
    hits.add('cncf');
  }
  if (paths.some((path) => path.includes('docker-compose') || path.endsWith('compose.yaml'))) {
    hits.add('docker');
  }

  if (hits.size === 0) {
    return 'unknown';
  }
  if (hits.size === 1) {
    return [...hits][0];
  }
  return 'mixed';
}

function detectInfraFiles(files: Array<{ path: string; content: string }>): string[] {
  return files
    .filter((file) => {
      const normalizedPath = file.path.toLowerCase();
      if (matchesInfraFilePath(normalizedPath)) {
        return true;
      }

      if (
        normalizedPath.endsWith('.yaml') ||
        normalizedPath.endsWith('.yml') ||
        normalizedPath.endsWith('.json')
      ) {
        return STRUCTURED_INFRA_CONTENT.test(file.content);
      }

      return false;
    })
    .map((file) => file.path)
    .sort((left, right) => left.localeCompare(right));
}

function detectServices(files: Array<{ path: string; content: string }>): DetectedService[] {
  const serviceMap = new Map<string, DetectedService>();

  for (const rule of SERVICE_DETECTION_RULES) {
    const evidence = new Set<string>();

    for (const file of files) {
      if (matchesRule(file, rule.patterns)) {
        evidence.add(file.path);
      }
    }

    if (evidence.size === 0) {
      continue;
    }

    serviceMap.set(rule.name, {
      name: rule.name,
      type: rule.type,
      provider: rule.provider,
      resourceType: rule.resourceType ?? 'service',
      suggestedColor: rule.suggestedColor ?? getSuggestedColor(rule.type, rule.provider),
      ...getServiceIconHint(rule.name, rule.provider),
      evidence: [...evidence].sort((left, right) => left.localeCompare(right)).slice(0, 3),
    });
  }

  return [...serviceMap.values()].sort((left, right) => left.name.localeCompare(right.name));
}
