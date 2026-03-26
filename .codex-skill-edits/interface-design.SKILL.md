---
name: interface-design
description: Design product interfaces (dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces). Do not use for marketing design such as landing pages, marketing sites, or campaigns.
---

# Interface Design

Build interface design with craft and consistency.

## Scope

Use for: Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces.

Not for: Landing pages, marketing sites, campaigns. Redirect those to `/frontend-design`.

## System First

When working inside an existing product or codebase, do not invent a new visual language.

Treat these as the source of truth, in this order:
- the user's comps and mockups
- the shipped UI kit and shared components
- the existing design-system tokens, themes, and brand primitives
- written product UX specs and aesthetic guidance

For this workspace, inspect the relevant local sources before proposing or building:
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/NODE_UX_SPEC.md`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/theme.ts`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/store/designSystemHooks.ts`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/components/ui/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/src/components/`
- `/Users/varun/Desktop/Dev_projects/flowmind-ai/docs-site/src/content/docs/design-systems-branding.md`

If the repo already contains a component, token, spacing pattern, radius scale, interaction style, or layout treatment that solves the problem, reuse it or extend it. Do not replace it with a new style system unless the user explicitly asks for a redesign.

If comps exist, match them closely. Do not "improve" them by drifting into a cleaner, trendier, or more generic AI-generated style.

If the existing system is incomplete, fill the gap with the smallest possible extension that still looks native to the rest of the product.

Explicitly avoid:
- introducing new typography, colors, radii, shadows, motion, or component patterns that are not already supported by the product aesthetic
- mixing unrelated aesthetics across screens
- replacing established patterns with generic dashboard defaults
- treating design exploration as permission to ignore the existing system

## The Problem

You will generate generic output. Your training has seen thousands of dashboards. The patterns are strong.

You can follow the entire process below, explore the domain, name a signature, state your intent, and still produce a template. Warm colors on cold structures. Friendly fonts on generic layouts. Kitchen feel that looks like every other app.

This happens because intent lives in prose, but code generation pulls from patterns. The gap between them is where defaults win.

The process below helps. But process alone does not guarantee craft. You have to catch yourself.

## Where Defaults Hide

Defaults do not announce themselves. They disguise themselves as infrastructure, the parts that feel like they just need to work, not be designed.

Typography feels like a container. Pick something readable, move on. But typography is not holding your design, it is your design. The weight of a headline, the personality of a label, the texture of a paragraph. These shape how the product feels before anyone reads a word. A bakery management tool and a trading terminal might both need clean, readable type, but the type that is warm and handmade is not the type that is cold and precise. If you are reaching for your usual font, you are not designing.

Navigation feels like scaffolding. Build the sidebar, add the links, get to the real work. But navigation is not around your product, it is your product. Where you are, where you can go, what matters most. A page floating in space is a component demo, not software. The navigation teaches people how to think about the space they are in.

Data feels like presentation. You have numbers, show numbers. But a number on screen is not design. The question is: what does this number mean to the person looking at it? What will they do with it? A progress ring and a stacked label both show 3 of 10, one tells a story, one fills space. If you are reaching for number on label, you are not designing.

Token names feel like implementation detail. But your CSS variables are design decisions. `--ink` and `--parchment` evoke a world. `--gray-700` and `--surface-2` evoke a template. Someone reading only your tokens should be able to guess what product this is.

The trap is thinking some decisions are creative and others are structural. There are no structural decisions. Everything is design. The moment you stop asking why this is the moment defaults take over.

## Intent First

Before touching code, answer these. Not in your head, out loud to yourself or the user.

Who is this human?
Not users. The actual person. Where are they when they open this? What is on their mind? What did they do 5 minutes ago, what will they do 5 minutes after? A teacher at 7am with coffee is not a developer debugging at midnight is not a founder between investor meetings. Their world shapes the interface.

What must they accomplish?
Not use the dashboard. The verb. Grade these submissions. Find the broken deployment. Approve the payment. The answer determines what leads, what follows, what hides.

What should this feel like?
Say it in words that mean something. Clean and modern means nothing. Warm like a notebook? Cold like a terminal? Dense like a trading floor? Calm like a reading app? The answer shapes color, type, spacing, density, everything.

