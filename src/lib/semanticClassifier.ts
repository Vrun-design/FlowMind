import type { NodeColorKey } from '@/theme';

export type SemanticCategory =
  | 'start'
  | 'end'
  | 'decision'
  | 'database'
  | 'cache'
  | 'queue'
  | 'service'
  | 'frontend'
  | 'user'
  | 'action'
  | 'gateway'
  | 'auth'
  | 'storage'
  | 'process';

export interface SemanticHint {
  category: SemanticCategory;
  color: NodeColorKey;
  iconQuery: string;
  lucideFallback: string;
}

interface ClassifierRule {
  patterns: RegExp[];
  category: SemanticCategory;
  color: NodeColorKey;
  lucideFallback: string;
  extractQuery?: (text: string, id: string) => string;
}

const RULES: ClassifierRule[] = [
  {
    patterns: [/\bstart\b/i, /\bbegin\b/i, /\binit\b/i, /\bentry\b/i, /\blaunch\b/i],
    category: 'start',
    color: 'emerald',
    lucideFallback: 'play',
  },
  {
    patterns: [/\bend\b/i, /\bfinish\b/i, /\bdone\b/i, /\bcomplete\b/i, /\bstop\b/i, /\bexit\b/i],
    category: 'end',
    color: 'red',
    lucideFallback: 'check-circle',
  },
  {
    patterns: [
      /\bdb\b/i,
      /\bdatabase\b/i,
      /\bsql\b/i,
      /\bpostgres/i,
      /\bmysql\b/i,
      /\bmongo/i,
      /\bdynamodb\b/i,
      /\baurora\b/i,
      /\bsqlite\b/i,
      /\bmariadb\b/i,
      /\bcockroach\b/i,
      /\bsupabase\b/i,
    ],
    category: 'database',
    color: 'violet',
    lucideFallback: 'database',
    extractQuery: (text) => {
      const m = text.match(
        /(postgres(?:ql)?|mysql|mongo(?:db)?|dynamodb|aurora|sqlite|mariadb|cockroach|supabase)/i
      );
      return m ? m[1] : text.split(/\s+/)[0];
    },
  },
  {
    patterns: [/\bredis\b/i, /\bmemcache/i, /\bcache\b/i, /\belasticache\b/i],
    category: 'cache',
    color: 'red',
    lucideFallback: 'hard-drive',
    extractQuery: (text) => {
      const m = text.match(/(redis|memcache(?:d)?|elasticache)/i);
      return m ? m[1] : 'cache';
    },
  },
  {
    patterns: [
      /\bkafka\b/i,
      /\brabbitmq\b/i,
      /\bsqs\b/i,
      /\bpulsar\b/i,
      /\bnats\b/i,
      /\bqueue\b/i,
      /\bbus\b/i,
    ],
    category: 'queue',
    color: 'amber',
    lucideFallback: 'layers',
    extractQuery: (text) => {
      const m = text.match(/(kafka|rabbitmq|sqs|pulsar|nats)/i);
      return m ? m[1] : 'queue';
    },
  },
  {
    patterns: [
      /\buser\b/i,
      /\bactor\b/i,
      /\bcustomer\b/i,
      /\badmin\b/i,
      /\bclient\b/i,
      /\bperson\b/i,
      /\bviewer\b/i,
    ],
    category: 'user',
    color: 'blue',
    lucideFallback: 'user',
  },
  {
    patterns: [
      /\bapi[- ]?gateway\b/i,
      /\bgateway\b/i,
      /\bload[- ]?balancer\b/i,
      /\bnginx\b/i,
      /\bhaproxy\b/i,
      /\balb\b/i,
      /\bcloudfront\b/i,
      /\bingress\b/i,
      /\benvoy\b/i,
    ],
    category: 'gateway',
    color: 'slate',
    lucideFallback: 'shield',
    extractQuery: (text) => {
      const m = text.match(/(api[- ]?gateway|nginx|haproxy|alb|cloudfront|ingress|envoy)/i);
      return m ? m[1] : 'gateway';
    },
  },
  {
    patterns: [
      /\bauth\b/i,
      /\blogin\b/i,
      /\bsign[- ]?in\b/i,
      /\boauth\b/i,
      /\bjwt\b/i,
      /\bsso\b/i,
      /\bcognito\b/i,
      /\bidentity\b/i,
    ],
    category: 'auth',
    color: 'amber',
    lucideFallback: 'key-round',
  },
  {
    patterns: [/\bs3\b/i, /\bblob\b/i, /\bstorage\b/i, /\buploads?\b/i, /\bcdn\b/i],
    category: 'storage',
    color: 'yellow',
    lucideFallback: 'folder',
  },
  {
    patterns: [
      /\breact\b/i,
      /\bvue\b/i,
      /\bangular\b/i,
      /\bsvelte\b/i,
      /\bnext\.?js\b/i,
      /\bnuxt\b/i,
      /\bfrontend\b/i,
      /\bui\b/i,
      /\bweb\s*app\b/i,
      /\bclient[- ]?app\b/i,
      /\bhtml\b/i,
      /\bcss\b/i,
    ],
    category: 'frontend',
    color: 'blue',
    lucideFallback: 'monitor',
    extractQuery: (text) => {
      const m = text.match(/(react|vue|angular|svelte|next(?:\.?js)?|nuxt)/i);
      return m ? m[1] : 'frontend';
    },
  },
  {
    patterns: [
      /\bexpress\b/i,
      /\bnode\.?js\b/i,
      /\bdjango\b/i,
      /\bflask\b/i,
      /\bfastapi\b/i,
      /\bspring\b/i,
      /\brails\b/i,
      /\blaravel\b/i,
      /\bgin\b/i,
      /\bactix\b/i,
      /\bnest\.?js\b/i,
      /\bapi\b/i,
      /\bservice\b/i,
      /\bbackend\b/i,
      /\bserver\b/i,
      /\bmicroservice\b/i,
    ],
    category: 'service',
    color: 'blue',
    lucideFallback: 'server',
    extractQuery: (text) => {
      const m = text.match(
        /(express|node\.?js|django|flask|fastapi|spring|rails|laravel|gin|actix|nest\.?js)/i
      );
      return m ? m[1] : text.split(/\s+/)[0];
    },
  },
  {
    patterns: [
      /\bdocker\b/i,
      /\bkubernetes\b/i,
      /\bk8s\b/i,
      /\becs\b/i,
      /\beks\b/i,
      /\bcloud\s*run\b/i,
      /\bcontainer\b/i,
    ],
    category: 'service',
    color: 'blue',
    lucideFallback: 'container',
    extractQuery: (text) => {
      const m = text.match(/(docker|kubernetes|k8s|ecs|eks|cloud\s*run)/i);
      return m ? m[1] : 'container';
    },
  },
];

