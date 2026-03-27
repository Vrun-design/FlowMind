# OpenFlowKit — Competitive Analysis + Launch Roadmap

**Last updated:** 2026-03-26
**Audience:** Founder. Unfiltered.
**Status:** Rewritten against the current codebase, not old assumptions.

---

## Who We Are Actually Building For

Primary audience:
- developers
- technical builders
- DevRel / technical writers
- startup teams shipping technical products

Secondary audience:
- PMs and designers who work closely with technical systems

This matters because our strongest wedge is not "general diagramming for everyone."
It is:

> **local-first diagramming for builders who need structure, portability, privacy, and AI-assisted workflows**

The product can serve broader users, but the launch story is strongest when we lead with the technical builder use case.

---

## Verified Current State

### Clearly Shipped

These are real in the codebase today:

- Welcome flow with template/import/blank entry points
- Inline AI key setup in the studio panel
- Cinematic animated export in the product UI as video and GIF
- Sequence diagrams with plugin support, Mermaid import/export, property-panel support, and starter template coverage
- `/view` route and share viewer flow
- Template system with launch-priority metadata
- SQL import, Terraform/Kubernetes/Docker Compose infrastructure parsing, Mermaid import/export, OpenFlow JSON document import/export
- Architecture linting with rule library/templates
- Playback/presentation system
- Collaboration beta
- Figma export and Figma style import

### Shipped But Still Needs Polish

- Welcome flow is better than before, but the builder-first path can still be more explicit.
- AI setup works, but the local-first / BYOK explanation can still be clearer.
- Template gallery has strong foundations, but the launch-facing set is still thin relative to the opportunity.
- Share/embed exists, but the output and promotion surface are still not strong enough.
- Cinematic export direction is strong, but visual polish and export performance still have room to improve.

### Partially Shipped

- Sequence is no longer missing. It is partially complete and already useful, but still deserves a completion audit before aggressive claims.
- C4 and network support exist in meaningful form through architecture resource types, starter templates, asset categories, and lint templates, but the breadth is still below dedicated enterprise diagram suites.
- Local-first persistence is real, but cold-start offline app-shell support is still not defensible.

### Not Shipped Yet

- true offline PWA/app-shell caching
- larger enterprise-oriented shape breadth
- scale/performance work specifically for very large diagrams
- stronger embed preset system for README/card/full share formats

---

## Verified By Code Inspection

### What is actually true right now

| Feature | Status | Notes |
|---|---|---|
| Welcome onboarding | ✅ | Builder-oriented starter templates/import prompts are already configured in `src/services/onboarding/config.ts` |
| Inline AI setup | ✅ | Present in `StudioAIPanel` and wired into the main studio flow |
| Cinematic export | ✅ | Current animated export path is cinematic-only in the UI |
| Sequence diagrams | ✅ | Visual node/edge types, property panels, Mermaid export, parser plugin, starter template |
| C4 architecture support | ✅ partial | Resource types, templates, lint library support exist |
| Network/infra support | ✅ partial | Network resource types, templates, provider catalogs, infra parsers exist |
| README/share viewer | ✅ | `/view` route and share modal flow exist |
| Local-first persistence | ✅ | Stored locally; no server account model required |
| Full offline cold-start | ❌ | No defensible service-worker app-shell layer yet |

### Important corrections to old assumptions

- Sequence is **not** a missing feature anymore.
- Animated export is **not** "playback/reveal first" anymore in the product UI. The product now exposes cinematic export.
- C4 and network support are **not** fully absent. They exist, but are still shallow compared with the eventual target.
- The product is stronger for technical builders than the old "broad builders" framing admitted.

---

## Competitive Read

### Where we are genuinely strong

1. **AI breadth + privacy**
We have a wider practical AI surface than most diagram tools, and we do it with a BYOK/local-first posture that is genuinely differentiated.

2. **Export portability**
PNG, SVG, PDF, Mermaid, PlantUML, JSON/OpenFlow, Figma, and cinematic animated output is an unusually strong export surface.

