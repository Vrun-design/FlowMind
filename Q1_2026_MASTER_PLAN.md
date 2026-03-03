# OpenFlowKit: Q1 2026 Execution Plan (Low-Risk, High-Confidence)

Goal for this quarter: make OpenFlowKit the most reliable open-source developer diagram engine without destabilizing the existing editor.

This plan is intentionally risk-first: stabilize core behavior, then optimize performance, then improve deterministic workflows.

---

## North Star

OpenFlowKit should be the default developer diagram tool because it is:

- Fast at realistic graph sizes
- Deterministic and predictable
- Git-friendly for diagram-as-code
- Privacy-first and local-first
- Easy for contributors to profile and improve

---

## Hard Constraints (Do Not Violate)

1. No broad architecture rewrite in Q1.
2. No behavior-breaking refactors without feature flags.
3. No performance claims without reproducible fixtures and scripts.
4. No serialization format changes without migration compatibility.
5. No mandatory server, serverless backend, or hosted DB for core workflows.

---

## Success Metrics (Q1 Exit)

By March 31, 2026, on a defined reference machine profile:

1. Load 1,000 nodes / 1,500 edges in <= 2.5s (cold and warm numbers reported separately).
2. Drag on 500-node diagrams shows no sustained jank under common interactions.
3. Auto-layout <= 2s at 300 nodes and <= 5s at 1,000 nodes for supported presets.
4. Undo/redo correctness: zero known corruption cases in regression suite.
5. Mermaid/OpenFlow DSL round-trip >= 98% on golden corpus.
6. Deterministic export mode produces stable diffs across repeated exports.

---

## Delivery Model

- 2-week increments with one stabilization window between each major phase.
- Every risky change ships behind a runtime flag (default OFF until validated).
- "Definition of done" includes tests + benchmark update + rollback path.

### Execution Protocol (One-by-One, No Breakage)

Use this protocol for every task in every phase:

1. Pick exactly one scoped change.
2. Define pre-checks (tests/benchmarks) before editing.
3. Implement only the minimal diff for that scope.
4. Run post-checks against the same baseline.
5. Record result, risk notes, and rollback command/path.
6. Merge only when checks are green; otherwise revert the scoped change.

Per-change tracking template:

| Field | Required Entry |
| --- | --- |
| Change ID | `P{phase}-{n}` (example: `P1-03`) |
| Scope | One sentence, single behavior/objective |
| Flagged? | `Yes/No` (default `Yes` for risky changes) |
| Pre-check baseline | Test/benchmark names + current value/status |
| Post-check result | Pass/fail + deltas |
| Rollback path | Exact command or commit to restore prior behavior |
| Owner + date | Engineer + `YYYY-MM-DD` |

Definition of "safe to continue":

- No correctness regression.
- No unplanned performance regression on relevant fixture.
- No schema/export compatibility regression.

Mandatory approval gate before execution:

1. Share a short risk brief for the exact scoped change.
2. Share the planned checks and rollback path.
3. Wait for explicit user approval.
4. Execute only after approval and log results in [Q1 Execution Tracker](docs/q1_execution_tracker.md).

---

## Phase 0 (Week 1): Baseline, Guardrails, and Risk Burn-Down

Objective: establish measurement and safety before changing core behavior.

### 0.1 Benchmark Harness (First)

- Add canonical fixtures: `small-100`, `medium-300`, `large-1000`.
- Add benchmark scripts for:
  - Initial render time
  - Drag interaction frame budget sampling
  - Layout execution time
  - Heap growth during typical session
- Store baseline metrics in versioned artifacts in repo.
- Use [Benchmark Baseline Runbook](docs/benchmark-baseline.md) for command sequence, output paths, and reporting caveats.

### 0.2 Correctness Gates (Before Perf Work)

- Expand regression tests for:
  - Undo/redo correctness
  - Import/export round trips
  - Tab switching + autosave recovery
  - Layout determinism on unchanged input
- Add high-level smoke tests for primary user journeys.

### 0.3 Operational Guardrails

- Add feature-flag infrastructure for high-risk behavior changes.
- Add release gate checklist (perf delta, bundle delta, correctness delta).
- Use [Release Gate Checklist](docs/release-gate-checklist.md) before merge/release decisions.

