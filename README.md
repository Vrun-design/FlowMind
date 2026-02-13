# FlowMind ⚡️

![FlowMind Banner](https://img.shields.io/badge/FlowMind-Diagram_As_Code-indigo?style=for-the-badge&logo=github)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**The Developer-First Diagramming Canvas.**  
Turn **Mermaid**, **Text**, and **Ideas** into beautiful, interactive flowcharts instantly. Now with a powerful **Brand Identity Engine**.

FlowMind bridges the gap between **Diagram-as-Code** and visual whiteboarding. It's built for developers who love the speed of typing code but need the flexibility of a drag-and-drop canvas.

![FlowMind Banner](public/Flow_mind_1.png)

---

## 🌟 Why FlowMind?

Most diagramming tools are either "Code Only" (Mermaid/PlantUML) or "Drag & Drop Only" (draw.io). FlowMind is **both**.

- **📝 Mermaid & DSL Native**: Paste your Mermaid code, and it instantly renders as editable nodes.
- **🎨 Brand Identity Engine**: Define your brand's colors, fonts, and style once, and apply it everywhere.
- **✨ Premium Aesthetics**: Glassmorphic UI, smooth animations, and a "Billion Dollar Startup" look out of the box.
- **⚡️ Rapid Prototyping**: Text-to-Flow capabilities let you scaffold complex systems in seconds.
- **🧠 AI Copilot**: Stuck? Ask the built-in AI to "Add error handling" or "Explain this flow".

---

## 🔥 Key Features

### 🎨 Brand Identity Engine (New!)
Customize the entire editor to match your brand or personal style.
- **Theme Builder**: Set your **Primary**, **Secondary**, **Surface**, and **Background** colors.
- **Typography System**: Integrates with **Google Fonts** to load your brand's typeface dynamically.
- **UI Customization**: Adjust `Border Radius` and enable `Glassmorphism` for that premium feel.
- **Brand Kits**: Create, save, and switch between multiple brand identities (e.g., "Dark Mode", "Client A", "Wireframe").

### 💠 Design Systems & Styling
Fine-grained control over how your diagrams look.
- **Component-Level Styling**: Define exact styles for **Nodes** (Shape, Color, Border) and **Edges** (Stroke, Pattern, Routing).
- **Design System Panel**: Manage your design tokens directly relative to the canvas.
- **Smart Inheritance**: New nodes automatically inherit the active design system's properties.

### 🖌️ Native Figma Export
Stop screenshotting your diagrams. FlowMind generates clean, structured SVGs that behave like native Figma layers.
- **Editable Text**: Labels and sublabels export as `<text>` blocks, not paths. Fix typos in Figma without redrawing.
- **Vector Fidelity**: Perfect rounded corners, gradients, and stroke precision.
- **One-Click Copy**: Just hit "Copy for Figma" and paste (Cmd+V).

### 🛠 Advanced Diagram as Code
First-class support for **Mermaid.js** and our own **FlowMind DSL**.
- **Expanded Support**: Now supporting **Flowcharts**, **State Diagrams**, and **Subgraphs** (Groups).
- **Live Sync**: Tweaking the visual graph updates the underlying code structure.

### 💎 Premium UX & Smart Editor
- **Intelligent Properties Panel**: Context-aware side panel for editing Node/Edge properties with brand-aware controls.
- **Keyboard Shortcuts**: `Cmd/Ctrl + K` Command Bar for instant access to every action.
- **Home Dashboard**: A beautiful, minimalist dashboard to manage your recent flows and brand settings.
- **Drag & Drop**: Intuitive drag-and-drop interface for image assets and nodes.
- **Universal Handles**: Omni-directional connection points that just work.

### 📐 Advanced Auto-Layout
Powered by the **ELK Layout Engine** for professional-grade graph organization.
- **4 Algorithms**: Layered (standard flow), Tree (org charts), Force (organic networks), and Radial.
- **Animated Transitions**: Watch your graph smoothly reorganize itself.

---

## 🏗️ Architecture & Project Structure

Built for performance and extensibility using the best modern web tech:

- **Core**: [React Flow](https://reactflow.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for multi-tab shared state and persistence.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type-safe reliability.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a dynamic **CSS Variable** theme engine.

### File Tree

```bash
FlowMind/
├── src/
│   ├── components/
│   │   ├── properties/       # Node/Edge property panels (Brand-aware)
│   │   ├── SettingsModal/    # Brand & App configuration
│   │   ├── ui/               # Reusable primitives (Buttons, Inputs, Sliders)
│   │   ├── CommandBar.tsx    # Cmd+K interface
│   │   ├── FlowCanvas.tsx    # Main diagram editor
│   │   ├── HomePage.tsx      # Dashboard & File management
│   │   └── TopNav.tsx        # Navigation & Actions
│   ├── hooks/
│   │   ├── useBrandTheme.ts  # Dynamic CSS variable injection
│   │   ├── useFlowHistory.ts # Undo/Redo logic
│   │   ├── useAutoSave.ts    # Persistence sync
│   │   └── useSnapshots.ts   # File versioning
│   ├── services/
│   │   ├── brandService.ts   # Palette generation & Theme logic
│   │   ├── exportService.ts  # Image & JSON export
│   │   ├── mermaidParser.ts  # Diagram-as-Code parsing
│   │   └── elkLayout.ts      # Auto-layout engine
│   ├── store.ts              # Global Zustand store
│   └── theme.ts              # Default theme constants
├── public/                   # Static assets
└── index.css                 # Base Tailwind & CSS Variables
```

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/Vrun-design/FlowMind.git
   cd FlowMind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing

We want FlowMind to be the standard open-source diagramming tool for developers.
PRs are highly encouraged!

- **Found a bug?** Open an issue.
- **Want a feature?** Start a discussion.
- **Love the tool?** ⭐ **Star this repo!** It helps us ship faster.

---

## 📄 License

MIT © [Varun]