If you are working inside an existing system, answer these in terms of the current product language first. What already exists that this work must align to? What comps, tokens, and components already define the answer?

If you cannot answer these with specifics, stop. Ask the user. Do not guess. Do not default.

## Every Choice Must Be A Choice

For every decision, you must be able to explain why.

- Why this layout and not another?
- Why this color temperature?
- Why this typeface?
- Why this spacing scale?
- Why this information hierarchy?

If your answer is it is common or it is clean or it works, you have not chosen. You have defaulted. Defaults are invisible. Invisible choices compound into generic output.

The test: If you swapped your choices for the most common alternatives and the design did not feel meaningfully different, you never made real choices.

## Sameness Is Failure

If another AI, given a similar prompt, would produce substantially the same output, you have failed.

This is not about being different for its own sake. It is about the interface emerging from the specific problem, the specific user, the specific context. When you design from intent, sameness becomes impossible because no two intents are identical.

When you design from defaults, everything looks the same because defaults are shared.

## Intent Must Be Systemic

Saying warm and using cold colors is not following through. Intent is not a label, it is a constraint that shapes every decision.

If the intent is warm: surfaces, text, borders, accents, semantic colors, typography, all warm. If the intent is dense: spacing, type size, information architecture, all dense. If the intent is calm: motion, contrast, color saturation, all calm.

Check your output against your stated intent. Does every token reinforce it? Or did you state an intent and then default anyway?

## Product Domain Exploration

This is where defaults get caught, or do not.

Generic output: Task type to visual template to theme.
Crafted output: Task type to product domain to signature to structure plus expression.

The difference: time in the product world before any visual or structural thinking.

## Required Outputs

Do not propose any direction until you produce all four:

Domain: Concepts, metaphors, vocabulary from this product world. Not features, territory. Minimum 5.

Color world: What colors exist naturally in this product domain? Not warm or cool, go to the actual world. If this product were a physical space, what would you see? What colors belong there that do not belong elsewhere? List 5 plus.

Signature: One element, visual, structural, or interaction, that could only exist for this product. If you cannot name one, keep exploring.

Defaults: 3 obvious choices for this interface type, visual and structural. You cannot avoid patterns you have not named.

When the project already has comps or a shipped system, add a fifth required output:

System anchors: the exact local files, components, tokens, and existing patterns this design must inherit from.

## Proposal Requirements

Your direction must explicitly reference:
- Domain concepts you explored
- Colors from your color world exploration
- Your signature element
- What replaces each default
- The existing system anchors you are preserving

If you are designing inside an existing product, your proposal must explain how it stays inside the current comps, UI kit, design system, and aesthetic. Novelty is not the goal. Coherence is.

The test: Read your proposal. Remove the product name. Could someone identify what this is for? If not, it is generic. Explore deeper.

## The Mandate

Before showing the user, look at what you made.

Ask yourself: If they said this lacks craft, what would they mean?

That thing you just thought of, fix it first.

## The Checks

Run these against your output before presenting:

- The swap test: If you swapped the typeface for your usual one, would anyone notice? If you swapped the layout for a standard dashboard template, would it feel different? The places where swapping would not matter are the places you defaulted.
- The squint test: Blur your eyes. Can you still perceive hierarchy? Is anything jumping out harshly? Craft whispers.
- The signature test: Can you point to five specific elements where your signature appears? Not the overall feel, actual components. A signature you cannot locate does not exist.
- The token test: Read your CSS variables out loud. Do they sound like they belong to this product world, or could they belong to any project?

If any check fails, iterate before showing.

## Craft Foundations

### Subtle Layering

This is the backbone of craft. Regardless of direction, product type, or visual style, this principle applies to everything. You should barely notice the system working. When you look at Vercel's dashboard, you do not think nice borders. You just understand the structure. The craft is invisible, that is how you know it is working.

#### Surface Elevation

Surfaces stack. A dropdown sits above a card which sits above the page. Build a numbered system, base, then increasing elevation levels. In dark mode, higher elevation is slightly lighter. In light mode, higher elevation is slightly lighter or uses shadow.

Each jump should be only a few percentage points of lightness. You can barely see the difference in isolation. But when surfaces stack, the hierarchy emerges. Whisper quiet shifts that you feel rather than see.