Exit criteria:

1. Baseline metrics recorded.
2. Regression suite catches known failure classes.
3. Flag system in place for routing/history changes.

---

## Phase 1 (Weeks 2-3): Correctness and State Safety First

Objective: eliminate corruption risk and persistence fragility before throughput optimization.

### 1.1 Undo/Redo Safety

- Replace fragile whole-object reference snapshots with safe immutable snapshots or patch-based commands.
- Enforce deterministic history limits by both count and memory budget.
- Add invariant checks: state graph valid after undo/redo loops.
- Use [History Model Gap Analysis](docs/history-model-gap-analysis.md) as implementation baseline for Phase 1 history changes.

### 1.2 Persistence Consolidation

- Consolidate persistence strategy (single source of truth for autosave/store persistence).
- Implement File System Access API to save actual files directly to the user's local device, eliminating browser storage eviction risks.
- Add proactive storage-pressure guard: when estimated `localStorage` usage reaches 70% of quota, show warning banner/modal and prompt immediate download/export.
- Remove redundant full-payload writes and use selective persistence for temporary in-browser autosaves.
- Add schema version field and migration scaffolding for saved docs.

### 1.3 Data Model Hygiene

- Standardize hierarchy fields and tab/document model semantics.
- Add adapter for backward compatibility with existing saved files.

Exit criteria:

1. No undo/redo corruption in stress tests.
2. Restore/load behavior stable across refresh and tab switch cycles.
3. Migration tests pass on representative old artifacts.

---

## Phase 2 (Weeks 4-5): Performance Core (Routing + Rendering Cost)

Objective: remove highest runtime hotspots with minimal behavioral change.

Execution kickoff:

- Establish routing-hotspot benchmark baseline before optimization changes (`P2-01`).

### 2.1 Smart Routing Cost Control

- Stop full reroute on every drag frame.
- During drag: reroute only edges connected to moved nodes.
- On drag stop: run full reconciliation pass if required.
- Add debounce/throttle strategy for very large diagrams.

### 2.2 Edge Computation Efficiency

- Build indexed sibling/pair structures once per mutation epoch.
- Cache routing metadata and invalidate by affected node/edge sets.
- Keep default visual style lightweight in performance mode.

### 2.3 Large Graph Safety Mode

- Add automatic performance mode trigger above configurable graph size.
- Reduce expensive visuals and animation under load.
- Preserve manual override for power users.

Exit criteria:

1. 500-node drag interactions meet jank target.
2. Large fixture no longer triggers pathological reroute behavior.
3. No regression in edge correctness semantics.
4. Exit signoff captured in [Phase 2 Exit Signoff](docs/phase2-exit-signoff-2026-03-03.md).

---

## Phase 3 (Weeks 6-7): Deterministic Layout and Diagram Quality

Objective: improve readability without introducing layout chaos.

### 3.1 Deterministic Layout Contract

- Guarantee stable ordering when input graph and config are unchanged.
- Normalize tie-break rules for node ordering and component ordering.
- Add deterministic seeds/options where supported.

### 3.2 Layout Presets for Architecture Diagrams

- Ship three presets:
  - Hierarchical (default)
  - Orthogonal compact
  - Orthogonal spacious
- Tune spacing and group boundary behavior for each preset.

### 3.3 Connection Semantics and Label Stability

- Improve bidirectional and multi-edge handle assignment.
- Preserve manual edge label placement across layout/routing updates.

Exit criteria:

1. Repeated layout runs produce stable output under fixed inputs.
2. Grouped diagrams are visually consistent with preset expectations.
3. Label placement preservation tests pass.
4. Exit signoff captured in [Phase 3 Exit Signoff](docs/phase3-exit-signoff-2026-03-03.md).

---

## Phase 4 (Weeks 8-9): Diagram-as-Code Reliability and Git UX

Objective: make text workflows trustworthy and PR-friendly.

### 4.1 Canonical Serialization

- Define canonical ordering for nodes/edges/attributes.
- Introduce deterministic export mode for JSON and DSL.
- Keep legacy export compatibility where needed.

### 4.2 Round-Trip Fidelity and Diagnostics

