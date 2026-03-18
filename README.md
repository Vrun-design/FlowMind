<div align="center">

<img src="public/favicon.svg" width="80" alt="OpenFlowKit" />

<h1>OpenFlowKit</h1>

<p><strong>The open-source, local-first diagramming tool with AI generation built in.<br/>No account. No cloud. No limits. Free forever.</strong></p>

<p>
  <a href="https://github.com/Vrun-design/openflowkit/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="MIT License" /></a>
  <a href="#testing"><img src="https://img.shields.io/badge/tests-637%20passing-brightgreen.svg" alt="Tests" /></a>
  <img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

<p>
  <a href="https://app.openflowkit.com"><strong>Open the App →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://docs.openflowkit.com">Documentation</a>
  &nbsp;·&nbsp;
  <a href="https://openflowkit.com">Website</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Vrun-design/openflowkit/issues">Report a Bug</a>
</p>

</div>

---

## What is OpenFlowKit?

OpenFlowKit is a fully open-source diagramming tool that runs **entirely in your browser**. It combines a fast, professional canvas with AI generation so you can go from a plain-English description to a structured, editable diagram in seconds.

There's no account to create, no server storing your work, and no feature gated behind a paywall — ever. Your diagrams live in browser local storage and stay there unless you explicitly export or share them.

```
You: "Draw a microservices architecture with an API gateway, auth service,
      product service, and Postgres database"

OpenFlowKit: *builds it*
```

---

## Why OpenFlowKit?

| | OpenFlowKit | Lucidchart / Miro | draw.io |
|---|---|---|---|
| Open source | ✅ MIT | ❌ | ✅ |
| AI generation | ✅ Built-in | 💰 Paid tier | ❌ |
| Local-first | ✅ Zero cloud | ❌ Cloud only | ⚠️ Partial |
| No account needed | ✅ | ❌ | ✅ |
| Bring your own API key | ✅ | ❌ | ❌ |
| OpenFlow DSL (code as diagram) | ✅ | ❌ | ❌ |
| Playback & history export | ✅ | ❌ | ❌ |
| Free forever | ✅ | ❌ Freemium | ✅ |

---

## Features

### 🤖 AI Generation
Describe what you want in plain English. OpenFlowKit calls the AI with your own API key and builds a fully editable diagram. No middleman, no usage fees, no data sent to our servers.

Supports **Gemini** and **OpenAI-compatible** endpoints. Works with any locally-run model behind a compatible API.

### 📝 OpenFlow DSL
Every diagram is round-trippable code. The OpenFlow DSL is a human-readable, git-friendly format — paste code in, get a diagram; export a diagram, get code. Ideal for version-controlled documentation.

```
flow: "Payment Processing"
direction: LR

node checkout [label: "Checkout"]
node gateway [label: "Payment Gateway", shape: diamond]
node success [label: "Success", shape: capsule]
node failure [label: "Retry", shape: capsule]

checkout -> gateway
gateway -> success [label: "Approved"]
gateway -> failure [label: "Declined"]
```

### ⚡ Smart Layout
One-click auto-arrange with **ELK.js** — the same layout engine used by Eclipse and VS Code's diagram extensions. Hierarchical, layered, force-directed, and radial modes for any graph shape.

### 🎬 Playback & History
Every edit is recorded. Scrub through your diagram's full edit history visually. Export the playback as an **animated GIF** or PNG sequence — useful for walkthroughs, onboarding docs, and architecture reviews.

### 🗂️ Templates
20 curated starter templates so you're never staring at a blank canvas:

| Category | Templates |
|---|---|
| Workflows | Generic flowchart, operational runbook, decision tree |
| Cloud Architecture | AWS 3-tier, Azure landing zone, CNCF platform, Kubernetes cluster |
| Planning | Mind map, user journey, affinity map, roadmap |
| Wireframes | Mobile screen, browser app, component hierarchy |

### 🎨 Shape & Icon Library
- **Core shapes** — rectangles, rounded rects, capsules, circles, diamonds, hexagons, cylinders, parallelograms, and more
- **Specialised nodes** — process, decision, start/end, annotation, text block, section, image, browser frame, mobile frame, architecture icon node
- **AWS** — full SVG icon pack with provider categories
- **Azure** — Microsoft architecture SVG pack
- **CNCF** — cloud-native artwork pack
- **Lucide** — 1,000+ general-purpose icons

### 📤 Export Formats
**SVG** · **PNG** · **JPG** · **Mermaid** · **OpenFlow DSL** · **JSON** · **Figma paste**

