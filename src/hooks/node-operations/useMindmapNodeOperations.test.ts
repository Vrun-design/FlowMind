import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useFlowStore } from '../../store';
import { useMindmapNodeOperations } from './useMindmapNodeOperations';

vi.mock('../../store', () => ({
    useFlowStore: Object.assign(vi.fn(), {
        getState: vi.fn(),
    }),
}));

const mockSetNodes = vi.fn();
const mockSetEdges = vi.fn();
const mockSetSelectedNodeId = vi.fn();
const mockState = {
    nodes: [],
    edges: [],
    activeLayerId: 'layer-1',
    viewSettings: { smartRoutingEnabled: false },
};

beforeEach(() => {
    vi.mocked(useFlowStore).mockReturnValue({ setNodes: mockSetNodes, setEdges: mockSetEdges, setSelectedNodeId: mockSetSelectedNodeId } as never);
    vi.mocked(useFlowStore.getState).mockReturnValue(mockState as never);
});

describe('useMindmapNodeOperations', () => {
    const recordHistory = vi.fn();

    it('insertMindmapTopic returns false when source node not found', () => {
        const { result } = renderHook(() => useMindmapNodeOperations(recordHistory));
        expect(result.current.insertMindmapTopic('missing', 'child')).toBe(false);
    });

    it('insertMindmapTopic returns false when source node is not mindmap type', () => {
        vi.mocked(useFlowStore.getState).mockReturnValue({
            ...mockState,
            nodes: [{ id: 'n1', type: 'process', position: { x: 0, y: 0 }, data: {} }],
        } as never);
        const { result } = renderHook(() => useMindmapNodeOperations(recordHistory));
        expect(result.current.insertMindmapTopic('n1', 'child')).toBe(false);
    });

    it('insertMindmapTopic returns false for sibling when sourceNode has no mindmapParentId', () => {
        vi.mocked(useFlowStore.getState).mockReturnValue({
            ...mockState,
            nodes: [{ id: 'n1', type: 'mindmap', position: { x: 0, y: 0 }, data: { mindmapDepth: 0 } }],
        } as never);
        const { result } = renderHook(() => useMindmapNodeOperations(recordHistory));
        expect(result.current.insertMindmapTopic('n1', 'sibling')).toBe(false);
    });

    it('handleAddMindmapChild delegates with relationship=child (returns false for non-mindmap node)', () => {
        const { result } = renderHook(() => useMindmapNodeOperations(recordHistory));
        expect(result.current.handleAddMindmapChild('missing')).toBe(false);
    });

    it('handleAddMindmapSibling delegates with relationship=sibling (returns false for non-mindmap node)', () => {
        const { result } = renderHook(() => useMindmapNodeOperations(recordHistory));
        expect(result.current.handleAddMindmapSibling('missing')).toBe(false);
    });
});