- Expand Mermaid/OpenFlow DSL corpus with known edge cases.
- Add golden-file round-trip tests and diff reports.
- Improve parser/exporter errors with actionable messages.

### 4.3 Compatibility Policy

- Version DSL/document schema explicitly.
- Publish compatibility matrix and migration guarantees.
- Reference: [Schema Compatibility Matrix](docs/schema-compatibility-matrix.md)

Exit criteria:

1. >= 98% round-trip fidelity on corpus.
2. Deterministic export verified by repeated-run hash checks.
3. Migration path documented and tested.
4. Exit signoff captured in [Phase 4 Exit Signoff](docs/phase4-exit-signoff-2026-03-03.md).

---

## Phase 5 (Week 10): Proof, Docs, and Contributor Enablement

Objective: convert engineering quality into transparent trust.

### 5.1 Publish Reproducible Benchmarks

- Publish method, fixture definitions, machine profile, and raw numbers.
- Include confidence ranges and known caveats.
- Baseline package: [Benchmark Reproducibility Pack (2026-03-03)](docs/benchmark-reproducibility-2026-03-03.md)

### 5.2 Engineering Decision Records

- Document tradeoffs in routing, history model, and determinism strategy.
- Decision records: [Engineering Decision Records (2026-03-03)](docs/engineering-decision-records-2026-03-03.md)

### 5.3 Contributor Workflow

- Provide step-by-step profiling and regression triage guide.
- Include "how to add a new perf fixture" and "how to validate no regressions".
- Contributor guide: [Contributor Profiling and Regression Guide (2026-03-03)](docs/contributor-profiling-regression-guide-2026-03-03.md)

Exit criteria:

1. Benchmarks and method publicly reproducible.
2. Core architectural decisions documented.
3. Contributors can reproduce perf/correctness workflows locally.
4. Exit signoff captured in [Phase 5 Exit Signoff](docs/phase5-exit-signoff-2026-03-03.md).

---

## Renderer Abstraction Strategy (Risk-Limited for Q1)

Do in Q1:

- Add a thin `RendererAdapter` interface for core operations only.
- Keep only `ReactFlowAdapter` implemented.
- Move one low-risk subsystem behind adapter (e.g., export transform boundary) as proof point.

Do NOT do in Q1:

- Full renderer decoupling across all hooks/components.
- Second renderer implementation (Pixi/WebGL).

Reason: broad decoupling now introduces disproportionate regression risk vs Q1 goals.

---

## Explicit Scope Cuts (Q1)

Deferred to post-Q1 (or Q2 Pilots):

- Real-time collaboration (CRDT/Yjs, launching pilot in Q2)
- Stateful live API/webhook nodes
- Full SDK/commercial packaging tracks
- Second renderer implementation
- Broad enterprise GTM expansion

---

## Risk Register and Mitigations

1. Risk: Performance changes break interaction correctness.
- Mitigation: feature flags + correctness tests run before perf gate.

2. Risk: Persistence/schema changes break old files.
- Mitigation: schema versioning + migration tests + fallback loader.

3. Risk: Determinism work degrades layout quality.
- Mitigation: separate determinism tests and readability acceptance fixtures.

4. Risk: Timeline slip due to over-ambitious refactor.
- Mitigation: no broad rewrites; phase gates require measurable exits.

---

## Go/No-Go Release Gates

A release passes only if all are true:

1. Correctness: undo/redo, load/save, and import/export suites pass.
2. Performance: benchmark deltas within target budgets.
3. Determinism: canonical export and layout determinism checks pass.
4. Operability: rollback path exists for all major flagged changes.

---

## Q1 Final Exit Criteria

Ship Q1 only if all are true:

1. Large graph fixtures pass without major jank regressions.
2. Benchmarks are published, reproducible, and methodologically clear.
3. Round-trip and deterministic workflow goals are met.
4. Contributors can reproduce profiling and regression checks from docs.

This plan maximizes shipping confidence by solving correctness first, then performance, then deterministic developer workflows.

Final closeout signoff: [Q1 Final Closeout Signoff (2026-03-03)](docs/q1-final-closeout-signoff-2026-03-03.md)

---

## Q2 2026: #1 Product Experience Roadmap (UX + Speed + Product Feel)

Q2 objective: become the best developer-first diagramming product on interaction quality, speed, readability, and day-to-day usability.

