import { describe, expect, it } from 'vitest';
import { parseMermaidByType } from './parseMermaidByType';
import type { MermaidImportStatus } from './importContracts';
import { MERMAID_COMPAT_FIXTURES } from '../../../scripts/mermaid-compat-fixtures.mjs';

interface MermaidCompatFixture {
  name: string;
  family: string;
  bucket: 'editable_full' | 'editable_partial' | 'valid_but_not_editable' | 'invalid_source';
  expectedOfficial: 'valid' | 'invalid' | 'environment_limited';
  expectedEditableGate: 'supported_family' | 'unsupported_family' | 'invalid_source';
  expectedImportState: MermaidImportStatus;
  source: string;
  structuralAssertions?: {
    minNodes?: number;
    maxNodes?: number;
    minEdges?: number;
    maxEdges?: number;
    diagnosticsMin?: number;
    minSections?: number;
    minParticipants?: number;
    minNotes?: number;
    minAnnotations?: number;
    requiredLabels?: string[];
    requiredNodeIds?: string[];
    requiredParentIds?: Record<string, string>;
  };
}

function countNodesOfType(nodes: Array<{ type?: string }>, type: string): number {
  return nodes.filter((node) => node.type === type).length;
}

function shouldExposeDiagramType(importState: MermaidImportStatus): boolean {
  return importState !== 'invalid_source' && importState !== 'unsupported_family';
}

function hasDegradingDiagnostics(
  diagnostics: Array<{ severity?: string; editableImpact?: string }> | undefined
): boolean {
  return (diagnostics ?? []).some(
    (diagnostic) =>
      diagnostic.severity === 'warning'
      || diagnostic.editableImpact === 'partial'
      || diagnostic.editableImpact === 'blocked'
  );
}

describe('Mermaid compat fixture corpus', () => {
  it('enforces import-state and structure expectations for the shared fixture corpus', () => {
    const fixtures = MERMAID_COMPAT_FIXTURES as MermaidCompatFixture[];

    for (const fixture of fixtures) {
      const result = parseMermaidByType(fixture.source);

      expect(result.originalSource?.trim(), fixture.name).toBe(fixture.source.trim());
      expect(result.importState, fixture.name).toBe(fixture.expectedImportState);

      if (shouldExposeDiagramType(fixture.expectedImportState)) {
        expect(result.diagramType, fixture.name).toBeDefined();
      }

      if (fixture.expectedEditableGate === 'unsupported_family') {
        expect(result.importState, fixture.name).toBe('unsupported_family');
      }

      if (fixture.expectedImportState !== 'editable_full') {
        expect(result.originalSource, fixture.name).toContain(fixture.source.trim().split('\n')[0]);
      }
      if (fixture.expectedImportState === 'editable_full') {
        expect(hasDegradingDiagnostics(result.structuredDiagnostics), fixture.name).toBe(false);
      } else if (fixture.expectedImportState === 'editable_partial') {
        expect(hasDegradingDiagnostics(result.structuredDiagnostics), fixture.name).toBe(true);
      }

      const assertions = fixture.structuralAssertions;
      if (!assertions) {
        continue;
      }

      if (typeof assertions.minNodes === 'number') {
        expect(result.nodes.length, fixture.name).toBeGreaterThanOrEqual(assertions.minNodes);
      }
      if (typeof assertions.maxNodes === 'number') {
        expect(result.nodes.length, fixture.name).toBeLessThanOrEqual(assertions.maxNodes);
      }
      if (typeof assertions.minEdges === 'number') {
        expect(result.edges.length, fixture.name).toBeGreaterThanOrEqual(assertions.minEdges);
      }
      if (typeof assertions.maxEdges === 'number') {
        expect(result.edges.length, fixture.name).toBeLessThanOrEqual(assertions.maxEdges);
      }
      if (typeof assertions.diagnosticsMin === 'number') {
        expect(result.structuredDiagnostics?.length ?? 0, fixture.name).toBeGreaterThanOrEqual(
          assertions.diagnosticsMin
        );
      }
      if (typeof assertions.minSections === 'number') {
        expect(countNodesOfType(result.nodes, 'section'), fixture.name).toBeGreaterThanOrEqual(
          assertions.minSections
        );
      }
      if (typeof assertions.minParticipants === 'number') {
        expect(
          countNodesOfType(result.nodes, 'sequence_participant'),
          fixture.name
        ).toBeGreaterThanOrEqual(assertions.minParticipants);
      }
      if (typeof assertions.minNotes === 'number') {
        expect(countNodesOfType(result.nodes, 'sequence_note'), fixture.name).toBeGreaterThanOrEqual(
          assertions.minNotes
        );
      }
      if (typeof assertions.minAnnotations === 'number') {
        expect(countNodesOfType(result.nodes, 'annotation'), fixture.name).toBeGreaterThanOrEqual(
          assertions.minAnnotations
        );
      }
      for (const label of assertions.requiredLabels ?? []) {
        expect(
          result.nodes.some((node) => String(node.data?.label ?? '').includes(label)),
          `${fixture.name} should preserve label "${label}"`
        ).toBe(true);
      }
      for (const nodeId of assertions.requiredNodeIds ?? []) {
        expect(
          result.nodes.some((node) => node.id === nodeId),
          `${fixture.name} should preserve node id "${nodeId}"`
        ).toBe(true);
      }
      for (const [nodeId, parentId] of Object.entries(assertions.requiredParentIds ?? {})) {
        expect(
          result.nodes.find((node) => node.id === nodeId)?.parentId,
          `${fixture.name} should preserve parent "${parentId}" for node "${nodeId}"`
        ).toBe(parentId);
      }
    }
  });
});