3. **Structured technical diagram depth**
ER, architecture, class, state, journey, mindmap, flowchart, and sequence give us a better technical-builder mix than the usual whiteboard-first tools.

4. **Local-first product story**
No account, no default server storage, portable artifacts, and private workflows are a meaningful wedge.

### Where competitors still feel stronger

1. **Activation and immediate clarity**
FigJam, Excalidraw, and even Lucidchart feel clearer in the first minute.

2. **Template breadth**
Lucidchart and draw.io win on sheer catalog volume.

3. **Visual polish**
We are better than before, but still not at the level where people immediately describe the product as premium or inevitable.

4. **Cold-start offline**
We can honestly claim local-first persistence. We should not yet over-claim full offline web-app resilience.

---

## Honest Gaps

### Gap 1 — Activation polish

Still the highest-priority product gap.

What remains:
- make the fastest builder paths even more obvious
- reduce any ambiguity between template, import, and AI-first starts
- ensure the first useful artifact happens in under 2 minutes

Why it matters:
- this directly affects Product Hunt conversion
- this directly affects Hacker News patience
- this is more important than adding breadth right now

### Gap 2 — AI setup clarity

The capability is real. The explanation can still be sharper.

What remains:
- clearer provider guidance
- clearer local-first / key storage explanation
- clearer “what to do next” immediately after a key is saved

Why it matters:
- AI is one of our biggest moats
- if setup feels unclear, the moat is invisible

### Gap 3 — Sequence completion audit

Sequence is already in the product, but it should be treated as a completion/polish project.

What remains:
- verify create/edit/export/re-import paths end to end
- ensure discovery is strong enough from app entry points
- tighten starter template and documentation support

Why it matters:
- sequence is highly searched by backend/API users
- under-claiming a real feature is better than overstating a partial one

### Gap 4 — Share/embed quality

The underlying share system exists. The output is not yet strong enough to become a distribution loop.

What remains:
- better viewer presets
- better Markdown/embed snippets
- more explicit promotion of shareable outputs

Why it matters:
- this is the bridge from “good product” to “artifacts that spread”

### Gap 5 — Template gallery depth

The system exists. The catalog is the weak point.

What remains:
- more curated technical-builder templates
- stronger naming, descriptions, and launch-quality examples
- a better “first page” of templates for common builder tasks

Why it matters:
- this improves activation
- this improves SEO/content capture
- this reduces blank-canvas friction

### Gap 6 — Offline/PWA defensibility

Current honest statement:
- local-first persistence: yes
- works without a backend for many flows: yes
- guaranteed cold-start offline web app: no

What remains:
- app-shell caching
- service-worker strategy
- removal of remaining cold-start external dependencies from the critical offline path

### Gap 7 — Performance at scale

Current work has improved structure and some export performance, but large-diagram behavior still needs direct profiling and targeted optimization.

What remains:
- large graph profiling
- path/render cost reduction
- export performance follow-up

---

## Outdated Claims Removed

These were stale and should no longer guide planning:

- "Sequence must build from scratch"
- "Cinematic reveal export needs to be invented"
- "C4/network are not started at all"
- "Playback/reveal export menu is the current product surface"

These are no longer true enough to use as roadmap anchors.

---

## Recommended Execution Order

### Next 2 Weeks

1. Activation polish
2. AI setup clarity
3. Sequence completion audit
4. Share/embed preset quality
5. Template gallery expansion

### After That

1. Offline/PWA hardening
2. Performance-at-scale work
3. Broader C4/network depth
4. Additional enterprise-oriented shape breadth

---

## What I Would Improve In This Doc Later

This version is now a much better source of truth, but it could still improve by adding:

- a stricter scoring table per pending item
- a launch-only subset versus a post-launch subset
- explicit owner/scope per item
- direct links from each roadmap bullet to the code surface that supports it

---

## Bottom Line

The product is stronger than the older roadmap implied.

The biggest remaining work is not "invent major new capability."
It is:

- finish and sharpen what already exists
- make the best features easier to discover
- make the resulting artifacts easier to share
- only then broaden further

That is a much better position than being early on fundamentals.