Scope policy for Q2:

1. Keep enterprise/compliance-heavy collaboration out of critical path.
2. Add a low-risk collaboration lane (async-first) after core responsiveness is stable.
3. Prioritize perceived responsiveness and clarity over feature volume.
4. Every UX improvement must have measurable latency and task-success outcomes.

### Q2 Outcome Metrics (June 30, 2026)

1. New canvas interactive in <= 1.0s on reference machine.
2. Median command latency (add node, connect, rename, delete) <= 80ms.
3. 60 FPS sustained for pan/zoom/drag on medium fixture (300 nodes) and >= 45 FPS on large fixture (1000 nodes).
4. Time-to-first-diagram for new users <= 30 seconds; time-to-edit-existing <= 10 seconds.
5. Clean-layout action improves readability score on >= 85% of benchmark fixtures.
6. Deterministic round-trip fidelity >= 99% for JSON + DSL corpora.
7. User satisfaction target: >= 8.5/10 for “speed and ease of use” in structured beta survey.
8. Async local collaboration baseline shipped (portable review packs + comments + version history + conflict-safe restore).

---

## Q2 Workstreams

### Workstream A: Interaction Quality Bar (Weeks 1-3)

Objective: make every core interaction feel immediate, predictable, and smooth.

Implementation:

- Add interaction latency instrumentation at event boundaries:
  - pointer down -> visual response
  - command invoke -> state commit
  - drag frame duration and dropped frame count
- Build a frame-budget monitor in dev mode with warnings when > 16.7ms median frame on medium fixture.
- Introduce interaction performance budgets in CI for:
  - pan/zoom smoothness
  - node drag smoothness
  - connect edge feedback latency
- Add “degrade gracefully” policy:
  - disable expensive visuals before frame budget is exceeded
  - never block pointer interaction on non-essential visual work

Deliverables:

1. Interaction telemetry dashboard in docs/dev tooling.
2. CI perf checks for core interactions.
3. Runtime safeguards that protect responsiveness under load.

Exit criteria:

1. Median interaction latency <= 80ms on reference scenarios.
2. FPS targets met for medium and large fixtures.
3. No correctness regressions from optimizations.

### Workstream B: Instant First Value and Onboarding Flow (Weeks 2-4, parallel)

Objective: users reach useful output fast with minimal learning.

Implementation:

- Add “Quick Start Composer” on first launch:
  - input: plain-language intent
  - output: starter diagram + automatic clean pass
- Add “Fast Start Actions” above fold:
  - Start from prompt
  - Start from template
  - Paste Mermaid/DSL
  - Open last diagram
- Add startup optimization track:
  - split heavy code paths
  - prioritize editor shell + initial canvas
  - defer non-critical modules
- Add contextual first-run hints that auto-expire after successful completion.

Deliverables:

1. New-user path with < 30s time-to-first-diagram target.
2. Startup performance profile and optimization changelog.
3. First-run UX instrumentation (funnel from open -> first diagram saved).

Exit criteria:

1. Canvas interactive <= 1.0s on reference machine.
2. Time-to-first-diagram <= 30s median on onboarding test cohort.
3. First-session completion rate improved by >= 25% over Q1 baseline.

### Workstream C: Keyboard-First Power UX (Weeks 3-6)

Objective: expert users can model fast without UI friction.

Implementation:

- Expand command palette into full action router:
  - every major action discoverable + executable
  - fuzzy search for nodes/actions/layout presets
- Add bulk-edit workflow:
  - multi-select property edits
  - batch style and alignment changes
  - mass relabel and node-type conversion
- Add productivity primitives:
  - repeat last action
  - quick-transform macros (e.g., “align + distribute + route”)
  - advanced clipboard behaviors (smart paste offset, preserve link context)
- Add keyboard cheat-mode:
  - inline hints for relevant shortcuts after repeated mouse path detection

Deliverables:

1. Command coverage matrix (action -> palette/shortcut status).
2. Bulk edit and macro primitives shipped.
3. Power-user documentation + interactive shortcut guide.

Exit criteria:

1. >= 95% of common actions accessible from keyboard/palette.
2. Task completion time reduced by >= 30% on expert workflow benchmark.
3. Shortcut conflict and discoverability issues closed.

