
FlowMind offers a wide range of export options to help you use your diagrams in presentations, documentation, or other external tools.

> [!TIP]
> All export options are available via the **"Export"** button in the top right corner of the toolbar.

## Image Exports

Perfect for slides, documents, or sharing on Slack.

### PNG (Portable Network Graphics)
Exports a high-resolution, pixel-based image of your current flow.
*   **Best for**: Slides, Web, General Sharing.
*   **Settings**: Includes transparency by default if enabled in settings.

### JPEG (Joint Photographic Experts Group)
Exports a compressed image file.
*   **Best for**: Email attachments, situations where file size matters.
*   **Note**: Does not support transparency (background will be white).

## Data & Code Exports

FlowMind is a "Diagram-as-Code" tool, so we treat your diagram data as a first-class citizen.

### JSON (FlowMind Native)
Downloads the raw `.json` file containing all node positions, styles, and data.
*   **Best for**: Backups, Version Control, Sharing editable files with other FlowMind users.

### FlowMind DSL
Copies the simplified Domain Specific Language (DSL) representation to your clipboard.
*   **Best for**: Storing diagram logic in your codebase comments or generating similar flows via AI.

### Mermaid.js
Converts your current diagram into [Mermaid](https://mermaid.js.org/) syntax and copies it to the clipboard.
*   **Best for**: Embedding diagrams in GitHub `README.md` files, Notion, or Obsidian.
*   **Supported**: Basic Flowcharts, Sequence Diagrams.

### PlantUML
Copies the PlantUML representation of your diagram.
*   **Best for**: Enterprise wikis (Confluence) or legacy documentation systems.

### Figma
Copies a vector representation compatible with Figma's paste format.
*   **Best for**: Handing off diagrams to designers for high-fidelity polishing.

> [!WARNING]
> Figma export is experimental. Complex custom nodes may not transfer 100% perfectly.
