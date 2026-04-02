import { describe, expect, it } from 'vitest';
import { resolveIconSync, resolveLucideFallback } from './iconResolver';

describe('resolveIconSync', () => {
  it('resolves PostgreSQL alias', () => {
    const result = resolveIconSync('PostgreSQL');
    expect(result.found).toBe(true);
    expect(result.iconSearch).toBe('postgresql');
    expect(result.catalog).toBe('developer');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('resolves shorthand aliases', () => {
    expect(resolveIconSync('postgres').iconSearch).toBe('postgresql');
    expect(resolveIconSync('pg').iconSearch).toBe('postgresql');
    expect(resolveIconSync('mongo').iconSearch).toBe('mongodb');
    expect(resolveIconSync('k8s').iconSearch).toBe('kubernetes');
  });

  it('resolves framework aliases', () => {
    expect(resolveIconSync('React').catalog).toBe('developer');
    expect(resolveIconSync('Next.js').iconSearch).toBe('nextjs');
    expect(resolveIconSync('Express').iconSearch).toBe('express');
    expect(resolveIconSync('Django').iconSearch).toBe('django');
    expect(resolveIconSync('FastAPI').iconSearch).toBe('fastapi');
  });

  it('resolves infrastructure aliases', () => {
    expect(resolveIconSync('Docker').catalog).toBe('developer');
    expect(resolveIconSync('Kubernetes').catalog).toBe('cncf');
    expect(resolveIconSync('nginx').iconSearch).toBe('nginx');
    expect(resolveIconSync('RabbitMQ').iconSearch).toBe('rabbitmq');
    expect(resolveIconSync('Kafka').iconSearch).toBe('apachekafka');
  });

  it('resolves cloud service aliases', () => {
    expect(resolveIconSync('S3').catalog).toBe('aws');
    expect(resolveIconSync('Lambda').catalog).toBe('aws');
    expect(resolveIconSync('Cloud Run').catalog).toBe('gcp');
    expect(resolveIconSync('Azure Functions').catalog).toBe('azure');
  });

  it('returns not found for unknown queries', () => {
    const result = resolveIconSync('RandomThing123');
    expect(result.found).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('uses category fallback when alias not found', () => {
    const result = resolveIconSync('MyCustomDB', 'database');
    expect(result.found).toBe(true);
    expect(result.lucideIcon).toBe('database');
    expect(result.confidence).toBe(0.5);
  });

  it('handles empty query', () => {
    expect(resolveIconSync('').found).toBe(false);
    expect(resolveIconSync('  ').found).toBe(false);
  });
});

describe('resolveLucideFallback', () => {
  it('returns correct fallback icons', () => {
    expect(resolveLucideFallback('database')).toBe('database');
    expect(resolveLucideFallback('cache')).toBe('hard-drive');
    expect(resolveLucideFallback('service')).toBe('server');
    expect(resolveLucideFallback('frontend')).toBe('monitor');
    expect(resolveLucideFallback('user')).toBe('user');
    expect(resolveLucideFallback('gateway')).toBe('shield');
  });

  it('returns box for unknown categories', () => {
    expect(resolveLucideFallback('unknown')).toBe('box');
  });
});
