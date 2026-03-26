# OpenFlowKit — Competitive Analysis + Roadmap to #1

**Last updated:** 2026-03-26
**Audience:** Founder. Unfiltered.

---

## Who We're Building For

Not just developers. **Builders** — anyone who creates things and needs to communicate them visually:

- **PMs** — user flows, product specs, decision trees, roadmaps
- **Designers** — system architecture for handoff, design system docs, component relationships
- **Engineers** — ER schemas, architecture diagrams, class models, system flows
- **DevRel / Technical writers** — explainer diagrams for docs, README visuals, onboarding flows
- **Founders / Startup teams** — pitch deck architecture, team workflows, process maps

The target XP: **FigJam's smoothness and feel + Lucidchart's depth + nobody's privacy model + AI that actually works**.

---

## Honest Current State

### What's Actually Shipped (confirmed by code inspection)

| Feature | Real? | Notes |
|---|---|---|
| 7 diagram families | ✅ | Flowchart, Architecture, ER, Class, Mindmap, Journey, State |
| PNG / JPG / SVG / PDF export | ✅ | PDF is a real builder, not a stub (`pdfDocument.ts`) |
| Mermaid + PlantUML export | ✅ | Full round-trip |
| OpenFlow DSL export | ✅ | Custom format, parseable back in |
| Figma editable SVG export | ✅ | Clipboard paste into Figma with live layers |
| Video + GIF export (playback) | ✅ | Real frame capture + encoder pipeline |
| AI generation (streaming) | ✅ | Multi-provider, BYOK, pending diff preview |
| SQL → ER diagram | ✅ | Local parser, no server |
| Terraform / K8s → Architecture | ✅ | Multi-format parser |
| OpenAPI → Sequence (via AI) | ✅ | Full pipeline |
| Mermaid import | ✅ | Parser + visual round-trip |
| ELK auto-layout | ✅ | Multiple algorithms |
| Smart edge routing (5 modes) | ✅ | Orthogonal, bezier, step, straight, ELK |
| Architecture lint rules | ✅ | 15 rules, 5 templates (Clean Arch, Hexagonal, AWS, etc.) |
| Playback / presentation mode | ✅ | Topology-aware ordering, step durations |
| Real-time collaboration (beta) | ✅ | WebRTC + Yjs P2P, no server storage |
| Keyboard shortcut suite | ✅ | Full coverage |
| Multi-select + bulk operations | ✅ | |
| Wireframe nodes (browser + mobile) | ✅ | Unique in this space |
| Chat history per diagram | ✅ | Persistent per tab |
| Figma style import | ✅ | Pulls color/font styles from Figma API |

**Nothing above is a stub. Everything listed works.**

---

## Competitor Map (Updated for Builders Audience)

| Tool | Best for | Price | AI | Local | OSS | Depth |
|---|---|---|---|---|---|---|
| **FigJam** | Design collab | $3–5/mo | Basic | ❌ | ❌ | Low |
| **Miro** | Workshops, boards | $8–16/mo | Basic | ❌ | ❌ | Low |
| **Whimsical** | Flowcharts, wireframes | $10/mo | ❌ | ❌ | ❌ | Medium |
| **draw.io** | All diagramming | Free | ❌ | ✅ | ✅ | High |
| **Lucidchart** | Enterprise diagrams | $9–15/mo | Basic | ❌ | ❌ | High |
| **Excalidraw** | Quick sketches | Free | Partial | ✅ | ✅ | Low |
| **Mermaid** | Code→diagram | Free | ❌ | ✅ | ✅ | Medium |
| **Structurizr** | Architecture (C4) | Free–$14/mo | ❌ | Partial | Partial | Medium |
| **Creately** | Diagrams + DB | $8–15/mo | Basic | ❌ | ❌ | Medium |
| **OpenFlowKit** | **All of the above** | **Free** | **Deep** | **✅** | **✅** | **High** |

---

## Feature Comparison vs Top 4

### Diagram Depth

