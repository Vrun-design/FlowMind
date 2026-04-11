import { describe, expect, it } from 'vitest';
import mermaid from 'mermaid';
import { ensureMermaidMeasurementSupport } from './ensureMermaidMeasurementSupport';

const FAILING_FLOWCHART = `flowchart TD
    subgraph WritePath["Write Path"]
        LT["Live Turn"] --> ING1["ingestLiveTurnMemory"]
        SK["Skill Result"] --> ING2["ingestSkillResult"]
        AG["Agent Result"] --> ING3["ingestAgentResult"]
        ART["Screenshot Artifact"] --> ING4["ingestArtifactMemory"]
    end
    
    ING1 & ING2 & ING3 & ING4 --> STORE[("memory_records\\nSQLite")]
    STORE --> EMB["embedAndStore\\nasync · fire-and-forget"]
    EMB --> VEC["embedding column\\ncosine similarity search"]
    
    subgraph ReadPath["Read Path — injected into Live sessions AND every Agent run"]
        RETRIEVE["retrieveRelevantMemories\\ntopK=5"]
        VEC --> RETRIEVE
        RETRIEVE -->|"vector similarity + lexical fallback"| INJECT["Inject into\\nSystem Prompt"]
    end

    INJECT --> LIVE_PROMPT["Gemini Live Session\\nContext-Aware from Turn 1"]
    INJECT --> AGENT_PROMPT["Every Specialist Agent\\nReceives Past Context Before Running"]`;

describe('Mermaid render compatibility', () => {
  it('renders the failing flowchart once measurement shims are installed', async () => {
    ensureMermaidMeasurementSupport();

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      suppressErrorRendering: true,
      theme: 'default',
      htmlLabels: false,
      flowchart: {
        defaultRenderer: 'dagre-wrapper',
        htmlLabels: false,
        useMaxWidth: false,
      },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    const result = await mermaid.render('mermaid-compat-flowchart', FAILING_FLOWCHART, container);

    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('memory_records');
  });
});