Key decisions:
- Sidebars: Same background as canvas, not different. Different colors fragment the visual space into sidebar world and content world. A subtle border is enough separation.
- Dropdowns: One level above their parent surface. If both share the same level, the dropdown blends into the card and layering is lost.
- Inputs: Slightly darker than their surroundings, not lighter. Inputs are inset, they receive content. A darker background signals type here without heavy borders.

#### Borders

Borders should disappear when you are not looking for them, but be findable when you need structure. Low opacity rgba blends with the background, it defines edges without demanding attention. Solid hex borders look harsh in comparison.

Build a progression, not all borders are equal. Standard borders, softer separation, emphasis borders, maximum emphasis for focus rings. Match intensity to the importance of the boundary.

The squint test: Blur your eyes at the interface. You should still perceive hierarchy, what is above what, where sections divide. But nothing should jump out. No harsh lines. No jarring color shifts. Just quiet structure.

This separates professional interfaces from amateur ones. Get this wrong and nothing else matters.

### Infinite Expression

Every pattern has infinite expressions. No interface should look the same.

A metric display could be a hero number, inline stat, sparkline, gauge, progress bar, comparison delta, trend badge, or something new. A dashboard could emphasize density, whitespace, hierarchy, or flow in completely different ways. Even sidebar plus cards has infinite variations in proportion, spacing, and emphasis.

Before building, ask:
- What is the one thing users do most here?
- What products solve similar problems brilliantly? Study them.
- Why would this interface feel designed for its purpose, not templated?

Never produce identical output. Same sidebar width, same card grid, same metric boxes with icon left number big label small every time, this signals AI generated immediately. It is forgettable.

The architecture and components should emerge from the task and data, executed in a way that feels fresh. Linear's cards do not look like Notion's. Vercel's metrics do not look like Stripe's. Same concepts, infinite expressions.

### Color Lives Somewhere

Every product exists in a world. That world has colors.

Before you reach for a palette, spend time in the product world. What would you see if you walked into the physical version of this space? What materials? What light? What objects?

Your palette should feel like it came from somewhere, not like it was applied to something.

Beyond warm and cold: Temperature is one axis. Is this quiet or loud? Dense or spacious? Serious or playful? Geometric or organic? A trading terminal and a meditation app are both focused, completely different kinds of focus. Find the specific quality, not the generic label.

Color carries meaning: Gray builds structure. Color communicates, status, action, emphasis, identity. Unmotivated color is noise. One accent color, used with intention, beats five colors used without thought.

## Before Writing Each Component

Every time you write UI code, even small additions, state:

```
Intent: [who is this human, what must they do, how should it feel]
Palette: [colors from your exploration and why they fit this product world]
Depth: [borders, shadows, layered, and why this fits the intent]
Surfaces: [your elevation scale and why this color temperature]
Typography: [your typeface and why it fits the intent]
Spacing: [your base unit]
System anchors: [which comps, tokens, shared components, and existing patterns this component must match]
```

This checkpoint is mandatory. It forces you to connect every technical choice back to intent.

If you cannot explain why for each choice, you are defaulting. Stop and think.

If you are inside an existing product, "why" should usually be "because this already exists in the system and this work should extend it consistently," not "because this would be interesting."

## Design Principles

### Token Architecture

Every color in your interface should trace back to a small set of primitives: foreground (text hierarchy), background (surface elevation), border (separation hierarchy), brand, and semantic (destructive, warning, success). No random hex values, everything maps to primitives.

#### Text Hierarchy

Do not just have text and gray text. Build four levels, primary, secondary, tertiary, muted. Each serves a different role: default text, supporting text, metadata, and disabled or placeholder. Use all four consistently. If you are only using two, your hierarchy is too flat.

#### Border Progression

Borders are not binary. Build a scale that matches intensity to importance, standard separation, softer separation, emphasis, maximum emphasis. Not every boundary deserves the same weight.

#### Control Tokens

Form controls have specific needs. Do not reuse surface tokens. Create dedicated ones for control backgrounds, control borders, and focus states. This lets you tune interactive elements independently from layout surfaces.

### Spacing

Pick a base unit and stick to multiples. Build a scale for different contexts, micro spacing for icon gaps, component spacing within buttons and cards, section spacing between groups, major separation between distinct areas. Random values signal no system.

### Padding

Keep it symmetrical. If one side has a value, others should match unless content naturally requires asymmetry.

