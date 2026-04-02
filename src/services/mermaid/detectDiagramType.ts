import type { DiagramType } from '@/lib/types';

function getRelevantLine(line: string): string {
  return line.trim();
}

export function detectMermaidDiagramType(input: string): DiagramType | null {
  const lines = input.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const line = getRelevantLine(rawLine);
    if (!line || line.startsWith('%%')) continue;

    if (/^(?:flowchart|graph)\b/i.test(line)) return 'flowchart';
    if (/^stateDiagram(?:-v2)?\b/i.test(line)) return 'stateDiagram';
    if (/^classDiagram\b/i.test(line)) return 'classDiagram';
    if (/^erDiagram\b/i.test(line)) return 'erDiagram';
    if (/^mindmap\b/i.test(line)) return 'mindmap';
    if (/^journey\b/i.test(line)) return 'journey';
    if (/^architecture(?:-beta)?\b/i.test(line)) return 'architecture';
    if (/^sequenceDiagram\b/i.test(line)) return 'sequence';

    return null;
  }

  return null;
}
