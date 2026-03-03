import { act, renderHook } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowEditorActions } from './useFlowEditorActions';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { getOpenFlowDSLExportDiagnostics, toOpenFlowDSL } from '@/services/openFlowDSLExporter';

vi.mock('@/services/openFlowDSLExporter', () => ({
    toOpenFlowDSL: vi.fn(() => 'mock-dsl'),
    getOpenFlowDSLExportDiagnostics: vi.fn(() => []),
}));

vi.mock('@/services/figmaExportService', () => ({
    toFigmaSVG: vi.fn(() => '<svg />'),
}));

function createNode(id: string): FlowNode {
    return {
        id,
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: id, subLabel: '', color: 'slate' },
    };
}

function createEdge(id: string, source: string, target: string): FlowEdge {
    return { id, source, target };
}

function createTranslator(fn: (key: string, options?: Record<string, unknown>) => string): TFunction {
    return fn as unknown as TFunction;
}

describe('useFlowEditorActions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('copies OpenFlow DSL and shows success toast', async () => {
        const addToast = vi.fn();
        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                t: createTranslator((key: string) => key),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportOpenFlowDSL();
        });

        expect(toOpenFlowDSL).toHaveBeenCalledWith(
            expect.any(Array),
            expect.any(Array),
            { mode: 'deterministic' }
        );
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('mock-dsl');
        expect(addToast).toHaveBeenCalledWith('flowEditor.dslCopied', 'success');
    });

    it('shows error toast when Figma export copy fails', async () => {
        const addToast = vi.fn();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('copy failed'));

        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                t: createTranslator((key: string, options?: Record<string, unknown>) => options?.message ? `${key}:${String(options.message)}` : key),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportFigma();
        });

        expect(addToast).toHaveBeenCalledWith('flowEditor.figmaExportFailed:copy failed', 'error');
    });

    it('shows warning toast when export skips dangling edges', async () => {
        const addToast = vi.fn();
        vi.mocked(getOpenFlowDSLExportDiagnostics).mockReturnValueOnce([
            {
                edgeId: 'e-dangling',
                source: 'missing-a',
                target: 'missing-b',
                message: 'Edge skipped',
            },
        ]);
        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                t: createTranslator((key: string, options?: Record<string, unknown>) => {
                    if (key === 'flowEditor.dslExportSkippedEdges') return `${String(options?.count)} skipped`;
                    return key;
                }),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportOpenFlowDSL();
        });

        expect(addToast).toHaveBeenCalledWith('1 skipped', 'warning');
    });
});
