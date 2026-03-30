import { describe, expect, it } from 'vitest';
import {
  buildCodeToArchitecturePrompt,
  buildCodebaseToArchitecturePrompt,
} from './codeToArchitecture';

describe('codeToArchitecture prompts', () => {
  it('teaches source-code analysis to use architecture nodes for infrastructure resources', () => {
    const prompt = buildCodeToArchitecturePrompt({
      code: 'import { S3Client } from "@aws-sdk/client-s3";',
      language: 'typescript',
    });

    expect(prompt).toContain('Use [architecture] nodes for databases, caches, queues, external APIs, cloud services, and infrastructure');
    expect(prompt).toContain('yellow for caches and fast-path systems');
    expect(prompt).toContain('Prefer [architecture] when the code clearly references cloud services or runtime infrastructure');
  });

  it('includes detected platform, services, and infra files in the codebase prompt', () => {
    const prompt = buildCodebaseToArchitecturePrompt({
      summary: 'CODEBASE STRUCTURE',
      cloudPlatform: 'aws',
      detectedServices: [
        {
          name: 'Redis',
          type: 'cache',
          provider: 'unknown',
          resourceType: 'service',
          suggestedColor: 'yellow',
          evidence: ['docker-compose.yml'],
        },
        {
          name: 'Lambda',
          type: 'compute',
          provider: 'aws',
          resourceType: 'service',
          suggestedColor: 'violet',
          iconPackId: 'aws-official-starter-v1',
          iconShapeId: 'compute-lambda',
          evidence: ['src/index.ts'],
        },
      ],
      infraFiles: ['docker-compose.yml', 'infra/main.tf'],
    });

    expect(prompt).toContain('cloudPlatform: aws');
    expect(prompt).toContain('- Redis [cache] provider=unknown (evidence: docker-compose.yml)');
    expect(prompt).toContain('- Redis -> use [architecture], archProvider: "unknown", archResourceType: "service", color: "yellow"');
    expect(prompt).toContain(
      '- Lambda -> use [architecture], archProvider: "aws", archResourceType: "service", color: "violet", archIconPackId: "aws-official-starter-v1", archIconShapeId: "compute-lambda"'
    );
    expect(prompt).toContain('- infra/main.tf');
    expect(prompt).toContain('Label important edges with what flows across them');
  });
});
