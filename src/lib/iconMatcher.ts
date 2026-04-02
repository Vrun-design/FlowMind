import { SVG_SOURCES } from '@/services/shapeLibrary/providerCatalog';

export interface IconMatch {
  packId: string;
  shapeId: string;
  label: string;
  provider: string;
  category: string;
  score: number;
  matchType: 'exact' | 'alias' | 'substring' | 'category';
}

const ALIASES: Record<string, string> = {
  postgres: 'postgresql',
  pg: 'postgresql',
  pgsql: 'postgresql',
  mongo: 'mongodb',
  mdb: 'mongodb',
  es: 'elasticsearch',
  elastic: 'elasticsearch',
  k8s: 'kubernetes',
  tf: 'terraform',
  hcl: 'terraform',
  golang: 'go',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  njs: 'nodejs',
  node: 'nodejs',
  'react.js': 'react',
  'vue.js': 'vue',
  next: 'nextjs',
  'nuxt.js': 'nuxt',
  mq: 'rabbitmq',
  apachekafka: 'kafka',
  csharp: 'c#',
  dotnet: '.net',
  gke: 'google-kubernetes-engine',
  aks: 'azure-kubernetes-service',
  eks: 'amazon-elastic-kubernetes-service',
  rds: 'amazon-rds',
  sqs: 'amazon-sqs',
  sns: 'amazon-sns',
  s3: 'amazon-s3',
  cf: 'cloudflare',
  kib: 'kibana',
  logstash: 'elastic-logstash',
  beat: 'elastic-beats',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s._]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function entries(): IconEntry[] {
  return SVG_SOURCES.map((s) => {
    const parts = s.shapeId.split('/');
    const lastPathPart = parts[parts.length - 1];
    const lastHyphenPart = lastPathPart.split('-').pop() ?? lastPathPart;
    return {
      packId: s.packId,
      shapeId: s.shapeId,
      label: s.label,
      provider: s.provider,
      category: s.category,
      normalizedName: normalize(s.shapeId),
      normalizedLastSegment: normalize(lastHyphenPart),
    };
  });
}

interface IconEntry {
  packId: string;
  shapeId: string;
  label: string;
  provider: string;
  category: string;
  normalizedName: string;
  normalizedLastSegment: string;
}

let cachedEntries: IconEntry[] | null = null;
function getEntries(): IconEntry[] {
  if (!cachedEntries) cachedEntries = entries();
  return cachedEntries;
}

let cachedByNormalized: Map<string, IconEntry> | null = null;
function getByNormalized(): Map<string, IconEntry> {
  if (!cachedByNormalized) {
    cachedByNormalized = new Map();
    for (const entry of getEntries()) {
      cachedByNormalized.set(entry.normalizedName, entry);
      if (entry.normalizedLastSegment !== entry.normalizedName) {
        cachedByNormalized.set(entry.normalizedLastSegment, entry);
      }
    }
  }
  return cachedByNormalized;
}

export function matchIcon(query: string, providerHint?: string): IconMatch[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const byNormalized = getByNormalized();
  const all = getEntries();

  // 1. Exact match on shape ID
  const exact = byNormalized.get(normalizedQuery);
  if (exact && (!providerHint || exact.provider === providerHint)) {
    return [toMatch(exact, 0.99, 'exact')];
  }

  // 2. Alias resolution
  const aliasTarget = ALIASES[normalizedQuery];
  if (aliasTarget) {
    const aliasEntry = byNormalized.get(normalize(aliasTarget));
    if (aliasEntry && (!providerHint || aliasEntry.provider === providerHint)) {
      return [toMatch(aliasEntry, 0.95, 'alias')];
    }
  }

  // 3. Substring match (query contained in name, or name contained in query)
  const substringMatches: IconMatch[] = [];
  for (const entry of all) {
    if (providerHint && entry.provider !== providerHint) continue;
    if (entry.normalizedLastSegment.length < 3 || normalizedQuery.length < 3) continue;
    if (
      entry.normalizedName.includes(normalizedQuery) ||
      entry.normalizedLastSegment.includes(normalizedQuery) ||
      normalizedQuery.includes(entry.normalizedLastSegment)
    ) {
      substringMatches.push(toMatch(entry, 0.85, 'substring'));
    }
  }
  if (substringMatches.length > 0) {
    substringMatches.sort((a, b) => b.score - a.score);
    return substringMatches.slice(0, 5);
  }

  // 4. Category match
  const normalizedCategory = normalizedQuery.replace(/-/g, '');
  const categoryMatches: IconMatch[] = [];
  for (const entry of all) {
    if (providerHint && entry.provider !== providerHint) continue;
    if (normalize(entry.category).replace(/-/g, '').includes(normalizedCategory)) {
      categoryMatches.push(toMatch(entry, 0.7, 'category'));
    }
  }
  if (categoryMatches.length > 0) {
    categoryMatches.sort((a, b) => b.score - a.score);
    return categoryMatches.slice(0, 5);
  }

  return [];
}

function toMatch(entry: IconEntry, score: number, matchType: IconMatch['matchType']): IconMatch {
  return {
    packId: entry.packId,
    shapeId: entry.shapeId,
    label: entry.label,
    provider: entry.provider,
    category: entry.category,
    score,
    matchType,
  };
}

export function getMatchableIconCount(): number {
  return getEntries().length;
}

export function listIconProviders(): string[] {
  return [...new Set(getEntries().map((e) => e.provider))].sort();
}

export function buildCatalogSummary(maxPerProvider: number = 30): string {
  const byProvider = new Map<string, IconEntry[]>();
  for (const entry of getEntries()) {
    const list = byProvider.get(entry.provider) ?? [];
    list.push(entry);
    byProvider.set(entry.provider, list);
  }

  const lines: string[] = [];
  for (const [provider, icons] of byProvider) {
    const categories = [...new Set(icons.map((i) => i.category))];
    const sampleNames = icons.slice(0, maxPerProvider).map((i) => i.label);
    lines.push(`${provider}: ${categories.join(', ')} (examples: ${sampleNames.join(', ')})`);
  }

  return lines.join('\n');
}