### Workstream D: Dense Graph Readability Engine (Weeks 4-8)

Objective: large technical diagrams remain understandable without manual cleanup fatigue.

Implementation:

- Add edge decluttering layer:
  - collision-aware routing refinements
  - edge bundling heuristics for parallel relations (with deterministic tie-breakers)
  - improved label collision avoidance
- Add focus tools:
  - isolate selected subgraph
  - dependency/path trace highlight
  - fade non-relevant graph context
- Add semantic zoom:
  - simplified rendering at far zoom
  - progressively richer detail at close zoom
- Add “Clean Architecture+” action:
  - layout + route + align + declutter pipeline
  - score and preview before apply

Deliverables:

1. Readability engine with measurable clutter reduction.
2. Focus and trace toolkit for large graphs.
3. One-click clean pass with preview and deterministic output.

Exit criteria:

1. Readability score improves in >= 85% of benchmark fixtures.
2. Label overlap incidents reduced by >= 60% on dense fixtures.
3. Clean pass produces stable output hash for unchanged input.

### Workstream E: Diagram-as-Code Excellence 2.0 (Weeks 5-9)

Objective: make code/text workflows deterministic, lossless, and friendly.

Implementation:

- Canonicalization spec v1:
  - stable object order
  - stable ID sort rules
  - stable attribute order
  - deterministic whitespace/line endings for text formats
- Add deterministic mode as default for exports (with legacy toggle if needed).
- Expand golden corpus:
  - real-world architecture examples
  - complex hierarchy and edge-case syntax
  - malformed input diagnostics cases
- Add error intelligence:
  - parser error localization (line/column)
  - suggested auto-fixes
  - non-destructive repair preview

Deliverables:

1. Canonical format specification document.
2. Golden corpora + diff-based fidelity reports in CI.
3. Upgrade-safe import/export with migration messages.

Exit criteria:

1. >= 99% round-trip fidelity.
2. Deterministic export consistency validated by repeated-run hash checks.
3. Parser error resolution success rate >= 80% in internal QA scenarios.

### Workstream F: AI Editing Assistant (Safe, Productive, Explainable) (Weeks 7-10)

Objective: AI improves editing speed without sacrificing trust.

Architecture Constraint:
- AI functionality will strictly follow a BYOK (Bring Your Own Key) model to ensure zero backend infrastructure cost and maintain static GitHub Pages hosting.

Implementation:

- Move AI from “generate-only” to “edit-existing” workflows:
  - add nodes/edges to existing canvas
  - transform topology safely
  - refactor labels and grouping
- Require plan + diff preview before apply:
  - “what will change” summary
  - highlighted adds/removes/updates
  - one-click rollback
- Add validation gates on AI output:
  - graph integrity checks
  - schema compatibility checks
  - deterministic post-format pass
- Add “fix my diagram” assistant action for common structural issues.

Deliverables:

1. AI edit workflow with preview + confirm.
2. AI safety validator pipeline.
3. One-click rollback and explainability UI.

Exit criteria:

1. AI edits pass integrity checks in >= 99% of accepted operations.
2. User-reported trust score for AI edits >= 8/10.
3. Rollback success rate 100% in QA suite.

---

### Workstream G: Collaboration Foundation (Async-First, Risk-Limited) (Weeks 8-10)

Objective: add practical collaboration without destabilizing core editor performance.

Local-first architecture rule:

- Collaboration must work fully offline with no required cloud service.
- Any realtime mode must be direct peer-to-peer and optional.

Implementation:

- Phase G1 (must ship):
  - Portable collaboration packs (`.openflow.review`) containing diagram, comments, and history metadata.
  - Local share flows:
    - export/import review pack
    - copy/paste patch bundle
    - Git-friendly change pack generation
  - Comment pins on nodes/edges/canvas with resolve/reopen states.
  - Version timeline with snapshot restore and diff summary.
  - Conflict-safe save behavior:
    - optimistic writes
    - local version/patch check
    - non-destructive conflict resolution UI
