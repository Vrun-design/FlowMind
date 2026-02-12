lowMind Connection & UX Audit Report
Date: 2026-02-11 | Scope: Connections, Auto-Layout, Edge UX, General Interaction

Executive Summary
After a thorough audit of the codebase, I found 3 critical bugs, 5 major missing features, and 12+ UX improvements needed to make FlowMind a best-in-class diagramming tool. The issues range from broken connection direction to missing self-loop support and a barebones auto-layout system.

🔴 Critical Bugs
1. Handle ID Mismatch — Connections Snap to Wrong Handle
CAUTION

Root Cause of "A→B shows as B→A" bug

Files: 
useFlowOperations.ts
, 
CustomNode.tsx

The snap-to-handle logic in onConnectEnd uses bare IDs (top, bottom, left, right), but 
CustomNode.tsx
 defines handles with suffixed IDs (top-target, bottom-source, left-target, right-source).

diff
// onConnectEnd snap logic (CURRENT - WRONG):
 const hPoints = [
-  { id: 'top', x: ... },
-  { id: 'bottom', x: ... },
-  { id: 'left', x: ... },
-  { id: 'right', x: ... },
+  { id: 'top-target', x: ... },    // Snap to TARGET handles
+  { id: 'bottom-target', x: ... },
+  { id: 'left-target', x: ... },
+  { id: 'right-target', x: ... },
 ];
Impact: When dragging from node A to near node B, the targetHandle is set to a non-existent ID (e.g. 'top' instead of 'top-target'). ReactFlow may silently fall back to any available handle, causing the arrow to appear reversed or misconnected.

2. No Duplicate Edge Prevention
File: 
useFlowOperations.ts

The 
onConnect
 callback blindly adds edges via addEdge() without checking if an identical edge already exists. This causes:

Stacked duplicate edges that look like a single thick line
Confusion when trying to create bidirectional edges (user thinks it failed)
Fix: Add a guard before addEdge:

typescript
const isDuplicate = eds.some(e => 
  e.source === params.source && 
  e.target === params.target &&
  e.sourceHandle === params.sourceHandle &&
  e.targetHandle === params.targetHandle
);
if (isDuplicate) return eds;
3. Missing ConnectionMode.Loose — Prevents Flexible Connections
File: 
FlowCanvas.tsx

The <ReactFlow> component does NOT set connectionMode. Without ConnectionMode.Loose, ReactFlow enforces strict source→target handle matching, which:

Prevents connecting any handle to any handle
Makes bidirectional connections nearly impossible
Causes confusing "near miss" failures where the cursor is close but the connection won't snap because the handle types don't match
Fix: Add connectionMode={ConnectionMode.Loose} to the <ReactFlow> component.

🟠 Connection System — Major Missing Features
4. No Bidirectional Edge Support
Current State: Edges only support markerEnd (one arrow). There is no way to create A↔B bidirectional edges.

What's Needed:

Add a markerStart option to edge data (with MarkerType.ArrowClosed)
Add a "Bidirectional" toggle in the Edge Properties panel
When creating a connection between two already-connected nodes (A→B exists, user draws B→A), offer to convert to bidirectional instead of creating a second edge
Property	Current	Needed
markerEnd	✅ ArrowClosed	✅ Keep
markerStart	❌ None	✅ ArrowClosed (optional)
Edge Properties Toggle	❌	✅ "Bidirectional" button
5. No Self-Loop Support
Current State: There is no way to create a loop from a node back to itself (A→A). This is essential for state machines, retry logic, and iterative processes.

What's Needed:

Allow connections from a node's source handle to its own target handle
Render self-loops as a curved path that exits and re-enters the node
ReactFlow supports this natively if handles are set up correctly
6. No Parallel/Multi-Edge Support
Current State: Multiple edges between the same pair of nodes stack on top of each other, becoming invisible.

What's Needed:

Detect parallel edges and offset them with a curve
Or use different handle pairs for each edge (e.g., A-right→B-left and A-bottom→B-top)
Display a count badge if edges overlap
🟡 Auto-Layout — Needs Major Upgrade
7. Basic Dagre Layout with No Configuration
File: 
App.tsx

Current Issues:

Fixed rankdir: 'TB' (top-to-bottom only)
No spacing configuration (ranksep, nodesep)
Ignores actual node dimensions (uses constant NODE_WIDTH/NODE_HEIGHT)
Doesn't handle sections/groups
No animation during layout transition (nodes jump instantly)
No option for LR (left-to-right), RL, or BT directions
Recommended Improvements:

Feature	Priority	Effort
Layout direction selector (TB/LR/RL/BT)	🔴 High	Low
Configurable spacing (ranksep/nodesep)	🔴 High	Low
Use actual node dimensions	🟡 Medium	Low
Animated layout transitions	🟡 Medium	Medium
Exclude section/annotation nodes from layout	🔴 High	Low
Consider elkjs for better complex graph support	🟢 Low	High
Better dagre config:

typescript
dagreGraph.setGraph({ 
  rankdir: direction, // 'TB' | 'LR' | 'RL' | 'BT'
  ranksep: 80,        // Space between ranks
  nodesep: 40,        // Space between nodes in same rank
  marginx: 20,
  marginy: 20,
});
// Use actual node dimensions
const w = node.width || node.data?.width || NODE_WIDTH;
const h = node.height || node.data?.height || NODE_HEIGHT;
dagreGraph.setNode(node.id, { width: w, height: h });
🔵 Edge UX Improvements
8. Edge Creation Direction Clarity
Problem: Users don't get clear visual feedback about which direction an edge will be created.

Improvements:

Show an arrowhead on the 
CustomConnectionLine
 (currently just a dashed line + circle)
Highlight the target handle when hovering near it
Show a "snap" animation when the connection locks onto a handle
9. Edge Type & Style Controls in Properties Panel
Current: Has edge color, animation, type (bezier/smoothstep/step). Missing:

Stroke width control
Dash pattern (solid, dashed, dotted)
Marker style (arrow, diamond, circle, none)
Bidirectional toggle (markerStart)
Edge label editing inline (currently only via conditions)
10. Smart Edge Routing
Current: Edges pass through other nodes. This makes complex diagrams unreadable.

Improvements:

Use edge routing that avoids other nodes (orthogonal routing)
Consider reactflow-smart-edge or custom path computation
Allow manual waypoints (bend points) by clicking on an edge to add control points
🟣 General UX — Best-in-Class Features
11. Multi-Select Edge Operations
Bulk delete edges
Bulk change edge style/color
Select all edges connected to a node
12. Connection Validation Rules
typescript
// In FlowCanvas.tsx, add:
isValidConnection={(connection) => {
  // Prevent self-connections (unless self-loop enabled)
  if (connection.source === connection.target) return allowSelfLoops;
  // Prevent duplicate connections
  const exists = edges.some(e => 
    e.source === connection.source && e.target === connection.target
  );
  return !exists;
}}
13. Improved Node Handles UX
Visible on hover only — Currently, all 8 handles (4 positions × 2 types) are visible/invisible inconsistently. Show handles only on node hover.
Handle tooltip — Show "Drag to connect" on handle hover
Handle snap radius — Increase from 40px to 60px for easier connecting
14. Keyboard Shortcuts for Edges
Delete / Backspace to delete selected edge ✅ (already works)
E to toggle edge animation
B to toggle bidirectional (after implementing)
L to add/edit edge label
15. Edge Context Menu
Currently edges have a context menu position but limited actions. Add:

"Make Bidirectional"
"Reverse Direction"
"Add Label"
"Change Style" submenu
"Split Edge" (insert a node in the middle)
16. Canvas Interaction Improvements
Feature	Impact	Effort
Double-click to create node at position	🔴 High	Low
Drag from empty canvas to start connection	🟡 Medium	Medium
Right-click node → "Connect to..." mode	🟡 Medium	Medium
Edge bend/waypoint editing	🔴 High	High
Alignment guides (snap to other nodes)	🔴 High	Medium
Smart node spacing (equal distribute)	🟡 Medium	Medium
📋 Prioritized Action Plan
Phase 1 — Fix Critical Bugs (Immediate)
✅ Fix handle ID mismatch in onConnectEnd snap logic
✅ Add ConnectionMode.Loose to <ReactFlow>
✅ Add duplicate edge prevention
✅ Add isValidConnection guard
Phase 2 — Core Connection Features (High Priority)
Add bidirectional edge support (markerStart toggle)
Add "Reverse Direction" on edges
Improve edge context menu
Fix auto-layout (direction selector, spacing, animation)
Phase 3 — Advanced UX (Medium Priority)
Self-loop support
Edge routing / avoiding nodes
Manual waypoints on edges
Alignment guides / smart snapping
Edge label inline editing
Phase 4 — Polish (Lower Priority)
Parallel edge offset rendering
Node spacing distribution
Animated layout transitions
elkjs for complex graph layouts
Files Requiring Changes
File	Changes
useFlowOperations.ts
Fix handle IDs, duplicate prevention, self-loop
FlowCanvas.tsx
ConnectionMode.Loose, isValidConnection
CustomNode.tsx
Handle visibility on hover
CustomEdge.tsx
Bidirectional markers, self-loop path
PropertiesPanel.tsx
Bidirectional toggle, stroke width, dash pattern
ContextMenu.tsx
Edge-specific actions
App.tsx
Auto-layout upgrades
constants.ts
Updated edge defaults
types.ts
EdgeData extensions