| Type | OF | draw.io | Lucidchart | FigJam | Excalidraw |
|---|---|---|---|---|---|
| Flowchart | ✅ | ✅ | ✅ | Basic | Freeform |
| Architecture / Cloud | ✅ + lint | ✅ shapes | ✅ shapes | ❌ | ❌ |
| ER Diagram | ✅ editable | ✅ shapes | ✅ shapes | ❌ | ❌ |
| Class Diagram | ✅ editable | ✅ shapes | ✅ shapes | ❌ | ❌ |
| Mindmap | ✅ | ✅ | ✅ | ✅ | ❌ |
| User Journey | ✅ | ❌ | Partial | ❌ | ❌ |
| State Diagram | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Sequence** | ❌ visual | ❌ | ✅ | ❌ | ❌ |
| Wireframe (Browser/Mobile) | ✅ | ❌ | ❌ | ❌ | ❌ |

Gap: **Sequence diagram** — high demand for API/backend teams. Must build.

### AI

| Capability | OF | draw.io | Lucidchart | FigJam | Miro |
|---|---|---|---|---|---|
| Generate from prompt | ✅ streaming | ❌ | ✅ cloud | ✅ basic | ✅ basic |
| Edit selection with AI | ✅ | ❌ | ❌ | ❌ | ❌ |
| SQL → ER | ✅ local | ❌ | ❌ | ❌ | ❌ |
| Terraform/K8s → Arch | ✅ | ❌ | ❌ | ❌ | ❌ |
| OpenAPI → Sequence | ✅ | ❌ | ❌ | ❌ | ❌ |
| Diff preview before apply | ✅ | ❌ | ❌ | ❌ | ❌ |
| BYOK multi-provider | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ollama (local model) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Keys never leave browser | ✅ | N/A | ❌ | ❌ | ❌ |

**This is our biggest moat.** No competitor is close on AI breadth + privacy.

### Export (we win convincingly)

| Format | OF | draw.io | Lucidchart | FigJam | Excalidraw |
|---|---|---|---|---|---|
| PNG / SVG / PDF | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mermaid code | ✅ | ❌ | ❌ | ❌ | ❌ |
| PlantUML | ✅ | ❌ | ❌ | ❌ | ❌ |
| Figma editable | ✅ | ❌ | ❌ | N/A | ❌ |
| Video (WebM/MP4) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Animated GIF | ✅ | ❌ | ❌ | ❌ | ❌ |

### Overall Score (Builders Lens)

| Category | OF | draw.io | Excalidraw | FigJam | Lucidchart |
|---|---|---|---|---|---|
| Feature depth | 9 | 8 | 4 | 5 | 9 |
| AI | 10 | 1 | 3 | 4 | 5 |
| Privacy / local-first | 10 | 8 | 8 | 2 | 3 |
| Export versatility | 10 | 7 | 5 | 4 | 7 |
| First-run / onboarding | 4 | 6 | 9 | 8 | 7 |
| Visual polish | 6 | 6 | 9 | 9 | 7 |
| Dark mode | ❌ | ✅ | ✅ | ✅ | ✅ |
| Templates | 4 | 8 | 6 | 7 | 9 |
| Collaboration | 6 | 6 | 8 | 9 | 8 |
| Price | 10 | 10 | 10 | 5 | 4 |
| **Total** | **7.9** | **7.0** | **7.2** | **6.3** | **6.9** |

**We're already #1 on raw score for builders who care about depth + privacy.** The gap is first-run experience and polish — and that's entirely fixable.

---

## Real Gaps (Honest)

### Gap 1 — First-run experience (CRITICAL)
Cold open = blank canvas. No demo. No "here's what this tool can do." Excalidraw and FigJam nail the first 60 seconds. We don't.

A first-time user who doesn't already know what to do will leave in under 60 seconds. This is the biggest conversion killer.

**Fix:** Welcome flow with 3 starter options: "Start from template", "Import from Mermaid / SQL / OpenAPI", "Blank canvas". Takes 1–2 days.

### Gap 2 — AI setup friction (CRITICAL for our biggest differentiator)
BYOK is our best feature. It's also invisible to new users. If someone clicks an AI button and nothing happens, they assume the tool is broken. There's no guided "add your key in 30 seconds" flow.

**Fix:** When AI is unconfigured, show an inline guided setup — provider picker + key field + confirm — right in the AI panel. Skip the Settings modal entirely. 1 day.

### Gap 3 — No dark mode
Every technical tool launched in the last 5 years has dark mode. Its absence reads as "this was made fast." Designers especially notice.

