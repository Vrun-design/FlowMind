import { describe, expect, it } from 'vitest';
import { formatOpenApiForPrompt, parseOpenApi } from './openApiParser';

const minimalSpec = JSON.stringify({
  info: { title: 'Test API', version: '1.0.0' },
  paths: {
    '/users': { get: { tags: ['Users'], summary: 'List users' } },
    '/users/{id}': { delete: { tags: ['Users'], summary: 'Delete user' } },
    '/orders': { post: { tags: ['Orders'], summary: 'Create order' } },
  },
});

describe('parseOpenApi', () => {
  it('returns null for invalid JSON', () => {
    expect(parseOpenApi('not json')).toBeNull();
    expect(parseOpenApi('')).toBeNull();
  });

  it('extracts title and version from info', () => {
    const result = parseOpenApi(minimalSpec);
    expect(result?.title).toBe('Test API');
    expect(result?.version).toBe('1.0.0');
  });

  it('groups endpoints by tag', () => {
    const result = parseOpenApi(minimalSpec);
    expect(result?.groups).toHaveLength(2);
    const users = result?.groups.find((g) => g.tag === 'Users');
    expect(users?.endpoints).toHaveLength(2);
    expect(users?.endpoints.map((e) => e.method)).toContain('GET');
    expect(users?.endpoints.map((e) => e.method)).toContain('DELETE');
  });

  it('assigns untagged endpoints to "General" group', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      paths: { '/health': { get: { summary: 'Health check' } } },
    });
    const result = parseOpenApi(spec);
    expect(result?.groups[0].tag).toBe('General');
  });

  it('detects security schemes from components', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    });
    const result = parseOpenApi(spec);
    expect(result?.securitySchemes).toHaveLength(1);
    expect(result?.securitySchemes[0]).toMatchObject({ name: 'bearerAuth', type: 'http' });
  });

  it('detects security schemes from legacy securityDefinitions', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      paths: {},
      securityDefinitions: { apiKey: { type: 'apiKey' } },
    });
    const result = parseOpenApi(spec);
    expect(result?.securitySchemes[0]).toMatchObject({ name: 'apiKey', type: 'apiKey' });
  });

  it('detects global auth flag', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      security: [{ bearerAuth: [] }],
      paths: {},
    });
    const result = parseOpenApi(spec);
    expect(result?.hasGlobalAuth).toBe(true);
  });

  it('marks per-operation auth when operation has security', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      paths: {
        '/secret': { get: { tags: ['Secure'], security: [{ bearerAuth: [] }] } },
        '/public': { get: { tags: ['Open'] } },
      },
    });
    const result = parseOpenApi(spec);
    const secureEndpoint = result?.groups.find((g) => g.tag === 'Secure')?.endpoints[0];
    const openEndpoint = result?.groups.find((g) => g.tag === 'Open')?.endpoints[0];
    expect(secureEndpoint?.requiresAuth).toBe(true);
    expect(openEndpoint?.requiresAuth).toBe(false);
  });

  it('uses tag descriptions when available', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      tags: [{ name: 'Users', description: 'User management' }],
      paths: { '/users': { get: { tags: ['Users'] } } },
    });
    const result = parseOpenApi(spec);
    expect(result?.groups[0].description).toBe('User management');
  });

  it('handles spec with no paths', () => {
    const spec = JSON.stringify({ info: { title: 'Empty API' } });
    const result = parseOpenApi(spec);
    expect(result?.groups).toHaveLength(0);
  });
});

describe('formatOpenApiForPrompt', () => {
  it('includes API title and version', () => {
    const result = parseOpenApi(minimalSpec)!;
    const output = formatOpenApiForPrompt(result);
    expect(output).toContain('Test API v1.0.0');
  });

  it('lists resource groups', () => {
    const result = parseOpenApi(minimalSpec)!;
    const output = formatOpenApiForPrompt(result);
    expect(output).toContain('Users');
    expect(output).toContain('Orders');
  });

  it('shows up to 3 sample endpoints per group', () => {
    const paths: Record<string, unknown> = {};
    for (let i = 0; i < 5; i++) {
      paths[`/items/${i}`] = { get: { tags: ['Items'] } };
    }
    const spec = JSON.stringify({ info: { title: 'API' }, paths });
    const result = parseOpenApi(spec)!;
    const output = formatOpenApiForPrompt(result);
    expect(output).toContain('... and 2 more');
  });

  it('includes AUTH section when security schemes exist', () => {
    const spec = JSON.stringify({
      info: { title: 'API' },
      paths: {},
      components: { securitySchemes: { bearer: { type: 'http' } } },
    });
    const result = parseOpenApi(spec)!;
    const output = formatOpenApiForPrompt(result);
    expect(output).toContain('AUTH:');
    expect(output).toContain('bearer');
  });

  it('omits AUTH section when no security schemes', () => {
    const result = parseOpenApi(minimalSpec)!;
    const output = formatOpenApiForPrompt(result);
    expect(output).not.toContain('AUTH:');
  });
});
