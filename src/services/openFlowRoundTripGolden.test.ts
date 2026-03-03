import { describe, expect, it } from 'vitest';
import { parseOpenFlowDSL } from '@/lib/openFlowDSLParser';
import { toOpenFlowDSL } from './openFlowDSLExporter';
import { OPENFLOW_ROUND_TRIP_GOLDEN_FIXTURES } from './openFlowRoundTripGoldenFixtures';

describe('openflow DSL golden round-trip fixtures', () => {
  it.each(OPENFLOW_ROUND_TRIP_GOLDEN_FIXTURES)(
    'round-trips fixture $name in deterministic mode',
    ({ nodes, edges }) => {
      const firstPassDsl = toOpenFlowDSL(nodes, edges, { mode: 'deterministic' });
      const parsed = parseOpenFlowDSL(firstPassDsl);

      expect(parsed.error).toBeUndefined();

      const secondPassDsl = toOpenFlowDSL(parsed.nodes, parsed.edges, { mode: 'deterministic' });
      expect(secondPassDsl).toBe(firstPassDsl);
    }
  );
});
