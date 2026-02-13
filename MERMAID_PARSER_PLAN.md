# Mermaid Parser Rewrite & Flow Quality Overhaul

> Implementation plan for fixing Mermaid/PlantUML parsing, graph layout, and edge routing in FlowMind.

## The Problem

3 layers of failure when importing Mermaid code:

1. **Parsing** — Naive regex misses `graph` keyword, `fa:` icons, chained edges, `linkStyle`, and more
2. **Layout** — Parsed nodes are placed in a dumb 3-per-row grid (ignores graph structure entirely)  
3. **Edge Routing** — Edges use default top/bottom handles regardless of where the connected node actually is

## Files Changed

### `services/mermaidParser.ts` — Full Rewrite
- Support `graph TD/LR/RL/BT` (not just `flowchart`)
- Chained edges: `A -->|l1| B -->|l2| C` → two edges
- Strip `fa:fa-xxx` icon prefixes from labels
- Parse `linkStyle N stroke:color` → edge data
- Allow node IDs with hyphens and numbers
- Handle all arrow types: `-->`, `---`, `-.->`, `==>`, `--`
- Skip `classDef`, `class`, `style`, `click`, `subgraph/end` gracefully
- Return `direction` in ParseResult

### `services/smartEdgeRouting.ts` — NEW
- Assign `sourceHandle` + `targetHandle` based on relative node positions
- Handle bidirectional edges, multiple edges same pair, self-loops
- Algorithm: dominant axis (vertical vs horizontal) determines handle pair

### `services/elkLayout.ts` — Enhanced Config
- Port constraints: `FIXED_ORDER` → `FREE` (biggest single improvement)
- Node placement: `BRANDES_KOEPF` → `NETWORK_SIMPLEX` (better for complex graphs)
- Crossing minimization thoroughness: max (10)
- Increased edge-node and edge-edge spacing
- Separate connected components enabled
- Model order preservation for reading flow

### `components/CommandBar.tsx` — Pipeline Integration
- After `parseMermaid()`, pipe through `getElkLayout()` before `onApply()`
- Then run `assignSmartHandles()` on the ELK-positioned nodes

### `services/mermaidParser.test.ts` — New Tests
- `graph TD` keyword
- Full battery diagram (13 nodes, 20 edges)
- Chained edges, `fa:` stripping, `linkStyle` parsing

## Test Commands

```bash
# Run parser tests
npx vitest run services/mermaidParser.test.ts

# Manual: Cmd+K → Mermaid → paste battery diagram → Apply
```

## Expected Outcome

- Battery diagram renders with all 13 nodes in a clean hierarchy
- No overlapping nodes
- Edges connect to correct sides (right→left for horizontal, bottom→top for vertical)
- Duplicate edges (e.g. Fuse → Cig1 ×2) both visible and distinguishable
- Flow readability matches or exceeds Mermaid's own renderer
