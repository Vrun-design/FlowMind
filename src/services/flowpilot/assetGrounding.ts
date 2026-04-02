import type { DomainLibraryCategory, DomainLibraryItem } from '@/services/domainLibrary';
import { loadDomainAssetSuggestions } from '@/services/assetCatalog';
import type { AssetGroundingMatch } from './types';

const ALL_GROUNDING_CATEGORIES: DomainLibraryCategory[] = [
  'aws',
  'azure',
  'gcp',
  'cncf',
  'developer',
  'icons',
];

const SERVICE_ALIASES: Array<{ query: string; categories?: DomainLibraryCategory[] }> = [
  // AWS Services
  { query: 'API Gateway', categories: ['aws'] },
  { query: 'Lambda', categories: ['aws'] },
  { query: 'S3', categories: ['aws'] },
  { query: 'RDS', categories: ['aws'] },
  { query: 'ElastiCache', categories: ['aws'] },
  { query: 'Cognito', categories: ['aws'] },
  { query: 'DynamoDB', categories: ['aws'] },
  { query: 'Aurora', categories: ['aws'] },
  { query: 'EC2', categories: ['aws'] },
  { query: 'ECS', categories: ['aws'] },
  { query: 'EKS', categories: ['aws'] },
  { query: 'SQS', categories: ['aws'] },
  { query: 'SNS', categories: ['aws'] },
  { query: 'CloudFront', categories: ['aws'] },
  { query: 'ALB', categories: ['aws'] },
  { query: 'EventBridge', categories: ['aws'] },
  { query: 'Step Functions', categories: ['aws'] },
  { query: 'CloudWatch', categories: ['aws'] },
  { query: 'Secrets Manager', categories: ['aws'] },
  { query: 'Kinesis', categories: ['aws'] },
  { query: 'Redshift', categories: ['aws'] },
  { query: 'Glue', categories: ['aws'] },
  { query: 'SageMaker', categories: ['aws'] },

  // Azure Services
  { query: 'Azure Functions', categories: ['azure'] },
  { query: 'Azure SQL', categories: ['azure'] },
  { query: 'Storage Account', categories: ['azure'] },
  { query: 'API Management', categories: ['azure'] },
  { query: 'Service Bus', categories: ['azure'] },
  { query: 'Event Hubs', categories: ['azure'] },
  { query: 'Cosmos DB', categories: ['azure'] },
  { query: 'Front Door', categories: ['azure'] },
  { query: 'Key Vault', categories: ['azure'] },
  { query: 'Azure Monitor', categories: ['azure'] },
  { query: 'Azure Kubernetes', categories: ['azure'] },
  { query: 'App Service', categories: ['azure'] },
  { query: 'Azure Cache', categories: ['azure'] },

  // GCP Services
  { query: 'Cloud Run', categories: ['gcp'] },
  { query: 'Cloud SQL', categories: ['gcp'] },
  { query: 'Cloud Storage', categories: ['gcp'] },
  { query: 'Cloud Functions', categories: ['gcp'] },
  { query: 'BigQuery', categories: ['gcp'] },
  { query: 'Pub/Sub', categories: ['gcp'] },
  { query: 'Cloud CDN', categories: ['gcp'] },
  { query: 'Firestore', categories: ['gcp'] },
  { query: 'Cloud Build', categories: ['gcp'] },
  { query: 'Vertex AI', categories: ['gcp'] },
  { query: 'Memorystore', categories: ['gcp'] },
  { query: 'GKE', categories: ['gcp'] },
  { query: 'Cloud Armor', categories: ['gcp'] },

  // CNCF / Kubernetes
  { query: 'Kubernetes', categories: ['cncf'] },
  { query: 'Ingress', categories: ['cncf'] },
  { query: 'Envoy', categories: ['cncf'] },
  { query: 'Istio', categories: ['cncf'] },
  { query: 'Helm', categories: ['cncf'] },
  { query: 'Prometheus', categories: ['cncf'] },
  { query: 'Containerd', categories: ['cncf'] },
  { query: 'Fluentd', categories: ['cncf'] },
  { query: 'CoreDNS', categories: ['cncf'] },
  { query: 'etcd', categories: ['cncf'] },
  { query: 'Argo', categories: ['cncf'] },
  { query: 'Linkerd', categories: ['cncf'] },

  // Databases (developer catalog)
  { query: 'PostgreSQL', categories: ['developer'] },
  { query: 'Postgres', categories: ['developer'] },
  { query: 'MySQL', categories: ['developer'] },
  { query: 'MongoDB', categories: ['developer'] },
  { query: 'Redis', categories: ['developer'] },
  { query: 'Elasticsearch', categories: ['developer'] },
  { query: 'SQLite', categories: ['developer'] },
  { query: 'MariaDB', categories: ['developer'] },
  { query: 'Cassandra', categories: ['developer'] },
  { query: 'Neo4j', categories: ['developer'] },
  { query: 'Supabase', categories: ['developer'] },
  { query: 'PlanetScale', categories: ['developer'] },

  // Frameworks & Runtimes
  { query: 'Express', categories: ['developer'] },
  { query: 'Node.js', categories: ['developer'] },
  { query: 'React', categories: ['developer'] },
  { query: 'Vue', categories: ['developer'] },
  { query: 'Angular', categories: ['developer'] },
  { query: 'Svelte', categories: ['developer'] },
  { query: 'Next.js', categories: ['developer'] },
  { query: 'Nuxt', categories: ['developer'] },
  { query: 'Django', categories: ['developer'] },
  { query: 'Flask', categories: ['developer'] },
  { query: 'FastAPI', categories: ['developer'] },
  { query: 'Spring', categories: ['developer'] },
  { query: 'Rails', categories: ['developer'] },
  { query: 'Laravel', categories: ['developer'] },
  { query: 'NestJS', categories: ['developer'] },
  { query: 'Deno', categories: ['developer'] },
  { query: 'Bun', categories: ['developer'] },
  { query: 'Go', categories: ['developer'] },
  { query: 'Rust', categories: ['developer'] },
  { query: 'Python', categories: ['developer'] },
  { query: 'TypeScript', categories: ['developer'] },

  // Infrastructure & DevOps
  { query: 'Docker', categories: ['developer'] },
  { query: 'Nginx', categories: ['developer'] },
  { query: 'RabbitMQ', categories: ['developer'] },
  { query: 'Kafka', categories: ['developer'] },
  { query: 'Terraform', categories: ['developer'] },
  { query: 'Ansible', categories: ['developer'] },
  { query: 'Jenkins', categories: ['developer'] },
  { query: 'GitHub', categories: ['developer'] },
  { query: 'GitLab', categories: ['developer'] },
  { query: 'Grafana', categories: ['developer'] },
  { query: 'Consul', categories: ['developer'] },
  { query: 'Vault', categories: ['developer'] },
  { query: 'Pulsar', categories: ['developer'] },
  { query: 'NATS', categories: ['developer'] },

  // Auth & Payments
  { query: 'Auth0', categories: ['developer'] },
  { query: 'Keycloak', categories: ['developer'] },
  { query: 'Firebase', categories: ['developer'] },
  { query: 'Stripe', categories: ['developer'] },
  { query: 'Twilio', categories: ['developer'] },
  { query: 'SendGrid', categories: ['developer'] },
  { query: 'Cloudflare', categories: ['developer'] },
  { query: 'Vercel', categories: ['developer'] },
  { query: 'Netlify', categories: ['developer'] },

  // Generic terms (search all categories)
  { query: 'Queue' },
  { query: 'Database' },
  { query: 'Cache' },
  { query: 'Load Balancer' },
  { query: 'CDN' },
  { query: 'Storage' },
  { query: 'Auth' },
  { query: 'API' },
  { query: 'Gateway' },
  { query: 'Monitoring' },
  { query: 'Logging' },
  { query: 'Search' },
  { query: 'Analytics' },
  { query: 'ML' },
  { query: 'AI' },
];

