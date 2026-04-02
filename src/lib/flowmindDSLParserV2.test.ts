import { describe, it, expect } from 'vitest';
import { parseOpenFlowDslV2 } from './openFlowDslParserV2';

describe('OpenFlow DSL V2 Parser', () => {
  it('parses basic nodes and edges', () => {
    const input = `
            [start] Start
            [process] Step 1
            [end] End
            Start -> Step 1
            Step 1 -> End
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);

    const startNode = result.nodes.find((n) => n.data.label === 'Start');
    expect(startNode).toBeDefined();
    expect(startNode?.type).toBe('start');
  });

  it('parses explicit IDs', () => {
    const input = `
            [process] p1: Process One
            [process] p2: Process Two
            p1 -> p2
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.nodes).toHaveLength(2);

    const p1 = result.nodes.find((n) => n.id === 'p1');
    expect(p1).toBeDefined();
    expect(p1?.data.label).toBe('Process One');

    const edge = result.edges[0];
    expect(edge.source).toBe('p1');
    expect(edge.target).toBe('p2');
  });

  it('parses attributes', () => {
    const input = `
            [process] p1: Configured Node { color: "red", icon: "settings" }
            p1 -> p2 { style: "dashed", label: "async" }
        `;
    const result = parseOpenFlowDslV2(input);

    const p1 = result.nodes.find((n) => n.id === 'p1');
    expect(p1?.data.color).toBe('red');
    expect(p1?.data.icon).toBe('settings');

    const edge = result.edges[0];
    expect(edge.data?.styleType).toBe('dashed'); // Attributes merged into edge data/attributes? Parser logic puts it in edge helper or data?
    // Checking parser implementation:
    // dslEdges.push({ ..., attributes })
    // finalEdges.push(createDefaultEdge(..., attributes/label?))
    // Expecting createDefaultEdge to handle it or we need to check how it's mapped.
    // In parser implementation:
    // createDefaultEdge(source, target, label, id)
    // Wait, I missed passing attributes to createDefaultEdge in my implementation!

    // Let's check the implementation again.
  });

  it('parses quoted attribute values containing commas, colons, and escapes', () => {
    const input = `
            [process] p1: Configured Node { icon: "server, api", note: "http://svc:8080/path", enabled: true, retries: 3, quote: "say \\"hello\\"" }
        `;
    const result = parseOpenFlowDslV2(input);

    const p1 = result.nodes.find((node) => node.id === 'p1');
    expect(p1?.data.icon).toBe('server, api');
    expect(p1?.data.note).toBe('http://svc:8080/path');
    expect(p1?.data.enabled).toBe(true);
    expect(p1?.data.retries).toBe(3);
    expect(p1?.data.quote).toBe('say "hello"');
  });

  it('ignores group wrappers and keeps inner nodes flat', () => {
    const input = `
            group "Backend" {
                [process] api: API
                [database] db: DB
                api -> db
            }
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.nodes).toHaveLength(2);

    const api = result.nodes.find((n) => n.id === 'api');
    expect(api?.parentId).toBeUndefined();
  });

  it('maps archProvider/archResourceType to archIconPackId/archIconShapeId', () => {
    const input = `
            [system] db: PostgreSQL { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }
            [system] api: Express API { archProvider: "developer", archResourceType: "others-expressjs-dark" }
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.nodes).toHaveLength(2);

    const db = result.nodes.find((n) => n.id === 'db');
    expect(db?.data.archIconPackId).toBe('developer-icons-v1');
    expect(db?.data.archIconShapeId).toBe('database-postgresql');
    expect(db?.data.assetPresentation).toBe('icon');

    const api = result.nodes.find((n) => n.id === 'api');
    expect(api?.data.archIconPackId).toBe('developer-icons-v1');
    expect(api?.data.archIconShapeId).toBe('others-expressjs-dark');
  });

  it('passes provider attribute through to node data', () => {
    const input = `
            [architecture] lambda: API Lambda { archProvider: "aws", archResourceType: "compute-lambda", color: "violet" }
            [architecture] rds: Database { provider: "aws", color: "violet" }
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.nodes).toHaveLength(2);

    const lambda = result.nodes.find((n) => n.id === 'lambda');
    expect(lambda?.data.archIconPackId).toBe('aws-official-starter-v1');
    expect(lambda?.data.archIconShapeId).toBe('compute-lambda');

    const rds = result.nodes.find((n) => n.id === 'rds');
    expect(rds?.data.provider).toBe('aws');
  });

  it('passes icon attribute for catalog search', () => {
    const input = `
            [system] cache: Redis Cache { icon: "redis", color: "red" }
        `;
    const result = parseOpenFlowDslV2(input);
    const cache = result.nodes.find((n) => n.id === 'cache');
    expect(cache?.data.icon).toBe('redis');
  });

  it('maps [architecture] to custom node type', () => {
    const input = `
            [architecture] lambda: Lambda { archProvider: "aws", archResourceType: "compute-lambda" }
        `;
    const result = parseOpenFlowDslV2(input);
    const lambda = result.nodes.find((n) => n.id === 'lambda');
    expect(lambda?.type).toBe('custom');
  });

  it('accepts icons: auto header in metadata', () => {
    const input = `
            flow: My Architecture
            direction: TB
            icons: auto
            [system] api: API
        `;
    const result = parseOpenFlowDslV2(input);
    expect(result.metadata.icons).toBe('auto');
    expect(result.nodes).toHaveLength(1);
  });
});
