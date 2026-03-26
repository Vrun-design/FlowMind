# OpenFlowKit Architecture Guide

This document is a current high-level map of the codebase. It is intentionally narrower than a full design spec and should stay aligned with the implementation in `src/`.

---

## Overview

OpenFlowKit is a local-first diagram editor built with:

- React 19
- TypeScript 5
- React Flow / XYFlow
- Zustand
- ELK.js

The main application lives in `src/`. Additional repo surfaces include:

- `docs-site/` for canonical public docs content and site generation
- `docs/` for repo-only notes and operational markdown
- `web/` for the marketing site

Main app shape:

```text
src/
  app/                Route state helpers
  components/         UI surfaces and editor shells
  config/             Rollout flags and provider config
  context/            React context providers
  diagram-types/      Diagram family plugins and property panel registration
  hooks/              Feature and editor hooks
  i18n/               Localization
  lib/                Shared types, parsers, compat helpers, utilities
  services/           Domain services
  store/              Zustand state, actions, defaults, persistence
```

Route composition is currently centered in `src/App.tsx`, not in a dedicated `pages/` directory.

---

## Runtime Surfaces

The repository contains three main product/runtime surfaces:

### 1. Main App

The browser editor and related in-app experiences.

Key areas:

- `src/App.tsx`
- `src/components/FlowEditor.tsx`
- `src/components/home/*`

### 2. Docs Site

The public docs site built with Astro/Starlight.

Key area:

- `docs-site/`

### 3. Marketing Site

The public landing/marketing site.

Key area:

- `web/`

---

## State Management

The app uses a single Zustand store assembled in `src/store.ts`.

The store is composed from action factories and supported by selective hook files in `src/store/`.

Current store-facing hook files include:

- `canvasHooks.ts`
- `tabHooks.ts`
- `historyHooks.ts`
- `designSystemHooks.ts`
- `viewHooks.ts`
- `selectionHooks.ts`

Supporting files:

- `defaults.ts`
- `types.ts`
- `persistence.ts`
- `aiSettings.ts`

There is no current top-level `brandHooks.ts` slice in `src/store/`.

---

## Persistence

Persistence is coordinated through:

- `src/store/persistence.ts`
- `src/services/storage/flowPersistStorage.ts`
- `src/services/storage/indexedDbStateStorage.ts`

Current behavior at a high level:

- document/tab state is persisted through Zustand persistence
- IndexedDB-backed storage is used where available
- localStorage remains part of the compatibility and fallback story
- persisted nodes/edges are sanitized before storage
- ephemeral UI fields are excluded from persisted state

Important constraint:

- persisted storage keys should not be renamed without a migration path

---

## Editor Composition

The editor now follows a clearer four-layer composition path:

1. `src/components/FlowEditor.tsx`
   render shell only
2. `src/components/flow-editor/useFlowEditorScreenModel.ts`
   screen-level composition of store state, domain hooks, and refs
3. `src/components/flow-editor/buildFlowEditorScreenControllerParams.ts`
   pure assembly of controller config from screen-model state
4. `src/components/flow-editor/useFlowEditorController.ts`
   adaptation into shell, studio, panel, and chrome controller surfaces

Key editor concerns composed through that path include:

- tabs and active document selection
- node and edge operations
- history and snapshots
- AI generation
- export/import
- playback
- collaboration
- command bar and studio mode surfaces
- selection and keyboard bindings

This is still the main integration hotspot in the architecture, but it is now bounded more explicitly:

- `FlowEditor.tsx` should stay render-only
- `useFlowEditorScreenModel.ts` should gather state and domain hooks, not render UI
- `buildFlowEditorScreenControllerParams.ts` should stay pure and only map grouped screen state into controller input
- `useFlowEditorController.ts` should adapt grouped inputs into UI-facing shell/panel/chrome props

If future work bypasses those boundaries, editor maintainability will regress quickly.

---

## Domain Hooks

The app uses hooks to compose store state and service logic into editor-facing behaviors.

Examples:

- `useFlowHistory`
- `useFlowOperations`
- `useAIGeneration`
- `useFlowExport`
- `usePlayback`
- `useFlowEditorCollaboration`
- `useFlowEditorActions`
- `useFlowEditorCallbacks`

The architecture intent is:

- services own domain logic
- hooks compose state and side effects
- components render and delegate

---

## Services

`src/services/` contains most of the domain-heavy logic.

Notable service areas:

- `ai/`
- `architectureLint/`
- `collaboration/`
- `diagramDiff/`
- `export/`
- `figma/`
- `infraSync/`
- `mermaid/`
- `playback/`
- `shapeLibrary/`
- `storage/`
- `templateLibrary/`

This is one of the stronger structural parts of the codebase: a significant amount of non-UI logic lives outside React components.

---

## Diagram Families

Built-in diagram families and property panel registration live under:

- `src/diagram-types/`

Examples include:

- architecture
- class diagram
- ER diagram
- journey
- mindmap
- state diagram

These plugins and registrations allow the app to support multiple structured diagram behaviors without collapsing all logic into the base canvas layer.

---

## Docs Surfaces

The repo currently has two documentation buckets:

### Public docs

- canonical content and runtime in `docs-site/`

### Repo-only notes

- operational and setup markdown in `docs/`

---

## Collaboration

Collaboration currently lives under:

- `src/hooks/useFlowEditorCollaboration.ts`
- `src/services/collaboration/*`

Current implementation notes:

- realtime transport is built around peer-oriented collaboration
- the current stack includes WebRTC-style transport concerns and signaling configuration
- fallback behavior exists for unsupported environments

This area is functional but still evolving and should be treated as active infrastructure rather than fully settled architecture.

---

## Export Pipeline

Export logic is primarily coordinated through:

- `src/hooks/useFlowExport.ts`
- `src/services/export/*`

Current formats and related capabilities include:

- raster image export
- SVG export
- JSON export
- Mermaid export
- OpenFlow DSL export
- animated export / playback-related export

---

## Testing

Testing is split across:

- Vitest unit and component tests in `src/`
- Playwright end-to-end tests in `e2e/`

Useful commands:

```bash
npm run lint
npm test -- --run
npm run e2e:ci
```

For current repo-health status and phased remediation, see `AUDIT_FIX_LOG.md`.