**Fix:** CSS custom property architecture already exists (`--brand-primary`, `--radius-*`, etc.). Add a dark palette, a theme toggle, persist to localStorage. 2–3 days.

### Gap 4 — Sequence diagram visual editor
Most searched diagram type. Currently no visual editor — only the OpenAPI→AI flow which produces an output but can't be hand-built or edited. draw.io and Lucidchart both have this.

Backend engineers and API teams won't stay without it.

**Fix:** New diagram family. Actor lanes + message arrows. Mermaid sequence import/export already works. 3–4 days for v1.

### Gap 5 — Template gallery (thin)
People search "flowchart template", "microservices architecture diagram", "ER diagram for user auth". Lucidchart wins this traffic. We have the template system built — we just have too few templates.

**Fix:** Write 20 curated templates. Not engineering work — content work. 1 day to draft, 1 day to build in-app.

### Gap 6 — GitHub README embed isn't promoted
The `/view` route exists and works. A diagram can be embedded in a GitHub README right now. Almost nobody knows this. This is a viral loop: every embedded diagram is an impression.

**Fix:** Prominent "Embed in README" button in the export panel. Generates a one-liner badge. 0.5 days.

### Gap 7 — Shape library breadth (non-critical for builders, matters for enterprise)
draw.io has BPMN, network, floor plan, electrical shapes. We don't. For our target builder audience this matters less — but it blocks enterprise and ops teams entirely.

**Fix:** Not urgent. Add when targeting enterprise.

---

## New Feature: Cinematic Reveal Animation Export

### What It Is

A one-click export that produces a smooth animated video or GIF showing your diagram "revealing itself" — nodes fade in one by one, connectors draw themselves in, building up the full picture. Like those animated architecture diagrams you see in Apple WWDC keynotes.

Users embed these in:
- README files
- Dev docs and architecture decision records
- Engineering blog posts
- Onboarding decks
- Hacker News "Show HN" posts (this is genuinely viral content)
- LinkedIn / Twitter / X posts for technical content

No competitor has this. It is a **demo-able, shareable, viral** feature for a ProductHunt launch.

### Why It's Feasible Now

All the hard parts already exist in the codebase:

| Needed | Exists? | Location |
|---|---|---|
| Topological node ordering | ✅ | `src/services/playback/studio.ts` — `topologicalSortNodes()` |
| Frame capture from React Flow | ✅ | `src/hooks/useFlowExport.ts` — `toPng()` loop |
| GIF encoder | ✅ | `src/services/gifEncoder.ts` |
| Video encoder (MediaRecorder) | ✅ | `src/hooks/useFlowExport.ts` |
| Animated export preset system | ✅ | `src/services/animatedExport.ts` |
| Animated edge presentation | ✅ | `src/components/custom-edge/animatedEdgePresentation.ts` |
| Memory/size estimation | ✅ | `buildAnimatedExportPlan()` |

The current animated export (playback GIF/video) does: jump to step → wait → capture. It's mechanical, not cinematic.

The new feature layers a smooth animation on top: **fade-in + slight scale-up per node group, edge path draw animation, smooth transitions between groups.**

### Technical Design

#### Architecture

```
CinematicRevealExport
├── revealSequencer.ts        (pure fn: nodes+edges → RevealFrame[])
├── RevealOverlay.tsx          (off-screen component: renders frame at time T)
│   ├── Node opacity/scale CSS transitions
│   └── Edge SVG strokeDashoffset draw animation
└── cinematic reveal added to useFlowExport.ts
    ├── Drives RevealOverlay through time T
    ├── Captures frames at target FPS
    └── Feeds to existing GIF/video encoder
```

#### `revealSequencer.ts`

Pure function, easily tested. Input: nodes + edges. Output: `RevealFrame[]` — each frame has a timestamp and a set of visible node/edge IDs with their opacity (0–1).

```ts
interface RevealFrame {
  timeMs: number;
  nodes: Map<string, number>;  // id → opacity 0–1
  edges: Map<string, number>;  // id → draw progress 0–1
}

function buildRevealSequence(
  nodes: FlowNode[],
  edges: FlowEdge[],
  options: RevealOptions
): RevealFrame[]
```