function scoreMatch(item: DomainLibraryItem, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const label = item.label.toLowerCase();
  const description = item.description.toLowerCase();
  const category = (item.providerShapeCategory || '').toLowerCase();

  if (label === normalizedQuery) {
    return 0.99;
  }

  if (label.includes(normalizedQuery)) {
    return 0.93;
  }

  if (description.includes(normalizedQuery) || category.includes(normalizedQuery)) {
    return 0.82;
  }

  return 0.65;
}

function toGroundingMatch(item: DomainLibraryItem, query: string): AssetGroundingMatch {
  return {
    id: item.id,
    label: item.label,
    description: item.description,
    category: item.category,
    archProvider: item.category,
    archResourceType: item.archResourceType || 'service',
    archIconPackId: item.archIconPackId,
    archIconShapeId: item.archIconShapeId,
    providerShapeCategory: item.providerShapeCategory,
    confidence: scoreMatch(item, query),
    reasoning: item.archIconPackId
      ? `Matched "${query}" to a provider-backed asset in the local ${item.category.toUpperCase()} catalog.`
      : `Matched "${query}" to a reusable local asset.`,
  };
}

function inferQueriesFromPrompt(
  prompt: string
): Array<{ query: string; categories?: DomainLibraryCategory[] }> {
  const matches = SERVICE_ALIASES.filter((entry) =>
    prompt.toLowerCase().includes(entry.query.toLowerCase())
  );
  if (matches.length > 0) {
    return matches;
  }

  const compactPrompt = prompt.replace(/[^\w\s/-]+/g, ' ');
  const segments = compactPrompt
    .split(/,| with | and | then /i)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 3)
    .slice(0, 6);

  return segments.map((segment) => ({ query: segment }));
}

export async function groundFlowpilotAssets(prompt: string): Promise<AssetGroundingMatch[]> {
  const queries = inferQueriesFromPrompt(prompt);
  const results = new Map<string, AssetGroundingMatch>();

  for (const { query, categories } of queries) {
    const scopes = categories ?? ALL_GROUNDING_CATEGORIES;
    for (const category of scopes) {
      const suggestions = await loadDomainAssetSuggestions(category, {
        query,
        limit: 4,
      });

      for (const item of suggestions) {
        const candidate = toGroundingMatch(item, query);
        const existing = results.get(candidate.id);
        if (!existing || existing.confidence < candidate.confidence) {
          results.set(candidate.id, candidate);
        }
      }
    }
  }

  return [...results.values()]
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 8);
}

export function summarizeAssetGrounding(matches: AssetGroundingMatch[]): string {
  if (matches.length === 0) {
    return 'No strong local asset matches were found.';
  }

  return matches
    .slice(0, 5)
    .map((match) => {
      const suffix = match.archIconPackId ? ` (${match.archIconPackId})` : '';
      return `${match.label}${suffix}`;
    })
    .join(', ');
}
