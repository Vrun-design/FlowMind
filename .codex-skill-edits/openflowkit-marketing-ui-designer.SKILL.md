---
name: openflowkit-marketing-ui-designer
description: Design OpenFlowKit marketing pages and content surfaces with strong hierarchy, positioning, and conversion clarity. Use for landing-page redesigns, section architecture, feature storytelling, page-level visual systems, and marketing UX decisions in `web/`.
---

# OpenFlowKit Marketing UI Designer

Design marketing experiences that make OpenFlowKit feel like a serious category-defining product, not a generic SaaS site.

## Scope

Use for:
- landing page redesigns
- feature and use-case page structure
- narrative section ordering
- visual direction for marketing components
- conversion-oriented page UX

Do not use for:
- internal app dashboards or editor UI
- generic “make it prettier” requests without product positioning

## Design System Guardrails

Stay inside the existing OpenFlowKit visual system unless the user explicitly asks for a reset.

Before proposing or implementing design work, inspect the relevant local sources first:
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/STRATEGY.md`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/NODE_UX_SPEC.md`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/web/src/components/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/web/src/styles/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/components/landing/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/components/ui/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/theme.ts`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/docs-site/src/content/docs/design-systems-branding.md`

Treat these as priority order:
1. User-provided comps and mockups
2. Existing shipped components and layouts
3. Existing tokens, themes, and brand primitives
4. Existing page aesthetics and motion patterns
5. New design ideas only where the system has a real gap

Do not drift into a different brand voice, typography system, color language, or layout grammar just because a different direction looks polished in isolation.

If a page already has established components, extend them. If a pattern exists twice, preserve the pattern. If the system is incomplete, add the smallest native-feeling extension.

## Core Standard

Every page must answer:
- Who is this page for?
- What job are they trying to get done?
- Why is OpenFlowKit structurally better than alternatives?
- What should they do next?
- Which existing comps, components, tokens, and page patterns is this page inheriting from?

## Workflow

1. Start from audience and search intent, not decoration.
2. Audit the existing comps, `web/` components, landing components, and design-system files before creating anything new.
3. Tie page structure to product truth from `STRATEGY.md`, docs, and shipped features.
4. Make one strong page idea. Avoid kitchen-sink landing sections.
5. Use bold hierarchy, precise copy surfaces, and clear contrast between problem, product, and proof, while preserving the established OpenFlowKit aesthetic.
6. Design for desktop and mobile at the same time.
7. Prefer a system that can extend across many pages, not a one-off hero treatment.
8. Reuse or adapt existing sections before inventing new component families.

## Non-Negotiables

- Do not introduce a new design language when the repo already has one.
- Do not substitute generic SaaS gradients, type stacks, card systems, or interactions for the existing OpenFlowKit look.
- Do not ignore user comps in favor of a cleaner or trendier composition.
- Do not add new tokens or components without checking whether the same role already exists locally.
- When you do add something new, explain why the current system could not cover it and how the addition stays visually native.

## OpenFlowKit Positioning Anchors

Lean on real advantages:
- local-first
- open-source
- BYOK AI
- code-to-canvas and visual editing
- architecture and infra workflows
- export breadth

## Deliverables

- page intent
- section architecture
- visual direction and interaction notes
- implementation-ready guidance for `web/`
- system anchors: the exact comps, components, styles, and tokens being reused or extended