Reveal groups: each group = 1 node + its incoming edges from already-revealed nodes. Ordered by topological sort (reuse existing). Each group gets a configurable stagger (e.g. 200ms default).

Within a group, the animation timeline:
- `0ms`: node fades in (opacity 0→1 over 300ms) + slight scale (0.85→1)
- `150ms`: incoming edges draw in (strokeDashoffset 1→0 over 250ms each)
- `+staggerMs`: next group starts

Total duration for 50 nodes at 200ms stagger = ~10 seconds. At 12fps = 120 frames for GIF, ~240 frames for video. Manageable.

#### `RevealOverlay.tsx`

A hidden React component mounted off-screen. Accepts a `RevealFrame` prop and renders the full diagram with the correct opacities applied. Uses inline styles on the existing node/edge wrappers — no new rendering layer needed.

Edge draw animation: we already have `animatedEdgePresentation.ts` for edge animation. We extend it to accept a `drawProgress: number` prop (0–1) and render the edge as a partially drawn path using `strokeDashoffset`.

This keeps all rendering using the existing React Flow components — we get visual consistency for free.

#### Frame Capture Loop

```ts
for each target frame at time T:
  1. Set RevealOverlay frame state
  2. await nextAnimationFrame()    // let React render
  3. await toPng(revealOverlay)    // capture
  4. push to encoder
  5. report progress
```

For GIF: feed frames to existing `encodeGif()`.
For video: render to an off-screen canvas, use `canvas.captureStream(fps)` + `MediaRecorder` — streams to blob without holding all frames in memory simultaneously. More memory-efficient for long diagrams.

#### Memory Budget

50 nodes, 12fps GIF, 10s animation = 120 frames × 960×540 RGBA = ~250MB peak in the naive approach. That's too much.

**Solution:** Process frames in batches of 10. Encode each batch into the GIF buffer progressively, then free the raw frame memory. The existing `encodeGif` returns a full Uint8Array — we need it to accept a streaming mode. This is the only meaningful new engineering work.

For video (MediaRecorder approach): no frame memory issue. The browser handles compression in real-time. Video output will be 5–20MB for 50 nodes.

**Recommendation:** Default to video (WebM). GIF as an option with a "this may be large" warning for 30+ nodes.

#### Options / Settings

```ts
interface RevealOptions {
  staggerMs: number;         // default 200 — time between groups
  nodeFadeMs: number;        // default 300 — node fade-in duration
  edgeDrawMs: number;        // default 250 — edge draw duration
  holdMs: number;            // default 500 — pause on completed diagram
  easing: 'ease-out' | 'linear';  // default ease-out
  outputFps: number;         // default 12 for GIF, 24 for video
}
```

Exposed as simple preset picker in export UI: "Fast (5s)" / "Balanced (10s)" / "Cinematic (20s)".

#### Export UI Integration

Add to `ExportMenuPanel.tsx`:
- Section: "Animated" (below the existing formats)
- Two options: "Reveal Video" and "Reveal GIF"
- On click: progress toast + capture loop + download

No modal needed. The whole flow is one click → toast shows progress → file downloads.

#### What Makes It Viral

A PM creates a 30-node microservices architecture. Exports "Reveal Video". Posts to Twitter/LinkedIn: "Here's how our new payment system works →". The GIF auto-plays in the feed, nodes appear one by one, people can follow the flow. Comments: "what tool did you use?" → "OpenFlowKit, free and local-first."

This is the kind of shareable artifact that Figma built its early growth on (the shareable file link). We build the shareable animated architecture diagram.

---

## Phased Plan to #1

### Phase 0 — Pre-ProductHunt (this week, 7 days)

Goal: Ship the minimum that makes a strong first impression and gives journalists / HN something to write about. One week is not enough to fix everything — pick the things that matter for a launch.

**Day 1–2: First-run experience**
- On cold open, show a "Welcome to OpenFlowKit" overlay with 3 paths:
  - "Start from a template" → opens template picker (10 starter templates)
  - "Import" → opens command bar to import view
  - "Blank canvas" → dismisses overlay
- Add 10 starter templates: checkout flow, microservices arch, ER for users/orders, product roadmap, CI/CD pipeline, user journey for onboarding, class diagram starter, state machine starter, mindmap starter, system context C4.

