<div align="center">

<img src="public/brand-icon.svg" width="72" alt="OpenFlowKit" />

# OpenFlowKit

**Local-first AI diagramming. No account. No cloud. No limits.**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-637%20passing-brightgreen.svg)](#development)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

[**Open the App →**](https://app.openflowkit.com) · [**Docs**](https://docs.openflowkit.com) · [**Report a Bug**](https://github.com/Vrun-design/openflowkit/issues)

</div>

---

## What is OpenFlowKit?

OpenFlowKit is an open-source diagramming tool that runs entirely in your browser. Describe what you need in plain English and the AI builds it for you — flowcharts, architecture diagrams, sequence diagrams, mind maps, and more. Everything stays on your device.

- **No signup.** Open the app and start diagramming.
- **No cloud storage.** Your diagrams live in browser local storage, not on our servers.
- **No API fees.** Bring your own Gemini or OpenAI key — we're just the UI.
- **No paywalls.** Every feature is free, forever.

---

## Features

### AI Generation
Describe a diagram in plain English and OpenFlowKit builds it. The AI understands your intent and produces structured, editable output — not a static image.

### OpenFlow DSL
Write diagrams as code with the OpenFlow DSL — a human-readable, git-friendly format designed for round-tripping. Edit in the canvas, export as code, commit it, open it again later.

### Smart Layout
One-click auto-arrange with ELK-powered layout. Choose between hierarchical, layered, force-directed, and radial layouts for complex graphs.

### Playback & History
Step through every edit with visual playback. Export your diagram's edit history as an animated GIF or PNG sequence — great for communicating your thinking.

### Rich Node & Shape Library
- Core shapes: rectangles, rounded rects, capsules, circles, diamonds, hexagons, cylinders, parallelograms
- Specialised nodes: process, decision, start/end, annotation, text, section, image, browser/mobile wireframe, architecture icon
- AWS, Azure, and CNCF SVG icon packs built-in
- Lucide icon catalog for general-purpose diagrams

### Templates
20 curated starter templates across:
- Generic workflows and operational runbooks
- AWS & Azure architecture patterns
- CNCF / Kubernetes platform diagrams
- Mind maps and planning boards
- User journey and wireframe starters

### Export Everywhere
SVG · PNG · JPG · Mermaid · OpenFlow DSL · JSON · Figma paste

### Collaboration
Browser-based live collaboration rooms — no backend required, no data stored server-side.

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript 5, Tailwind CSS 4 |
| Canvas | React Flow / XYFlow 12 |
| Layout | ELK.js |
| State | Zustand 5 |
| Animation | Framer Motion |
| Build | Vite 6 |
| Tests | Vitest 4, Testing Library |
| Docs | Astro + Starlight |
| Hosting | Cloudflare Pages |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
git clone https://github.com/Vrun-design/openflowkit.git
cd openflowkit
npm install
npm run dev        # app at http://localhost:5173
```

### Build

```bash
npm run build          # production build
npm run bundle:check   # verify bundle size budgets
```

### Test

```bash
npm test -- --run      # full suite (637 tests)
```

Focused suites:

```bash
npm run test:s0               # store + canvas core
npm run test:s10-state        # state management
npm run test:s10-canvas       # canvas interactions
npm run test:s4-handle-safety # edge handle safety
```

---

## Project Structure

```
src/
  components/
    command-bar/     Command palette — Assets, Templates, Design, Code views
    flow-canvas/     Canvas orchestration, overlays, interaction handlers
    home/            Dashboard, settings surfaces
    properties/      Node, edge, and canvas side panels
    top-nav/         Nav bar — export, share, collaboration actions
  config/            Rollout flags
  hooks/             Editor hooks and interaction logic
  lib/               Shared types, DSL parser, utilities
  services/
    collaboration/   Room links and WebRTC/WebSocket sync
    shapeLibrary/    Provider icon catalog and lazy loading
    templateLibrary/ Starter template registry
    playback/        Playback model and step generation
  store/             Zustand store, slices, persistence

docs-site/           Starlight documentation site
web/                 Astro marketing landing page
assets/
  third-party-icons/ AWS, Azure, CNCF SVG icon packs
scripts/
  shape-pack/        Icon pack intake and validation tooling
```

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed breakdown of the store slice design, history V2 model, ELK layout integration, export pipeline, and rollout flag system.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, code guidelines, and the rollout flag pattern.

Key things to know:
- **Storage keys are sacred.** Never rename `openflowkit-storage`, `flowmind-clipboard`, or `flowmind_snapshots` — silent data loss for existing users.
- **Rollout flags gate experimental features.** New features go behind a flag in `src/config/rolloutFlags.ts` before being enabled globally.
- **TypeScript strict, ESLint clean.** `tsc --noEmit` and `eslint` must pass before merging.

---

## Deployment

OpenFlowKit uses a monorepo with three independent Cloudflare Pages projects:

| Project | Build command | Output |
|---|---|---|
| App | `npm run build` | `dist/` |
| Docs | `npm run build --workspace=docs-site` | `docs-site/dist/` |
| Landing | `npm run build --workspace=web` | `web/dist/` |

See [docs/cloudflare-pages-setup.md](docs/cloudflare-pages-setup.md) for full setup instructions.

---

## Asset Licensing

OpenFlowKit ships with third-party SVG icon packs. Each pack has its own license — check the `SOURCE.md` inside `assets/third-party-icons/<provider>/` before redistributing.

- **AWS** — [assets/third-party-icons/aws/SOURCE.md](assets/third-party-icons/aws/SOURCE.md)
- **Azure** — [assets/third-party-icons/azure/SOURCE.md](assets/third-party-icons/azure/SOURCE.md)
- **CNCF** — [assets/third-party-icons/cncf/SOURCE.md](assets/third-party-icons/cncf/SOURCE.md)
- **GCP** — redistribution not yet cleared; intake is gated

OpenFlowKit's own source code is MIT licensed.

---

<div align="center">

Made with ☕ · MIT License · [openflowkit.com](https://openflowkit.com)

</div>
