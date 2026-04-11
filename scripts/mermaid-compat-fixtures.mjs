import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, 'mermaid-compat-fixtures.json');

const rawFixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const FIXTURE_METADATA = {
  'flowchart-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['Start', 'End'] },
    layoutAssertions: {
      maxBoundingWidth: 260,
      maxBoundingHeight: 240,
      requireUniquePositions: true,
      orderedLabelsTopToBottom: ['Start', 'End'],
    },
  },
  'flowchart-subgraph-explicit-id': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 1, minSections: 1, requiredLabels: ['API Layer'] },
    layoutAssertions: { maxBoundingWidth: 420, maxBoundingHeight: 320, minSections: 1 },
  },
  'flowchart-invalid-edge': {
    bucket: 'valid_but_not_editable',
    expectedImportState: 'unsupported_construct',
    structuralAssertions: { maxNodes: 0, maxEdges: 0 },
  },
  'flowchart-invalid-subgraph-close': {
    bucket: 'editable_partial',
    expectedImportState: 'editable_partial',
    structuralAssertions: { minNodes: 2, minEdges: 1, diagnosticsMin: 1, minSections: 1 },
  },
  'state-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2 },
    layoutAssertions: { maxBoundingWidth: 420, maxBoundingHeight: 320, requireUniquePositions: true },
  },
  'state-invalid-direction': {
    bucket: 'editable_partial',
    expectedImportState: 'editable_partial',
    structuralAssertions: { minNodes: 2, minEdges: 1, diagnosticsMin: 1 },
  },
  'sequence-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, minParticipants: 2 },
    layoutAssertions: {
      minParticipants: 2,
      requireSequenceLaneAlignment: true,
      maxBoundingWidth: 520,
      orderedLabelsLeftToRight: ['Alice', 'Bob'],
      sameRowLabels: ['Alice', 'Bob'],
    },
  },
  'sequence-activation-and-alt': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2, minParticipants: 2, minAnnotations: 1 },
    layoutAssertions: { minParticipants: 2, requireSequenceLaneAlignment: true, maxBoundingWidth: 620 },
  },
  'sequence-invalid-message': {
    bucket: 'editable_partial',
    expectedImportState: 'editable_partial',
    structuralAssertions: { minNodes: 1, maxEdges: 0, diagnosticsMin: 1, minParticipants: 1 },
  },
  'sequence-partial-after-valid-message': {
    bucket: 'editable_partial',
    expectedImportState: 'editable_partial',
    structuralAssertions: { minNodes: 2, minEdges: 1, diagnosticsMin: 1, minParticipants: 2 },
  },
  'class-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1 },
  },
  'class-cardinality-generic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredNodeIds: ['Repository<T>', 'User'] },
  },
  'class-generic-multi-param': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredNodeIds: ['Map<K, V>', 'Entry'] },
  },
  'class-invalid-relation': {
    bucket: 'editable_partial',
    expectedImportState: 'editable_partial',
    structuralAssertions: { minNodes: 1, diagnosticsMin: 1 },
  },
  'er-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1 },
  },
  'er-field-metadata': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 1, maxEdges: 0, requiredLabels: ['ORDER'] },
  },
  'er-field-references-table-only': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 1, maxEdges: 0, requiredLabels: ['ORDER'] },
  },
  'er-field-dotted-reference': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 1, maxEdges: 0, requiredLabels: ['ORDER'] },
  },
  'mindmap-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2 },
  },
  'mindmap-wrapped-nodes': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2, requiredLabels: ['Root', 'Child A', 'Child B'] },
  },
  'mindmap-dotted-aliases': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 3,
      minEdges: 2,
      requiredLabels: ['Root', 'Child A', 'Child B'],
    },
  },
  'journey-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['Search', 'Buy'] },
    layoutAssertions: {
      maxBoundingHeight: 220,
      orderedLabelsTopToBottom: ['Search', 'Buy'],
    },
  },
  'journey-multiple-sections': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, maxEdges: 0, requiredLabels: ['Alert fires', 'Mitigate'] },
  },
  'journey-invalid-score': {
    bucket: 'valid_but_not_editable',
    expectedImportState: 'unsupported_construct',
    structuralAssertions: { maxNodes: 0, maxEdges: 0, diagnosticsMin: 1 },
  },
  'journey-colon-rich-step': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['HTTP: 500 Error', 'Recover service'] },
  },
  'journey-support-escalation': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 4,
      minEdges: 2,
      requiredLabels: ['Customer reports issue', 'Triage severity', 'Hand off to engineering', 'Confirm resolution'],
    },
  },
  'state-notes-and-control': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 4, minEdges: 4, requiredLabels: ['Idle'] },
  },
  'architecture-official-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['API', 'Database'] },
    layoutAssertions: {
      maxBoundingWidth: 420,
      maxBoundingHeight: 260,
      requireUniquePositions: true,
      orderedLabelsLeftToRight: ['API', 'Database'],
    },
  },
  'architecture-title-basic': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['API', 'Database'] },
  },
  'architecture-extension-labeled-edge': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1 },
  },
  'flowchart-inline-class': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredLabels: ['API', 'DB'] },
  },
  'flowchart-class-assignment-line': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, maxEdges: 0, requiredLabels: ['API', 'DB'] },
  },
  'flowchart-modern-annotation-dotted-ids': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1, requiredNodeIds: ['api.gateway', 'db.primary'] },
    layoutAssertions: { maxBoundingWidth: 320, maxBoundingHeight: 240, requireUniquePositions: true },
  },
  'flowchart-style-dotted-id': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 1, maxEdges: 0, requiredNodeIds: ['api.gateway'], requiredLabels: ['Gateway'] },
    layoutAssertions: { maxBoundingWidth: 200, maxBoundingHeight: 120 },
  },
  'flowchart-nested-subgraphs': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 4,
      minEdges: 1,
      minSections: 2,
      requiredLabels: ['Platform', 'API', 'Gateway', 'Service'],
      requiredParentIds: {
        api: 'platform',
        gateway: 'api',
        service: 'api',
      },
    },
    layoutAssertions: { maxBoundingWidth: 460, maxBoundingHeight: 360, minSections: 2 },
  },
  'flowchart-unexpected-end': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 2, minEdges: 1 },
  },
  'flowchart-auth-decision': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 5,
      minEdges: 4,
      requiredLabels: ['User', 'API Gateway', 'Authenticated?', 'Dashboard', 'Login'],
    },
  },
  'state-composite-alias': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 4, minEdges: 3, minSections: 1, requiredLabels: ['Working Set'] },
  },
  'state-direction-lr': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 4, minEdges: 3 },
    layoutAssertions: { maxBoundingWidth: 520, maxBoundingHeight: 440, requireUniquePositions: true },
  },
  'state-composite-standalone-declarations': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 3,
      minEdges: 2,
      requiredLabels: ['Working', 'Busy', 'Idle'],
      requiredParentIds: {
        Busy: 'Working',
        Idle: 'Working',
      },
    },
    layoutAssertions: { maxBoundingWidth: 420, maxBoundingHeight: 320, requireUniquePositions: true },
  },
  'sequence-par-and': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2, minParticipants: 3 },
    layoutAssertions: { minParticipants: 3, requireSequenceLaneAlignment: true, maxBoundingWidth: 760 },
  },
  'sequence-note-inside-alt': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2, minParticipants: 2, minNotes: 1, minAnnotations: 1 },
    layoutAssertions: { minParticipants: 2, requireSequenceLaneAlignment: true, requireNotesBelowParticipants: true, maxBoundingWidth: 620 },
  },
  'sequence-critical-option': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 4, minEdges: 2, minParticipants: 2, minAnnotations: 2 },
    layoutAssertions: { minParticipants: 2, requireSequenceLaneAlignment: true, maxBoundingWidth: 620 },
  },
  'architecture-rich-node-kinds': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: { minNodes: 3, minEdges: 2, requiredLabels: ['User', 'App', 'Data Store'] },
  },
  'architecture-nested-groups': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 3,
      maxEdges: 0,
      requiredLabels: ['Global', 'Prod', 'API'],
      requiredParentIds: {
        prod: 'global',
        api: 'prod',
      },
    },
  },
  'architecture-edge-tier': {
    bucket: 'editable_full',
    expectedImportState: 'editable_full',
    structuralAssertions: {
      minNodes: 4,
      minEdges: 2,
      requiredLabels: ['Edge', 'Web', 'API', 'Database'],
    },
  },
  'unsupported-gitgraph': {
    bucket: 'valid_but_not_editable',
    expectedImportState: 'unsupported_family',
    structuralAssertions: { maxNodes: 0, maxEdges: 0 },
  },
  'missing-header-flow-only': {
    bucket: 'invalid_source',
    expectedImportState: 'invalid_source',
    structuralAssertions: { maxNodes: 0, maxEdges: 0, diagnosticsMin: 1 },
  },
};

function enrichFixture(fixture) {
  const metadata = FIXTURE_METADATA[fixture.name];
  if (!metadata) {
    throw new Error(`Missing metadata for Mermaid compat fixture "${fixture.name}".`);
  }

  return {
    ...fixture,
    ...metadata,
  };
}

export const MERMAID_COMPAT_FIXTURES = rawFixtures.map(enrichFixture);