const DEFAULT_HINT: SemanticHint = {
  category: 'process',
  color: 'slate',
  iconQuery: '',
  lucideFallback: 'box',
};

export function classifyNode(node: { id: string; label: string; shape?: string }): SemanticHint {
  if (node.shape === 'diamond') {
    return { category: 'decision', color: 'amber', iconQuery: '', lucideFallback: 'help-circle' };
  }

  if (node.shape === 'cylinder') {
    const text = `${node.id} ${node.label}`;
    const m = text.match(/(postgres(?:ql)?|mysql|mongo(?:db)?|redis|dynamodb|aurora)/i);
    return {
      category: 'database',
      color: 'violet',
      iconQuery: m ? m[1] : node.label,
      lucideFallback: 'database',
    };
  }

  const text = `${node.id} ${node.label}`;

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return {
        category: rule.category,
        color: rule.color,
        iconQuery: rule.extractQuery ? rule.extractQuery(text, node.id) : node.label,
        lucideFallback: rule.lucideFallback,
      };
    }
  }

  return DEFAULT_HINT;
}

export function classifyNodes(
  nodes: Array<{ id: string; label: string; shape?: string }>
): Map<string, SemanticHint> {
  const results = new Map<string, SemanticHint>();
  for (const node of nodes) {
    results.set(node.id, classifyNode(node));
  }
  return results;
}
