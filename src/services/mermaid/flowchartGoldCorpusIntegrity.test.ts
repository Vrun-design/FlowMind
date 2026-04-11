import { describe, expect, it } from 'vitest';
import { MERMAID_COMPAT_FIXTURES } from '../../../scripts/mermaid-compat-fixtures.mjs';
import { MERMAID_FLOWCHART_GOLD_CORPUS } from '../../../scripts/mermaid-flowchart-gold-corpus.mjs';

interface CompatFixtureRecord {
  name: string;
  family: string;
  source: string;
}

interface GoldCorpusRecord {
  id: string;
  fixtureName: string;
  priority: 'p0' | 'p1' | 'p2';
  failureModes: string[];
  userImpact: string;
  successCriteria: string[];
}

describe('flowchart gold corpus integrity', () => {
  it('keeps a valid prioritized gold corpus wired to shared Mermaid flowchart fixtures', () => {
    const compatFixtures = MERMAID_COMPAT_FIXTURES as CompatFixtureRecord[];
    const goldCorpus = MERMAID_FLOWCHART_GOLD_CORPUS as GoldCorpusRecord[];
    const fixtureByName = new Map(compatFixtures.map((fixture) => [fixture.name, fixture]));

    expect(goldCorpus.length).toBeGreaterThanOrEqual(5);

    const ids = new Set<string>();
    const fixtureNames = new Set<string>();
    let p0Count = 0;

    for (const record of goldCorpus) {
      expect(ids.has(record.id), `gold corpus id "${record.id}" must be unique`).toBe(false);
      ids.add(record.id);

      expect(
        fixtureNames.has(record.fixtureName),
        `gold corpus fixture "${record.fixtureName}" should only appear once`
      ).toBe(false);
      fixtureNames.add(record.fixtureName);

      const fixture = fixtureByName.get(record.fixtureName);
      expect(fixture, `missing compat fixture "${record.fixtureName}"`).toBeDefined();
      expect(fixture?.family, record.fixtureName).toBe('flowchart');
      expect(fixture?.source.trim().startsWith('flowchart'), record.fixtureName).toBe(true);

      expect(record.failureModes.length, `${record.id} should classify at least one failure mode`).toBeGreaterThan(0);
      expect(record.successCriteria.length, `${record.id} should define at least one success criterion`).toBeGreaterThan(0);
      expect(record.userImpact.trim().length, `${record.id} should describe user impact`).toBeGreaterThan(20);

      if (record.priority === 'p0') {
        p0Count += 1;
      }
    }

    expect(p0Count).toBeGreaterThanOrEqual(2);
  });
});
