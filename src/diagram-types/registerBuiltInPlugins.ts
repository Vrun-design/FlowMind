import { registerDiagramPlugin } from '@/diagram-types/core';
import { FLOWCHART_PLUGIN } from '@/diagram-types/flowchart/plugin';
import { CLASS_DIAGRAM_PLUGIN } from '@/diagram-types/classDiagram/plugin';
import { ER_DIAGRAM_PLUGIN } from '@/diagram-types/erDiagram/plugin';
import { MINDMAP_PLUGIN } from '@/diagram-types/mindmap/plugin';
import { JOURNEY_PLUGIN } from '@/diagram-types/journey/plugin';
import { ARCHITECTURE_PLUGIN } from '@/diagram-types/architecture/plugin';
import { STATE_DIAGRAM_PLUGIN } from '@/diagram-types/stateDiagram/plugin';
import { SEQUENCE_PLUGIN } from '@/diagram-types/sequence/plugin';

let didRegisterBuiltIns = false;

export function registerBuiltInDiagramPlugins(): void {
  if (didRegisterBuiltIns) {
    return;
  }

  registerDiagramPlugin(FLOWCHART_PLUGIN);
  registerDiagramPlugin(STATE_DIAGRAM_PLUGIN);
  registerDiagramPlugin(CLASS_DIAGRAM_PLUGIN);
  registerDiagramPlugin(ER_DIAGRAM_PLUGIN);
  registerDiagramPlugin(MINDMAP_PLUGIN);
  registerDiagramPlugin(JOURNEY_PLUGIN);
  registerDiagramPlugin(ARCHITECTURE_PLUGIN);
  registerDiagramPlugin(SEQUENCE_PLUGIN);
  didRegisterBuiltIns = true;
}
