import { describe, expect, it } from 'vitest';
import { getMermaidImportCandidateIds } from './importGeometryUtils';

describe('getMermaidImportCandidateIds', () => {
  it('recovers semantic ids from renderer-prefixed flowchart node ids', () => {
    const candidates = getMermaidImportCandidateIds('probe-ids-flowchart-LIVE_PROMPT-23');

    expect(candidates).toContain('probe-ids-flowchart-LIVE_PROMPT-23');
    expect(candidates).toContain('probe-ids-flowchart-LIVE_PROMPT');
    expect(candidates).toContain('LIVE_PROMPT');
  });
});
