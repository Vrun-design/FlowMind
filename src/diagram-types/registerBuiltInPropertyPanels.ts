import { registerDiagramNodeProperties } from '@/diagram-types/core';
import { ClassDiagramNodeProperties } from '@/components/properties/families/ClassDiagramNodeProperties';
import { ERDiagramNodeProperties } from '@/components/properties/families/ERDiagramNodeProperties';
import { MindmapNodeProperties } from '@/components/properties/families/MindmapNodeProperties';
import { JourneyNodeProperties } from '@/components/properties/families/JourneyNodeProperties';
import { ArchitectureNodeProperties } from '@/components/properties/families/ArchitectureNodeProperties';
import { SequenceNodeProperties } from '@/components/properties/families/SequenceNodeProperties';

let didRegisterBuiltInPropertyPanels = false;

export function registerBuiltInPropertyPanels(): void {
  if (didRegisterBuiltInPropertyPanels) {
    return;
  }

  registerDiagramNodeProperties('classDiagram', ClassDiagramNodeProperties);
  registerDiagramNodeProperties('erDiagram', ERDiagramNodeProperties);
  registerDiagramNodeProperties('mindmap', MindmapNodeProperties);
  registerDiagramNodeProperties('journey', JourneyNodeProperties);
  registerDiagramNodeProperties('architecture', ArchitectureNodeProperties);
  registerDiagramNodeProperties('sequence', SequenceNodeProperties);
  didRegisterBuiltInPropertyPanels = true;
}
