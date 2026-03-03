---
name: code-simplifier
description: Simplify and refine code for clarity, consistency, and maintainability while preserving exact behavior. Use when code was recently modified and needs cleanup, when users request refactoring without functional changes, when enforcing project coding conventions on touched files, or when the user asks for one-by-one low-risk simplification with validation after each step.
---

# Code Simplifier

Refine recently modified code to improve clarity and consistency while preserving functionality exactly.

## Workflow

1. Identify scope.
   - Default to one file at a time from files touched in the current task or recent edits.
   - Expand scope only if the user asks.
2. Lock behavior contract.
   - List observable behavior to preserve: inputs, outputs, side effects, errors, and persistence/schema effects.
   - Write down invariants for the file before editing.
3. Read project conventions.
   - Preserve existing architecture and folder boundaries.
4. Simplify safely.
   - Reduce nesting and branching complexity where possible.
   - Remove redundancy and dead local abstractions.
   - Rename unclear locals/functions to explicit names.
   - Consolidate related logic only when it improves readability.
5. Validate immediately after each scoped file change.
   - Run the most targeted checks first (unit tests, typecheck, lint for touched files).
   - Run broader checks when a touched surface is shared across modules.
6. Record and continue.
   - Summarize what changed and what did not change.
   - Continue to next file only after checks are green.

## One-by-One Execution Rules

- Keep each step to a single logical refactor unit.
- Avoid editing unrelated files in the same step.
- Prefer multiple small commits/patches over one broad cleanup.
- Stop and report if behavior risk appears higher than expected.
- Include a rollback note for each step (what to revert if validation fails).

## Project Standards To Enforce

- Use ES modules with sorted imports and explicit extensions where required by project conventions.
- Prefer `function` declarations over arrow functions for top-level exported logic.
- Add explicit return types for top-level functions in TypeScript.
- Use explicit React `Props` types for components.
- Follow existing naming conventions and file organization.
- Prefer guard clauses and explicit branches over dense expressions.
- Avoid nested ternaries; use `if/else` or `switch` for multi-branch logic.

## Simplification Heuristics

- Choose clarity over fewer lines.
- Keep helpers focused on one concern.
- Remove comments that restate obvious code.
- Keep meaningful comments that explain non-obvious intent or constraints.
- Prefer straightforward control flow over clever composition.

## Guardrails

- Do not alter functionality.
- Do not broaden refactors beyond modified scope unless requested.
- Do not introduce new dependencies unless required and approved.
- Do not convert readable code into compact one-liners.
- Do not mix behavior fixes with simplification in the same change.
- Do not skip validation between sequential simplification steps.

## Output Expectations

- Apply edits directly.
- Summarize significant changes that affect understanding or future maintenance.
- Report validation run per step (`command -> result`).
- Call out risks, assumptions, and test gaps before moving to the next step.