- Phase G2 (pilot only, behind flag):
  - Optional direct peer-to-peer session mode using **Yjs** (`y-webrtc`) with no hosted DB dependency.
  - *Note on Signaling:* `y-webrtc` handles peer connections over WebRTC, but still requires a lightweight signaling server to introduce peers. We will rely on default/public signaling servers for the pilot to maintain the static no-backend constraint.
  - Presence indicators and soft-lock hints during active P2P sessions only.
  - Realtime remains experimental and fully optional.
- Keep collaboration architecture separable from core rendering/state engine.

Deliverables:

1. Async local collaboration MVP (review pack + comments + timeline).
2. Conflict handling UX with zero silent overwrites.
3. Flagged direct-P2P pilot with telemetry only (no broad launch).

Exit criteria:

1. Comment and timeline flows pass reliability suite with no data loss.
2. Conflict resolution success >= 95% in simulated concurrent edit scenarios.
3. Collaboration features do not regress latency/FPS budgets beyond allowed delta.

---

## Q2 Milestones and Sequencing

### Milestone M1 (End Week 3): Responsiveness Foundation

- Workstreams A and B baseline ship.
- Interaction telemetry and startup targets visible.
- No major regressions from Q1 baseline.

### Milestone M2 (End Week 6): Power and Flow

- Workstream C complete.
- Workstream E core canonicalization shipped early (dependency for AI/collab safety).
- First half of Workstream D shipped (focus tools + semantic zoom baseline).
- Expert workflow time reduction validated.

### Milestone M3 (End Week 8): Readability and Determinism

- Workstream D complete.
- Workstream E corpus and diagnostics mostly complete.
- Deterministic export and readability targets near final thresholds.

### Milestone M4 (End Week 10): AI Editing + Collaboration Foundation + Public Proof

- Workstream F complete.
- Workstream G Phase G1 complete (G2 only as pilot flag).
- Final performance and UX scorecards published.
- Release candidate gated by full Q2 go/no-go checks.

---

## Q2 Go/No-Go Gates

Ship Q2 release only if all pass:

1. Responsiveness gates (latency + FPS budgets) pass on reference fixtures.
2. Readability and clean-pass quality thresholds are met.
3. Deterministic export and 99% round-trip fidelity are achieved.
4. AI edit safety and rollback tests pass.
5. Collaboration async flows pass without data loss or silent conflicts.
6. No critical regressions in core editing journeys.

---

## Cross-Quarter Dependency Order (Revisited)

To reduce execution risk, enforce this dependency chain:

1. Core correctness and persistence safety (Q1 Phase 1) before heavy perf work.
2. Perf routing/render budgets (Q1 Phase 2) before advanced UX additions.
3. Deterministic model + canonicalization (Q1 Phase 4 + Q2 Workstream E core) before AI editing and collaboration.
4. Dense readability and AI editing after deterministic guarantees are stable.
5. Collaboration async foundation only after the above are green.

---

## Delivery Gaps Closed (Now Explicit)

### Capacity and Ownership

- Assign one DRI per workstream with one backup owner.
- Cap parallel high-risk streams to two at any time.
- Freeze scope during milestone hardening week unless a critical defect demands change.

### Definition of Done (Per Work Item)

1. Feature flag behavior defined (default state + rollback path).
2. Tests added (unit + integration + regression as applicable).
3. Perf impact measured against fixture baselines.
4. Telemetry and error logging added for launch monitoring.
5. Docs and migration notes updated if data format or behavior changes.

### Release Safety

- Add canary/beta ring before broad release for Workstreams F and G.
- Keep canary/beta distribution artifact-based (OSS release channels), not backend-gated.
- Define max allowed perf regression per release (for example: <= 5% on key metrics).
- Maintain incident runbook for restore/rollback and data recovery.

---

## Q2 Reporting Cadence

Weekly:

1. Performance budget report (latency, FPS, heap growth).
2. Correctness report (regressions, flaky tests, migration issues).
3. UX outcome report (task times, completion rates, beta feedback).

Bi-weekly:

1. Milestone review with go/no-go decision.
2. Scope adjustment to protect launch quality (drop low-impact work first).

---

## Post-Q2 Positioning

If Q1 + Q2 targets are met, OpenFlowKit should be positioned as:

- Fastest and most predictable developer-first diagramming experience.
- Best diagram-as-code workflow for technical architecture users.
- High-trust editor where speed and readability scale with graph complexity.