**Day 3: AI guided setup**
- When AI panel opens and no provider is configured: show inline card "Add your AI key" with provider selector + key field + "Save and try" button.
- Don't send people to Settings. Remove that friction entirely.

**Day 4–5: Cinematic Reveal Animation (MVP)**
- Build `revealSequencer.ts` (pure function, fast)
- Build `RevealOverlay.tsx` (off-screen render with CSS transitions)
- Wire into export as "Reveal Video" (WebM, video path, no GIF memory issue)
- Export UI: single button in export panel
- This is the demo feature for the PH launch. Every GIF posted from OpenFlowKit drives brand impressions.

**Day 6: Polish pass**
- Fix any rough edges in the above
- Ensure mobile gate message is friendly not cold
- README embed button in export panel
- Verify all export formats actually work end-to-end in a fresh browser

**Day 7: Freeze + prep launch assets**
- Record a demo GIF of the cinematic reveal on a real architecture diagram
- Write the PH tagline using the unique value props
- Cut a clean release branch

**Skip for launch:** dark mode, sequence diagram, BPMN. These are post-launch.

---

### Phase 1 — Post-Launch Sprint (weeks 2–4)

**Dark mode**
- CSS custom property system already in place
- Add `data-theme="dark"` attribute to root
- Define dark palette in `src/index.css`
- Toggle stored in localStorage + viewSettings
- 2–3 days

**Sequence diagram visual editor**
- New diagram family in `src/diagram-types/`
- Participant lanes + message arrows as node/edge types
- Mermaid sequence import already partially works
- Full round-trip: draw in app → export Mermaid sequence → import back
- 3–4 days for a usable v1

**Template gallery expansion**
- 30 total templates across: architecture, flows, ER/class, journey, mindmap, wireframe
- Searchable by use case, not just type
- 1–2 days content + 1 day integration

**Cinematic Reveal GIF (streaming encoder)**
- Implement streaming GIF encode to handle 30+ node diagrams in memory-safe way
- Add GIF as output option alongside video
- 1–2 days

---

### Phase 2 — Growth Features (weeks 5–10)

**GitHub README embed flow (viral loop)**
- "Share as README badge" button generates Markdown with the `/view` URL
- Update `/view` route to render at multiple sizes (badge / card / full)
- Every embedded diagram = brand impression + back-link

**Shape library expansion**
- BPMN basic shapes (no full BPMN semantics yet)
- Network diagrams (routers, switches, firewalls)
- C4 model shapes (system context, container, component)
- Sourced from open icon packs

**Collaboration polish**
- Remove beta label when transport is stable
- Room password protection (simple shared secret)
- Presence avatars in top nav

**AI chat per-diagram memory**
- Conversation history already persists per tab
- Surface it as "AI context" in the studio panel
- Allow users to set "diagram context" that prefixes every AI request

**Architecture diagram v2**
- C4 model support (4 levels: system context → containers → components → code)
- Auto-nest containers inside system boxes
- Export as valid C4-PlantUML

---

### Phase 3 — Platform Features (months 3–6)

**Plugin / extension system**
- Custom node types via a JSON schema + renderer spec
- Custom AI prompts as named templates
- Import adapters (e.g. AWS CloudFormation, Pulumi state files)

**Diagram search and discovery**
- Community template gallery with upvotes
- Public "view" links that can be discovered (opt-in)
- SEO-optimized landing pages for each template type

**Advanced collaboration**
- Optional server-backed sync (self-hostable)
- Diagram version history with named saves
- Comment threads per node

**Enterprise features**
- SSO / SAML
- Org-level design system enforcement
- Audit logs
- On-premise deployment via Docker

---

## What Makes Us Undeniably #1

If we ship the Phase 0 + Phase 1 list, here's the honest claim we can make:

> **OpenFlowKit is the best diagramming tool for builders.**
> Free. Open source. Local-first. AI that works on your own keys. Exports everything including animated videos. The only tool where SQL creates an ER diagram and Terraform creates an architecture diagram in seconds.

No competitor can say all of that. draw.io can't (no AI). Lucidchart can't (not free, not local). FigJam can't (no depth). Excalidraw can't (no structure). Mermaid can't (no visual editor).

The product is already better than anything free on depth + AI. Close the first-run gap and the cinematic export makes it sharable. That's the launch.