### 🔗 Collaboration
Browser-based peer-to-peer collaboration via WebRTC room links. No server, no accounts, no persistence — just share a link and work together live.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| UI framework | React 19 + TypeScript 5 | React Compiler for automatic memoisation |
| Canvas | React Flow / XYFlow 12 | Best-in-class graph canvas |
| Layout engine | ELK.js | Professional-grade auto-layout |
| State | Zustand 5 | Lightweight, per-slice architecture |
| Styling | Tailwind CSS 4 | Utility-first, zero runtime CSS |
| Animation | Framer Motion | Canvas transitions and playback |
| Build | Vite 6 | Fast HMR, optimised chunking |
| Tests | Vitest 4 + Testing Library | 637 tests, fast parallelised runs |
| Docs | Astro + Starlight | Static, multilingual (EN + TR) |
| Hosting | Cloudflare Pages | Free tier, global CDN, 3 separate projects |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run locally

```bash
git clone https://github.com/Vrun-design/openflowkit.git
cd openflowkit
npm install
npm run dev        # → http://localhost:5173
```

To use AI generation, open **Settings → AI** in the app and add your Gemini or OpenAI API key. It's stored locally in your browser — never sent to us.

### Build for production

```bash
npm run build          # compile + bundle
npm run bundle:check   # verify bundle size budgets
```

### Run the docs site locally

```bash
npm run dev --workspace=docs-site    # → http://localhost:4321
```

### Run the landing page locally

```bash
npm run dev --workspace=web          # → http://localhost:4320
```

---

## Testing

```bash
npm test -- --run          # full suite
```

Focused suites for faster iteration:

```bash
npm run test:s0            # store, history, canvas core types
npm run test:s10-state     # state management and persistence
npm run test:s10-canvas    # canvas interaction logic
npm run test:s4-handle-safety  # edge handle safety rules
```

TypeScript and lint:

```bash
npx tsc --noEmit           # type check
npx eslint src             # lint
```

---

## Project Structure

```
src/
  components/
    command-bar/      Command palette — Assets, Templates, Design, Code, AI views
    flow-canvas/      Canvas orchestration, node/edge renderers, overlays
    home/             Dashboard, settings, welcome surfaces
    properties/       Node, edge, and canvas side panels
    top-nav/          Nav bar — export, share, history, collaboration
  config/             Rollout flags (feature gating)
  hooks/              Editor hooks — clipboard, history, playback, interaction
  lib/                Shared types, OpenFlow DSL parser, utilities
  services/
    collaboration/    WebRTC room links and sync transport
    shapeLibrary/     Provider icon catalog, lazy SVG loading
    templateLibrary/  Starter template registry
    playback/         Playback model, step generation, GIF export
  store/              Zustand store — slices, defaults, persistence

docs-site/            Astro + Starlight documentation (EN + TR)
web/                  Astro marketing landing page
assets/
  third-party-icons/  AWS, Azure, CNCF SVG packs + source metadata
scripts/
  shape-pack/         Icon pack intake and validation tooling
```

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for deep-dives on:
- Store slice design and per-slice hook pattern
- History V2 (per-tab `past/future` arrays, no global snapshot)
- ELK singleton and layout pipeline
- Export pipeline and bundle chunking strategy
- Rollout flag system for safe feature gating

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions and code guidelines.

**The two rules that matter most:**

1. **Never rename storage keys.** `openflowkit-storage`, `flowmind-clipboard`, `flowmind_snapshots` — changing these silently wipes existing user data.
2. **New features go behind a rollout flag.** Add an entry to `src/config/rolloutFlags.ts` and gate the code path. Flip the default to `true` in a separate PR once validated.

Before opening a PR: `tsc --noEmit` and `eslint` must be clean, and all 637 tests must pass.

---

## Deployment

Three independent Cloudflare Pages projects, one repo:

| Project | URL | Build command | Output |
|---|---|---|---|
| App | `app.openflowkit.com` | `npm run build` | `dist/` |
| Docs | `docs.openflowkit.com` | `npm run build --workspace=docs-site` | `docs-site/dist/` |
| Landing | `openflowkit.com` | `npm run build --workspace=web` | `web/dist/` |

Full setup guide: [docs/cloudflare-pages-setup.md](docs/cloudflare-pages-setup.md)

---

## Asset Licensing

OpenFlowKit ships with third-party SVG icon packs under their own licenses. Check `SOURCE.md` before redistributing.

| Pack | License info |
|---|---|
| AWS | [assets/third-party-icons/aws/SOURCE.md](assets/third-party-icons/aws/SOURCE.md) |
| Azure | [assets/third-party-icons/azure/SOURCE.md](assets/third-party-icons/azure/SOURCE.md) |
| CNCF | [assets/third-party-icons/cncf/SOURCE.md](assets/third-party-icons/cncf/SOURCE.md) |
| GCP | Redistribution not yet cleared — intake gated |

OpenFlowKit's own source code is **MIT licensed**.

---

<div align="center">

**[openflowkit.com](https://openflowkit.com) · [app.openflowkit.com](https://app.openflowkit.com) · [docs.openflowkit.com](https://docs.openflowkit.com)**

Made with ☕ · MIT License

If OpenFlowKit is useful to you, a ⭐ on GitHub goes a long way.

</div>
