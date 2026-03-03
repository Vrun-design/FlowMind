# Benchmark Reproducibility Pack (2026-03-03)

This artifact publishes the reproducible benchmark method, machine profile, and raw-number package for Q1.

## Machine Profile

- Date (IST): `2026-03-03`
- OS: `Darwin 24.6.0 (arm64)`
- Node: `v22.18.0`
- npm: `11.5.2`

## Fixture Set

- `benchmarks/fixtures/small-100.json` (100 nodes / 150 edges)
- `benchmarks/fixtures/medium-300.json` (300 nodes / 450 edges)
- `benchmarks/fixtures/large-1000.json` (1000 nodes / 1500 edges)

## Command Method

Per fixture:

```bash
npm run bench:harness -- --fixture <fixture> --mode initial-render --iterations 8
npm run bench:harness -- --fixture <fixture> --mode drag-frame-budget --iterations 8
npm run bench:harness -- --fixture <fixture> --mode layout --iterations 8
npm run bench:harness -- --fixture <fixture> --mode routing-hotspot --iterations 8
npm run bench:harness -- --fixture <fixture> --mode heap-growth --iterations 8
npm run bench:summary -- --fixture <fixture>
```

Integrity check:

```bash
npm run bench:check
```

## Published Raw Numbers Package

- Package manifest:
  - `benchmarks/results/q1-2026-baseline-package-2026-03-03.json`
- Raw mode + summary files:
  - `benchmarks/results/*.latest.json` for `small-100`, `medium-300`, `large-1000`

## Confidence Range Convention

- Use `median` as primary signal.
- Use `p95` as confidence bound / tail-latency indicator.
- Treat single-sample spikes as noise unless median or p95 shifts materially over repeated runs.

## Baseline Snapshot (Median / p95)

| Fixture | Initial Render (ms) | Drag Frame Budget (ms) | Layout (ms) | Routing Hotspot (ms) | Heap Delta (MB) |
| --- | --- | --- | --- | --- | --- |
| `small-100` | `0.031 / 0.347` | `0.011 / 0.321` | `0.037 / 7.367` | `0.031 / 0.451` | `0.117` |
| `medium-300` | `0.088 / 0.427` | `0.016 / 0.303` | `0.095 / 7.366` | `0.094 / 0.412` | `0.332` |
| `large-1000` | `0.480 / 1.334` | `0.054 / 0.385` | `0.325 / 7.984` | `0.335 / 0.713` | `0.436` |

## Known Caveats

1. Metrics are Node.js harness proxy metrics, not browser render/FPS/heap truth.
2. Layout `p95` has known long-tail behavior in this harness and should be interpreted alongside median.
3. Use the same machine class and Node version when comparing deltas for release decisions.
