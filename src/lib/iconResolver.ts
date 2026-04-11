import type { DomainLibraryCategory } from '@/services/domainLibrary';

export interface IconResolution {
  found: boolean;
  archIconPackId?: string;
  archIconShapeId?: string;
  iconSearch?: string;
  catalog?: DomainLibraryCategory;
  lucideIcon?: string;
  label?: string;
  category?: string;
  confidence: number;
}

interface AliasEntry {
  patterns: RegExp[];
  iconSearch: string;
  catalog: DomainLibraryCategory;
  lucideFallback: string;
}

const ALIAS_TABLE: AliasEntry[] = [
  // Databases
  {
    patterns: [/^postgres(?:ql)?$/i, /^pg$/i],
    iconSearch: 'postgresql',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  { patterns: [/^mysql$/i], iconSearch: 'mysql', catalog: 'developer', lucideFallback: 'database' },
  {
    patterns: [/^mongo(?:db)?$/i],
    iconSearch: 'mongodb',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  {
    patterns: [/^redis$/i],
    iconSearch: 'redis',
    catalog: 'developer',
    lucideFallback: 'hard-drive',
  },
  {
    patterns: [/^elastic(?:search)?$/i],
    iconSearch: 'elasticsearch',
    catalog: 'developer',
    lucideFallback: 'search',
  },
  { patterns: [/^dynamodb$/i], iconSearch: 'dynamodb', catalog: 'aws', lucideFallback: 'database' },
  { patterns: [/^aurora$/i], iconSearch: 'aurora', catalog: 'aws', lucideFallback: 'database' },
  {
    patterns: [/^sqlite$/i],
    iconSearch: 'sqlite',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  {
    patterns: [/^mariadb$/i],
    iconSearch: 'mariadb',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  {
    patterns: [/^cassandra$/i],
    iconSearch: 'cassandra',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  { patterns: [/^neo4j$/i], iconSearch: 'neo4j', catalog: 'developer', lucideFallback: 'database' },
  {
    patterns: [/^supabase$/i],
    iconSearch: 'supabase',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  {
    patterns: [/^planetscale$/i],
    iconSearch: 'planetscale',
    catalog: 'developer',
    lucideFallback: 'database',
  },
  { patterns: [/^neon\b/i], iconSearch: 'neon', catalog: 'developer', lucideFallback: 'database' },

  // Frameworks
  {
    patterns: [/^express(?:\.?js)?$/i],
    iconSearch: 'express',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^node(?:\.?js)?$/i],
    iconSearch: 'nodejs',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^react(?:\.?js)?$/i],
    iconSearch: 'react',
    catalog: 'developer',
    lucideFallback: 'monitor',
  },
  {
    patterns: [/^vue(?:\.?js)?$/i],
    iconSearch: 'vue',
    catalog: 'developer',
    lucideFallback: 'monitor',
  },
  {
    patterns: [/^angular$/i],
    iconSearch: 'angular',
    catalog: 'developer',
    lucideFallback: 'monitor',
  },
  {
    patterns: [/^svelte$/i],
    iconSearch: 'svelte',
    catalog: 'developer',
    lucideFallback: 'monitor',
  },
  {
    patterns: [/^next(?:\.?js)?$/i],
    iconSearch: 'nextjs',
    catalog: 'developer',
    lucideFallback: 'monitor',
  },
  { patterns: [/^nuxt$/i], iconSearch: 'nuxt', catalog: 'developer', lucideFallback: 'monitor' },
  { patterns: [/^django$/i], iconSearch: 'django', catalog: 'developer', lucideFallback: 'server' },
  { patterns: [/^flask$/i], iconSearch: 'flask', catalog: 'developer', lucideFallback: 'server' },
  {
    patterns: [/^fastapi$/i],
    iconSearch: 'fastapi',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^spring(?:\s*boot)?$/i],
    iconSearch: 'spring',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^rails$/i, /^ruby$/i],
    iconSearch: 'rails',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^laravel$/i],
    iconSearch: 'laravel',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  {
    patterns: [/^nest(?:\.?js)?$/i],
    iconSearch: 'nestjs',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  { patterns: [/^gin$/i], iconSearch: 'gin', catalog: 'developer', lucideFallback: 'server' },
  {
    patterns: [/^go$/i, /^golang$/i],
    iconSearch: 'go',
    catalog: 'developer',
    lucideFallback: 'server',
  },
  { patterns: [/^rust$/i], iconSearch: 'rust', catalog: 'developer', lucideFallback: 'server' },
  { patterns: [/^deno$/i], iconSearch: 'deno', catalog: 'developer', lucideFallback: 'server' },
  { patterns: [/^bun$/i], iconSearch: 'bun', catalog: 'developer', lucideFallback: 'server' },

  // Infrastructure
  {
    patterns: [/^docker$/i],
    iconSearch: 'docker',
    catalog: 'developer',
    lucideFallback: 'container',
  },
  {
    patterns: [/^kubernetes$/i, /^k8s$/i],
    iconSearch: 'kubernetes',
    catalog: 'cncf',
    lucideFallback: 'container',
  },
  { patterns: [/^nginx$/i], iconSearch: 'nginx', catalog: 'developer', lucideFallback: 'shield' },
  {
    patterns: [/^rabbitmq$/i],
    iconSearch: 'rabbitmq',
    catalog: 'developer',
    lucideFallback: 'layers',
  },
  {
    patterns: [/^kafka$/i, /^apache\s*kafka$/i],
    iconSearch: 'apachekafka',
    catalog: 'developer',
    lucideFallback: 'layers',
  },
  {
    patterns: [/^consul$/i],
    iconSearch: 'consul',
    catalog: 'developer',
    lucideFallback: 'map-pin',
  },
  { patterns: [/^vault$/i], iconSearch: 'vault', catalog: 'developer', lucideFallback: 'lock' },
  {
    patterns: [/^terraform$/i],
    iconSearch: 'terraform',
    catalog: 'developer',
    lucideFallback: 'layers',
  },
  {
    patterns: [/^ansible$/i],
    iconSearch: 'ansible',
    catalog: 'developer',
    lucideFallback: 'settings',
  },
  {
    patterns: [/^prometheus$/i],
    iconSearch: 'prometheus',
    catalog: 'developer',
    lucideFallback: 'activity',
  },
  {
    patterns: [/^grafana$/i],
    iconSearch: 'grafana',
    catalog: 'developer',
    lucideFallback: 'bar-chart',
  },
  {
    patterns: [/^jenkins$/i],
    iconSearch: 'jenkins',
    catalog: 'developer',
    lucideFallback: 'settings',
  },
  {
    patterns: [/^gitlab$/i],
    iconSearch: 'gitlab',
    catalog: 'developer',
    lucideFallback: 'git-branch',
  },
  {
    patterns: [/^github$/i],
    iconSearch: 'github',
    catalog: 'developer',
    lucideFallback: 'git-branch',
  },
  { patterns: [/^helm$/i], iconSearch: 'helm', catalog: 'cncf', lucideFallback: 'package' },
  { patterns: [/^istio$/i], iconSearch: 'istio', catalog: 'cncf', lucideFallback: 'network' },
  { patterns: [/^envoy$/i], iconSearch: 'envoy', catalog: 'cncf', lucideFallback: 'network' },
  {
    patterns: [/^grafana\s*tempo$/i, /^tempo$/i],
    iconSearch: 'grafana-tempo',
    catalog: 'developer',
    lucideFallback: 'activity',
  },

  // Cloud services
  { patterns: [/^s3$/i], iconSearch: 's3', catalog: 'aws', lucideFallback: 'folder' },
  { patterns: [/^lambda$/i], iconSearch: 'lambda', catalog: 'aws', lucideFallback: 'zap' },
  { patterns: [/^ec2$/i], iconSearch: 'ec2', catalog: 'aws', lucideFallback: 'server' },
  { patterns: [/^ecs$/i], iconSearch: 'ecs', catalog: 'aws', lucideFallback: 'container' },
  { patterns: [/^eks$/i], iconSearch: 'eks', catalog: 'aws', lucideFallback: 'container' },
  { patterns: [/^rds$/i], iconSearch: 'rds', catalog: 'aws', lucideFallback: 'database' },
  {
    patterns: [/^api\s*gateway$/i],
    iconSearch: 'api-gateway',
    catalog: 'aws',
    lucideFallback: 'shield',
  },
  {
    patterns: [/^cloudfront$/i],
    iconSearch: 'cloudfront',
    catalog: 'aws',
    lucideFallback: 'globe',
  },
  { patterns: [/^sqs$/i], iconSearch: 'sqs', catalog: 'aws', lucideFallback: 'layers' },
  { patterns: [/^sns$/i], iconSearch: 'sns', catalog: 'aws', lucideFallback: 'bell' },
  { patterns: [/^cognito$/i], iconSearch: 'cognito', catalog: 'aws', lucideFallback: 'key' },
  {
    patterns: [/^cloud\s*run$/i],
    iconSearch: 'cloud-run',
    catalog: 'gcp',
    lucideFallback: 'container',
  },
  {
    patterns: [/^cloud\s*functions$/i],
    iconSearch: 'cloud-functions',
    catalog: 'gcp',
    lucideFallback: 'zap',
  },
  { patterns: [/^bigquery$/i], iconSearch: 'bigquery', catalog: 'gcp', lucideFallback: 'database' },
  {
    patterns: [/^azure\s*functions$/i],
    iconSearch: 'azure-functions',
    catalog: 'azure',
    lucideFallback: 'zap',
  },
  {
    patterns: [/^azure\s*sql$/i],
    iconSearch: 'azure-sql',
    catalog: 'azure',
    lucideFallback: 'database',
  },

  // Messaging / Streaming
  { patterns: [/^pulsar$/i], iconSearch: 'pulsar', catalog: 'developer', lucideFallback: 'layers' },
  { patterns: [/^nats$/i], iconSearch: 'nats', catalog: 'developer', lucideFallback: 'layers' },
  {
    patterns: [/^zeromq$/i, /^0mq$/i],
    iconSearch: 'zeromq',
    catalog: 'developer',
    lucideFallback: 'layers',
  },

  // Auth
  { patterns: [/^auth0$/i], iconSearch: 'auth0', catalog: 'developer', lucideFallback: 'key' },
  {
    patterns: [/^keycloak$/i],
    iconSearch: 'keycloak',
    catalog: 'developer',
    lucideFallback: 'key',
  },
  {
    patterns: [/^firebase$/i],
    iconSearch: 'firebase',
    catalog: 'developer',
    lucideFallback: 'flame',
  },
  {
    patterns: [/^supertokens$/i, /^super\s*tokens$/i],
    iconSearch: 'supertokens',
    catalog: 'developer',
    lucideFallback: 'key',
  },

  // Payments / SaaS
  {
    patterns: [/^stripe$/i],
    iconSearch: 'stripe',
    catalog: 'developer',
    lucideFallback: 'credit-card',
  },
  { patterns: [/^twilio$/i], iconSearch: 'twilio', catalog: 'developer', lucideFallback: 'phone' },
  {
    patterns: [/^sendgrid$/i],
    iconSearch: 'sendgrid',
    catalog: 'developer',
    lucideFallback: 'mail',
  },
  {
    patterns: [/^mailchimp$/i],
    iconSearch: 'mailchimp',
    catalog: 'developer',
    lucideFallback: 'mail',
  },
  {
    patterns: [/^cloudflare$/i],
    iconSearch: 'cloudflare',
    catalog: 'developer',
    lucideFallback: 'cloud',
  },
  {
    patterns: [/^vercel$/i],
    iconSearch: 'vercel',
    catalog: 'developer',
    lucideFallback: 'triangle',
  },
  {
    patterns: [/^netlify$/i],
    iconSearch: 'netlify',
    catalog: 'developer',
    lucideFallback: 'globe',
  },
];

const LUCIDE_FALLBACK_MAP: Record<string, string> = {
  database: 'database',
  cache: 'hard-drive',
  queue: 'layers',
  service: 'server',
  frontend: 'monitor',
  gateway: 'shield',
  auth: 'key-round',
  storage: 'folder',
  user: 'user',
  start: 'play',
  end: 'check-circle',
  decision: 'help-circle',
  action: 'zap',
  process: 'box',
};

export function resolveIconSync(query: string, categoryHint?: string): IconResolution {
  const trimmed = query.trim();
  if (!trimmed) {
    return { found: false, confidence: 0 };
  }

  for (const entry of ALIAS_TABLE) {
    if (entry.patterns.some((p) => p.test(trimmed))) {
      return {
        found: true,
        iconSearch: entry.iconSearch,
        catalog: entry.catalog,
        lucideIcon: entry.lucideFallback,
        label: trimmed,
        confidence: 0.95,
      };
    }
  }

  if (categoryHint && LUCIDE_FALLBACK_MAP[categoryHint]) {
    return {
      found: true,
      lucideIcon: LUCIDE_FALLBACK_MAP[categoryHint],
      label: trimmed,
      confidence: 0.5,
    };
  }

  return { found: false, confidence: 0 };
}

export function resolveLucideFallback(category: string): string {
  return LUCIDE_FALLBACK_MAP[category] ?? 'box';
}
