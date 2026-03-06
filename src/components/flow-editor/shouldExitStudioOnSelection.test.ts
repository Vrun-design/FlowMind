import { describe, expect, it } from 'vitest';
import { shouldExitStudioOnSelection } from './shouldExitStudioOnSelection';

describe('shouldExitStudioOnSelection', () => {
    it('returns false when studio is not open', () => {
        expect(
            shouldExitStudioOnSelection({
                editorMode: 'canvas',
                studioSelectionSnapshot: {
                    selectedNodeId: null,
                    selectedEdgeId: null,
                },
                selectedNodeId: 'node-1',
                selectedEdgeId: null,
            })
        ).toBe(false);
    });

    it('returns false when the selection matches the snapshot Studio opened with', () => {
        expect(
            shouldExitStudioOnSelection({
                editorMode: 'studio',
                studioSelectionSnapshot: {
                    selectedNodeId: 'node-1',
                    selectedEdgeId: null,
                },
                selectedNodeId: 'node-1',
                selectedEdgeId: null,
            })
        ).toBe(false);
    });

    it('returns true when a node selection changes while studio is open', () => {
        expect(
            shouldExitStudioOnSelection({
                editorMode: 'studio',
                studioSelectionSnapshot: {
                    selectedNodeId: null,
                    selectedEdgeId: null,
                },
                selectedNodeId: 'node-1',
                selectedEdgeId: null,
            })
        ).toBe(true);
    });

    it('returns true when an edge is selected while studio is open', () => {
        expect(
            shouldExitStudioOnSelection({
                editorMode: 'studio',
                studioSelectionSnapshot: {
                    selectedNodeId: null,
                    selectedEdgeId: null,
                },
                selectedNodeId: null,
                selectedEdgeId: 'edge-1',
            })
        ).toBe(true);
    });

    it('returns false when nothing is selected while studio is open', () => {
        expect(
            shouldExitStudioOnSelection({
                editorMode: 'studio',
                studioSelectionSnapshot: {
                    selectedNodeId: null,
                    selectedEdgeId: null,
                },
                selectedNodeId: null,
                selectedEdgeId: null,
            })
        ).toBe(false);
    });
});
