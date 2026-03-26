# Feature Audit: Architecture Linting + Code-to-Diagram Imports

> Internal doc — March 2026. Honest assessment of what we have vs. what it's worth.

---

## TL;DR

**Architecture Linting:** Real, working, genuinely useful for teams that want diagram governance. Limited rule types but the core engine is solid. Competitors don't have this at all.

**Code/Data Imports (SQL, Terraform, OpenAPI, source code):** Legit time-savers for first drafts. Not vaporware — the prompts are specialized and the position-preservation logic is surprisingly good. But they're AI-driven, so output is non-deterministic and can be wrong. Honest positioning: "get you 80% there fast, you finish it" — not "auto-generated perfect diagram."

Neither feature is BS. Both need marketing honesty and continued hardening to stay real value vs. showcase feature.

---

## 1. Architecture Linting

### What it actually does

Rule engine that evaluates diagram constraints in real-time as you edit. Rules are JSON, stored per-diagram.

Two rule types:
- `cannot-connect` — flags any edge where source matches A and target matches B
- `must-connect` — flags any A node that has no outgoing edge to a B node

Node matchers: `id`, `labelContains`, `labelEquals`, `nodeType`

Three severity levels: `error`, `warning`, `info`

Violations are highlighted on the canvas (nodes + edges go red/amber), with a summary panel in Studio showing violation count and details.

Example rule that actually works:
```json
{
  "id": "no-direct-db-call",
  "type": "cannot-connect",
  "from": { "labelContains": "service" },
  "to": { "labelContains": "database" },
  "message": "Services must go through a repository layer",
  "severity": "error"
}
```

### How good is the implementation?

**The engine itself: solid.** Memoized evaluation, handles JSON parse errors gracefully, visual highlighting is wired up correctly, violation list is clear. This is genuinely production-ready code.

**The rule language: limited.** Only two rule types. Can't match on edge labels, edge types, or node data properties. Can't express "layer A should only connect to layer B" as a single rule — you'd need many rules. No UI rule builder (raw JSON only).

**Real gaps:**
- No `forbidden-cycle` rule type (huge for layered arch diagrams)
- No `must-have-node` (e.g., every section must contain a gateway)
- No organization-level rules — only per-diagram
- No rule templates or parameterization
- JSON-only editing is a barrier for non-technical users

### vs. Competition

| Tool | Diagram Linting |
|---|---|
| **Lucidchart** | None |
| **Miro** | None |
| **draw.io** | None |
| **Structurizr** | Partial — hardcoded C4 model validation only |
| **IcePanel** | Some model validation, but tied to their C4 flow |
| **us** | Flexible user-defined rules, real-time, any diagram type |

**Honest verdict:** We're the only general-purpose diagramming tool with flexible user-defined linting. Structurizr has validation but it's baked in and C4-only. This is a real differentiator — but it needs more rule types and a UI builder to be genuinely powerful vs. just interesting.

### Value verdict: **Real, not BS — but needs investment to hit its potential**

---

## 2. Code & Data Imports

### What's actually supported

