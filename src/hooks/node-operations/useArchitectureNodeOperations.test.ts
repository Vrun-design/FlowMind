import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useFlowStore } from '../../store';
import { useArchitectureNodeOperations } from './useArchitectureNodeOperations';

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
    activeTabId: 'tab-1',
    activeLayerId: 'layer-1',
    viewSettings: { smartRoutingEnabled: false },
    updateTab: vi.fn(),
};

beforeEach(() => {
    vi.mocked(useFlowStore).mockReturnValue({ setNodes: mockSetNodes, setEdges: mockSetEdges, setSelectedNodeId: mockSetSelectedNodeId } as never);
    vi.mocked(useFlowStore.getState).mockReturnValue(mockState as never);
});

describe('useArchitectureNodeOperations', () => {
    const recordHistory = vi.fn();

    it('handleAddArchitectureService returns false if node not found', () => {
        const { result } = renderHook(() => useArchitectureNodeOperations(recordHistory));
        expect(result.current.handleAddArchitectureService('missing')).toBe(false);
    });

    it('handleAddArchitectureService returns false if node type is not architecture', () => {
        vi.mocked(useFlowStore.getState).mockReturnValue({
            ...mockState,
            nodes: [{ id: 'n1', type: 'process', position: { x: 0, y: 0 }, data: {} }],
        } as never);
        const { result } = renderHook(() => useArchitectureNodeOperations(recordHistory));
        expect(result.current.handleAddArchitectureService('n1')).toBe(false);
    });

    it('handleCreateArchitectureBoundary returns false if node not found', () => {
        const { result } = renderHook(() => useArchitectureNodeOperations(recordHistory));
        expect(result.current.handleCreateArchitectureBoundary('missing')).toBe(false);
    });

    it('handleApplyArchitectureTemplate returns false if template not found', () => {
        vi.mocked(useFlowStore.getState).mockReturnValue({
            ...mockState,
            nodes: [{ id: 'n1', type: 'architecture', position: { x: 0, y: 0 }, data: { label: 'A' } }],
        } as never);
        const { result } = renderHook(() => useArchitectureNodeOperations(recordHistory));
        expect(result.current.handleApplyArchitectureTemplate('n1', 'nonexistent-template' as never)).toBe(false);
    });

    it('handleConvertEntitySelectionToClassDiagram returns false when no ER nodes selected', () => {
        const { result } = renderHook(() => useArchitectureNodeOperations(recordHistory));
        expect(result.current.handleConvertEntitySelectionToClassDiagram()).toBe(false);
    });
});