### Depth

Choose one approach and commit:
- Borders only, clean, technical, for dense tools.
- Subtle shadows, soft lift, for approachable products.
- Layered shadows, premium, dimensional, for cards that need presence.
- Surface color shifts, background tints establish hierarchy without shadows.

Do not mix approaches.

### Border Radius

Sharper feels technical. Rounder feels friendly. Build a scale, small for inputs and buttons, medium for cards, large for modals. Do not mix sharp and soft randomly.

### Typography

Build distinct levels distinguishable at a glance. Headlines need weight and tight tracking for presence. Body needs comfortable weight for readability. Labels need medium weight that works at smaller sizes. Data needs monospace with tabular number spacing for alignment. Do not rely on size alone, combine size, weight, and letter spacing.

### Card Layouts

A metric card does not have to look like a plan card does not have to look like a settings card. Design each card internal structure for its specific content, but keep the surface treatment consistent: same border weight, shadow depth, corner radius, padding scale.

### Controls

Native select and input type date render OS native elements that cannot be styled. Build custom components, trigger buttons with positioned dropdowns, calendar popovers, styled state management.

### Iconography

Icons clarify, not decorate. If removing an icon loses no meaning, remove it. Choose one icon set and stick with it. Give standalone icons presence with subtle background containers.

### Animation

Fast micro interactions, smooth easing. Larger transitions can be slightly longer. Use deceleration easing. Avoid spring or bounce in professional interfaces.

### States

Every interactive element needs states: default, hover, active, focus, disabled. Data needs states too: loading, empty, error. Missing states feel broken.

### Navigation Context

Screens need grounding. A data table floating in space feels like a component demo, not a product. Include navigation showing where you are in the app, location indicators, and user context. When building sidebars, consider same background as main content with border separation rather than different colors.

### Dark Mode

Dark interfaces have different needs. Shadows are less visible on dark backgrounds, lean on borders for definition. Semantic colors (success, warning, error) often need slight desaturation. The hierarchy system still applies, just with inverted values.

## Avoid

- Harsh borders, if borders are the first thing you see, they are too strong.
- Dramatic surface jumps, elevation changes should be whisper quiet.
- Inconsistent spacing, the clearest sign of no system.
- Mixed depth strategies, pick one approach and commit.
- Missing interaction states, hover, focus, disabled, loading, error.
- Dramatic drop shadows, shadows should be subtle, not attention grabbing.
- Large radius on small elements.
- Pure white cards on colored backgrounds.
- Thick decorative borders.
- Gradients and color for decoration, color should mean something.
- Multiple accent colors, dilutes focus.
- Different hues for different surfaces, keep the same hue, shift only lightness.

## Workflow

### Communication

Be invisible. Do not announce modes or narrate process.

Never say: I am in ESTABLISH MODE, Let me check system.md...

Instead: Jump into work. State suggestions with reasoning.

### Suggest and Ask

Lead with your exploration and recommendation, then confirm:

```
Domain: [5 plus concepts from the product world]
Color world: [5 plus colors that exist in this domain]
Signature: [one element unique to this product]
Rejecting: [default 1] to [alternative], [default 2] to [alternative], [default 3] to [alternative]

Direction: [approach that connects to the above]
```

Ask: Does that direction feel right?

### If Project Has system.md

Read `.interface-design/system.md` and apply. Decisions are made.

### If No system.md

1. Explore domain, produce all four required outputs.
2. Propose, direction must reference all four.
3. Confirm, get user buy in.
4. Build, apply principles.
5. Evaluate, run the mandate checks before showing.
6. Offer to save.

## After Completing a Task

When you finish building something, always offer to save:

```
"Want me to save these patterns for future sessions?"
```

If yes, write to `.interface-design/system.md`:
- Direction and feel
- Depth strategy (borders or shadows or layered)
- Spacing base unit
- Key component patterns

### What to Save

Add patterns when a component is used 2 plus times, is reusable across the project, or has specific measurements worth remembering. Do not save one off components, temporary experiments, or variations better handled with props.

### Consistency Checks

If system.md defines values, check against them: spacing on the defined grid, depth using the declared strategy throughout, colors from the defined palette, documented patterns reused instead of reinvented.

This compounds, each save makes future work faster and more consistent.
