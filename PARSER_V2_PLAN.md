# FlowMind Parser V2 & Global Visuals Plan

## 1. Parser V2 Enhancements
**Goal**: Support complex Mermaid syntax used in "Service Learning" example.

### Key Fixes Required
1.  **Multiline Quoted Strings**:
    ```mermaid
    A("This is a
    multi-line label")
    ```
    *Current behavior*: Parser splits on newline, sees incomplete line `A("This is a`, fails.
    *Fix*: Implement "Quote-Aware Line Reader" that merges lines until quote is closed.

2.  **Inline Edge Labels**:
    - `A -- Yes --> B`
    - `A == Yes ==> B`
    *Current behavior*: only `-->|Label|` supported.
    *Fix*: Regex support for:
    - `/\s--\s*(.+?)\s*-->/`  (Dotted/Light link with text)
    - `/\s==\s*(.+?)\s*==>/`  (Thick link with text)

## 2. Global Edge Styling
**Goal**: "Change the connector path style... and it should impact all the items."

### Store Update (`store.ts`)
Add `globalSettings` slice:
```typescript
globalSettings: {
    edgeType: 'bezier' | 'smoothstep' | 'step' | 'straight';
    edgeAnimation: boolean;
    edgeStrokeWidth: number;
    defaultIconsEnabled: boolean;
}
```

### UI Implementation (`CommandBar.tsx`)
New "Visuals" section in Command Bar (or separate floating panel):
- [ ] Edge Style Select: Bezier / Step / Straight
- [ ] Animation Toggle
- [ ] Stroke Width Slider
- [ ] "Update All Edges" Action (or auto-sync)

### Logic
1.  When `globalSettings` change, we iterate `edges` array and update `type`, `animated`, `style.strokeWidth`.
2.  New parsed diagrams inherit these settings immediately.

## 3. Plan of Action
1.  **Refine Parser**: Update `mermaidParser.ts` with new regex and multiline handling.
2.  **Add Tests**: Add the "Service Learning" graph to `mermaidParser.test.ts`.
3.  **Update Store**: Add `globalSettings` to Zustand store.
4.  **UI Controls**: Add styling controls to Command Bar.
