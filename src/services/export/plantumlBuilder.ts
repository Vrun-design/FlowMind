import type { FlowEdge, FlowNode } from '@/lib/types';
import { sanitizeId, sanitizeLabel, sanitizeEdgeLabel } from './formatting';

export function toPlantUML(nodes: FlowNode[], edges: FlowEdge[]): string {
  let plantuml = '@startuml\n\n';

  nodes.forEach((node) => {
    const label = sanitizeLabel(node.data.label);
    const id = sanitizeId(node.id);
    const shape = node.data.shape;
    let type = 'rectangle';

    if (shape === 'diamond') type = 'diamond';
    else if (shape === 'cylinder') type = 'database';
    else if (shape === 'circle') type = 'circle';
    else if (shape === 'hexagon') type = 'hexagon';
    else if (shape === 'ellipse') type = 'usecase';
    else if (shape === 'parallelogram') type = 'card';
    else if (node.type === 'decision') type = 'diamond';
    else if (node.type === 'start' || node.type === 'end') type = 'circle';
    else if (node.type === 'custom') type = 'component';

    plantuml += `${type} "${label}" as ${id}\n`;
  });

  plantuml += '\n';

  edges.forEach((edge) => {
    const source = sanitizeId(edge.source);
    const target = sanitizeId(edge.target);
    const label = edge.label ? ` : ${sanitizeEdgeLabel(edge.label as string)}` : '';
    plantuml += `${source} --> ${target}${label}\n`;
  });

  plantuml += '\n@enduml';
  return plantuml;
}