| Input | Output | How |
|---|---|---|
| SQL DDL | ER Diagram | AI prompt with entity/relationship guidelines |
| Terraform / K8s / Docker Compose | Cloud architecture diagram | AI prompt with cloud node type guidance |
| OpenAPI / Swagger spec | Sequence diagram | AI prompt with sequence flow guidelines |
| Source code (TS, JS, Python, Go, Java, Ruby, C#, C++, Rust) | Architecture diagram | AI prompt with module/dependency guidelines |

All routes go through specialized prompt builders → AI model → OpenFlow DSL → graph composer → canvas.

### How good is the output, honestly?

**SQL → ERD:** Best of the four. SQL DDL is structured, so the AI has real signal to work with. Tables become entities, foreign keys become edges with cardinality. Works well for schemas up to ~20 tables. Beyond that, the context window fills up and quality degrades. Misses: views, stored procedures, complex constraints.

**Terraform/K8s → Cloud:** Works for standard patterns (ECS + RDS + ALB, a basic K8s deployment). Struggles with complex multi-module Terraform or custom providers. The icon/node type selection is prompt-dependent, not deterministic — so two runs of the same input can produce different layouts. Good enough for "show me the rough shape of this infrastructure."

**OpenAPI → Sequence:** Weakest of the four. Good for simple REST APIs. Falls apart with complex auth flows, webhooks, deeply nested objects. More useful as a "skeleton to build on" than an accurate representation.

**Source code → Architecture:** Extracts top-level modules and their relationships. Best for monorepos or files with clear import graphs. Won't catch runtime dependencies or patterns that aren't obvious from imports.

### The smart part: position-preserving apply

When you have an existing diagram and run an import/generation on top of it, nodes that match by ID keep their positions. New nodes get intelligently placed:
- If a new node connects to 2+ existing nodes → placed perpendicular between them
- If it connects to 1 existing node → offset 200px
- If orphan → stacked right of bounding box

This is actually good UX engineering. It means iterative imports (start rough, refine, re-run) work without destroying your layout. Most competitors with AI generation just nuke your layout every time.

### Real gaps

- **Non-deterministic:** Same input, different output each run. Fine for drafts, not for compliance docs.
- **Edit mode fragility:** AI is instructed to preserve node IDs, but it sometimes forgets. There's a fallback to label matching (case-insensitive), which is lossy. If you rename a node and re-run, it might create a duplicate.
- **No streaming:** Waits for the full response (up to 4096 tokens) before showing anything. Feels slow on large diagrams.
- **No abort:** Once you hit generate, you're waiting.
- **Chat history not persisted:** Refresh the page, lose your conversation context.
- **Image import: Gemini only** — other providers don't support multimodal input.

### vs. Competition

| Tool | Code/Data Import |
|---|---|
| **Lucidchart** | CSV import, no code parsing |
| **Miro** | No code import |
| **draw.io** | No AI, manual XML only |
| **Eraser.io** | Code-to-diagram (our closest competitor here) |
| **Whimsical** | AI generation but freeform, no structured input |
| **Mermaid Live** | Code-to-diagram but chart DSL only, no natural language |
| **us** | Structured import for SQL/Terraform/OpenAPI/code + chat editing |

**Eraser.io comparison:** They have code-to-diagram too, and it's good. Their strength is developer workflow integration (VS Code plugin, Git sync). Our strength is the broader diagram type support and the structured import for non-code inputs (SQL, Terraform, OpenAPI). We're roughly comparable on raw import quality.

### Value verdict: **Real value for first drafts. Honest positioning needed — it's "80% there fast" not "done for you."**

---

## 3. The Underlying AI Core

### What powers everything

Single `useAIGeneration()` hook with four specialized entry points. All routes through the same lifecycle:

```
Specialized prompt builder → AI model (8 providers supported) → OpenFlow DSL parser → Position-preserving graph apply → Canvas
```

**System instruction is detailed** — ~3000 token guidance covering node types, edge styles, color semantics, icon choices, ID preservation rules. This is genuinely more thoughtful than just "make a diagram."

**Multi-provider:** Gemini, OpenAI, Claude, Groq, NVIDIA, Cerebras, Mistral, OpenRouter, Custom endpoint. User brings their own key. This is the right call for a dev-tool — no lock-in.

**Default models:**
- Gemini: `gemini-2.5-flash-lite` (fast, cheap, good)
- OpenAI: `gpt-5-mini`
- Claude: `claude-sonnet-4-6`

### Core weaknesses

1. **No streaming** — full response wait is the single biggest UX friction point
2. **No retry/backoff** — transient API errors just fail
3. **Edit mode ID fragility** — already covered above
4. **Chat history in-memory only** — no persistence
5. **Temperature fixed at 0.2** — good for determinism, but no way for user to tune creativity vs. precision

---

## Overall Verdict

| Feature | Is it real value? | Production ready? | Priority to improve |
|---|---|---|---|
| Architecture Linting | Yes — unique differentiator | MVP yes, needs more rule types | Medium — add `forbidden-cycle`, `must-have-node`, UI builder |
| SQL → ERD | Yes | Yes, with caveats | Low — works well enough |
| Terraform/K8s → Cloud | Mostly | Yes, with caveats | Medium — deterministic parser would help |
| OpenAPI → Sequence | Marginal | Kind of | High — needs biggest improvement or honest downscoping |
| Source Code → Architecture | Yes for drafts | Yes, with caveats | Low |
| AI Core (Flowpilot) | Yes | Yes, with caveats | High — streaming + persistence are table stakes |

### What we can honestly say in marketing

- "Import your SQL schema and get a live ER diagram in seconds" ✓
- "Paste your Terraform and see your infrastructure laid out" ✓ (add: "as a starting point")
- "Enforce architecture rules across your team's diagrams" ✓ (genuinely unique)
- "Turn any codebase into an architecture diagram" — use carefully, add: "as a draft"
- "Generate perfect, accurate diagrams from code" ✗ — too strong, will burn trust

The imports are real. The linting is real. Neither is vaporware. But they're "get you most of the way there" tools, not "done for you" tools — and we should own that positioning rather than oversell.

---

## Road to World's Best: Phased Implementation Plan

> Impact = how much this moves the needle on "best tool for the job." Effort = engineering weeks, rough estimate for a small team.
> Scale: Impact 1–5, Effort S/M/L/XL (S=<1 week, M=1–2 weeks, L=3–5 weeks, XL=6+ weeks)

---

### Phase 1 — Fix the Embarrassing Stuff (0–6 weeks)
*These are gaps that undermine trust in features that already exist. Do these before any new features.*

| # | What | Why it matters | Impact | Effort |
|---|---|---|---|---|
| 1.1 | **Streaming AI responses** | Biggest single UX improvement. Right now you stare at a blank canvas for 10–20s. Streaming shows progress and makes it feel alive. All streaming is browser-direct (BYOK/local-first) — Gemini via `generateContentStream()` SDK method, OpenAI-compatible via `stream:true` + `ReadableStream` SSE parsing, Claude via SSE fetch. No server needed. | 5 | M |
| 1.2 | **Abort/cancel generation** | Can't cancel a generation in progress. Users who fat-finger a prompt are stuck. Basic product hygiene. | 3 | S |
| 1.3 | **Edit mode ID locking** | AI forgets node IDs during edits → duplicates appear. Fix: server-side validate returned IDs against existing canvas before applying; reject/merge any that conflict. | 4 | M |
| 1.4 | **Persist chat history** | Refresh = lose your entire conversation. localStorage persistence with a "clear history" button. Table stakes for any chat product. | 3 | S |
| 1.5 | **Retry + exponential backoff** | Transient API errors silently fail. Add 3-attempt retry with backoff and a visible "retrying…" state. | 2 | S |
| 1.6 | **OpenAPI import — scope down or fix** | Currently the weakest import by far. Either: (a) scope marketing claims, or (b) rewrite the prompt to focus on top-level endpoint groups only and stop pretending it generates a full sequence diagram. Option (a) costs nothing. | 3 | S |

**Phase 1 outcome:** Every existing feature works reliably. No more "why did it make a duplicate?" or "why is it hanging?" moments.

---

### Phase 2 — Make Linting Actually Powerful (6–14 weeks)
*Linting is our only truly unique differentiator. Right now it's a curiosity. Phase 2 makes it a reason to choose us.*

| # | What | Why it matters | Impact | Effort |
|---|---|---|---|---|
| 2.1 | **`forbidden-cycle` rule type** | Can't express "no circular dependencies between layers" today. This is the #1 architecture constraint teams actually want to enforce. | 5 | M |
| 2.2 | **`must-have-node` rule type** | "Every section must contain a load balancer." Lets teams enforce structural completeness. | 4 | S |
| 2.3 | **`node-count` rule type** | "No more than 3 microservices in this group." Useful for complexity governance. | 3 | S |
| 2.4 | **Edge label matchers** | Match on edge label, edge type (solid/dashed), or edge direction. Currently can only match on nodes — this is a big gap for sequence/flow diagrams. | 4 | M |
| 2.5 | **Visual lint rule builder UI** | Right now rules are raw JSON. A form-based builder (pick rule type → pick matchers from dropdowns → preview) would open linting to non-technical users. This is the difference between "devs know about it" and "the whole org uses it." | 5 | L |
| 2.6 | **Organization-level rule sets** | Rules stored per-diagram today. Add workspace-level rule sets that apply to all diagrams. Admins define standards, everyone gets them. | 5 | L |
| 2.7 | **Built-in rule library** | Curated rule sets for common standards: Clean Architecture, Hexagonal, C4 Model, AWS Well-Architected. One-click import. Instant "wow" moment for new users. | 4 | M |
| 2.8 | **Lint report export** | Export violations as JSON/CSV for compliance workflows. Lets teams integrate with their existing audit processes. | 3 | S |

**Phase 2 outcome:** Architecture linting becomes a genuine category-defining feature. No other diagramming tool has this. At this point we can market it as "architecture governance" not just "linting."

---

### Phase 3 — Make Imports Deterministic and Deep (14–26 weeks)
*AI-only imports are fine for drafts. But "best in the world" means you can trust the output. Phase 3 adds deterministic parsers layered under the AI.*

| # | What | Why it matters | Impact | Effort |
|---|---|---|---|---|
| 3.1 | **Deterministic SQL parser** | Parse SQL DDL directly (AST-level): extract tables, columns, types, foreign keys, indexes, views, constraints. AI generates layout + labels, but structure comes from the parser. Zero hallucinations on schema structure. | 5 | L |
| 3.2 | **Deterministic Terraform/K8s parser** | Parse HCL (Terraform) and YAML (K8s) directly: extract resources, dependencies, annotations. Map to known provider resource types (AWS, GCP, Azure) with deterministic icon selection. AI only fills gaps. | 5 | XL |
| 3.3 | **Git-connected import** | Connect a repo → diagram auto-updates when the source file changes. This is Eraser.io's killer feature. We need it to win in the dev-tools segment. | 5 | XL |
| 3.4 | **OpenAPI full rebuild** | Scrap the current prompt-only approach. Build a proper OpenAPI parser: extract endpoints, group by tag/resource, map auth flows explicitly, handle webhooks and callbacks. Output a sequence diagram + a resource graph side by side. | 4 | L |
| 3.5 | **Image → diagram (multimodal)** | Extend beyond Gemini — support image input on OpenAI and Claude providers too. Also: whiteboard photo → clean diagram. Huge for "I sketched this on paper, clean it up" use case. | 4 | M |
| 3.6 | **Incremental re-import** | Re-run an import on a changed file, show a diff of what changed, let user accept/reject changes node-by-node. Right now it's all-or-nothing. | 5 | L |
| 3.7 | **Import from running systems** | Connect to live infrastructure: AWS/GCP/Azure APIs, Kubernetes cluster, database connection string. Generate diagram from actual running state, not source files. No competitor has this for general diagramming. | 5 | XL |

**Phase 3 outcome:** Imports are reliable enough to use in compliance and documentation workflows, not just exploration. "Import from running systems" would be a category-creating announcement.

---

### Phase 4 — AI That Actually Understands Your Architecture (26–40 weeks)
*Phase 4 is where we stop being "a diagramming tool with AI" and become "an AI that understands your architecture and surfaces it visually."*

| # | What | Why it matters | Impact | Effort |
|---|---|---|---|---|
| 4.1 | **Architecture knowledge base** | Let teams annotate nodes with metadata (team ownership, SLAs, tech stack, deployment env). AI can reference this when generating or editing. Diagrams become living documentation, not just pictures. | 5 | XL |
| 4.2 | **Cross-diagram lint rules** | Rules that span multiple diagrams: "service X in diagram A must appear in diagram B's dependency graph." Needed for large orgs with many diagrams. | 4 | L |
| 4.3 | **AI-suggested lint rules** | After import, AI analyzes the diagram and proposes rules: "I notice all your services connect directly to the DB — want a rule to catch that?" Turns a passive tool into an active advisor. | 4 | M |
| 4.4 | **Architecture drift detection** | Compare diagram to live system state (from Phase 3.7). Highlight nodes that exist in the diagram but not in production, and vice versa. "Your diagram shows a Redis cache — we can't find it in your cluster." | 5 | XL |
| 4.5 | **Natural language rule authoring** | "Make a rule that frontend components can't call the database directly" → generates the JSON lint rule. Democratizes linting for non-technical architects. | 4 | M |
| 4.6 | **Diagram versioning + change explanations** | Git-style versioning of diagrams with AI-generated changelogs: "Added payment service, connected it to stripe gateway, removed legacy billing node." Useful for teams doing architecture reviews. | 4 | L |

**Phase 4 outcome:** We're not competing with Lucidchart or Miro anymore. We're in a different category — architecture intelligence, not just diagramming. Teams use us as the source of truth for their system architecture.

---

### Summary: Impact vs. Effort Matrix

```
High Impact
│
│  [3.7 Live infra import]  [4.4 Drift detection]
│  [2.6 Org-level rules]    [3.3 Git-connected import]
│  [2.1 Forbidden cycle]    [3.1 Deterministic SQL]
│  [1.1 Streaming]          [2.5 Rule builder UI]
│  [4.5 NL rule authoring]
│
│  [2.7 Rule library]       [4.1 Knowledge base]
│  [1.3 Edit ID locking]    [3.6 Incremental re-import]
│  [3.4 OpenAPI rebuild]    [3.2 Terraform parser]
│
│  [1.4 Chat persistence]   [4.6 Versioning]
│  [2.8 Lint export]        [4.2 Cross-diagram lint]
│  [2.2 must-have-node]
│
Low Impact
└────────────────────────────────────────────────────
         Low Effort                          High Effort
```

### The honest 6-month bet

If we execute Phase 1 + Phase 2 fully in 6 months:
- We have the only diagramming tool with real, flexible architecture governance
- AI generation is reliable enough to trust (no more duplicates, no more hanging)
- We can charge for linting as a team/enterprise feature
- We have a clear story: *"Flowmind is where you design and enforce your architecture, not just draw it"*

That's a winnable position. No competitor is close on linting. And "governance" is a buying trigger for enterprise — it's what gets us out of "team pays for it" and into "company pays for it."
