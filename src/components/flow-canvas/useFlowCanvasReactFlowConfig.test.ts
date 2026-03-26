import { describe, expect, it } from 'vitest';
import { ConnectionMode, SelectionMode } from '@/lib/reactflowCompat';
import { computeFlowCanvasReactFlowConfig } from './useFlowCanvasReactFlowConfig';
import {
    FLOW_CANVAS_BASE_BEHAVIOR,
    FLOW_CANVAS_STYLE_PRESETS,
} from './flowCanvasReactFlowContracts';

describe('computeFlowCanvasReactFlowConfig', () => {
    it('builds select-mode config with visual quality styling', () => {
        const result = computeFlowCanvasReactFlowConfig({
            visualQualityV2Enabled: true,
            isEffectiveSelectMode: true,
            viewportCullingEnabled: true,
        });

        expect(result.className).toContain('flow-canvas-select-mode');
        expect(result.onlyRenderVisibleElements).toBe(true);
        expect(result.connectionMode).toBe(ConnectionMode.Loose);
        expect(result.selectionOnDrag).toBe(true);
        expect(result.selectNodesOnDrag).toBe(FLOW_CANVAS_BASE_BEHAVIOR.selectNodesOnDrag);
        expect(result.selectionKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.selectionKeyCode);
        expect(result.panOnDrag).toEqual([1, 2]);
        expect(result.panActivationKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panActivationKeyCode);
        expect(result.zoomActivationKeyCode).toEqual(FLOW_CANVAS_BASE_BEHAVIOR.zoomActivationKeyCode);
        expect(result.selectionMode).toBe(SelectionMode.Partial);
        expect(result.multiSelectionKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.multiSelectionKeyCode);
        expect(result.zoomOnScroll).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnScroll);
        expect(result.zoomOnPinch).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnPinch);
        expect(result.panOnScroll).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panOnScroll);
        expect(result.panOnScrollMode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panOnScrollMode);
        expect(result.preventScrolling).toBe(FLOW_CANVAS_BASE_BEHAVIOR.preventScrolling);
        expect(result.zoomOnDoubleClick).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnDoubleClick);
        expect(result.defaultEdgeOptions).toEqual(FLOW_CANVAS_STYLE_PRESETS.enhanced.defaultEdgeOptions);
        expect(result.background).toEqual(FLOW_CANVAS_STYLE_PRESETS.enhanced.background);
    });

    it('builds pan-mode config with legacy styling', () => {
        const result = computeFlowCanvasReactFlowConfig({
            visualQualityV2Enabled: false,
            isEffectiveSelectMode: false,
            viewportCullingEnabled: false,
        });

        expect(result.className).toContain('flow-canvas-pan-mode');
        expect(result.onlyRenderVisibleElements).toBe(false);
        expect(result.selectionOnDrag).toBe(false);
        expect(result.selectNodesOnDrag).toBe(FLOW_CANVAS_BASE_BEHAVIOR.selectNodesOnDrag);
        expect(result.selectionKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.selectionKeyCode);
        expect(result.panOnDrag).toEqual([0, 1, 2]);
        expect(result.panActivationKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panActivationKeyCode);
        expect(result.zoomActivationKeyCode).toEqual(FLOW_CANVAS_BASE_BEHAVIOR.zoomActivationKeyCode);
        expect(result.selectionMode).toBeUndefined();
        expect(result.multiSelectionKeyCode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.multiSelectionKeyCode);
        expect(result.zoomOnScroll).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnScroll);
        expect(result.zoomOnPinch).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnPinch);
        expect(result.panOnScroll).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panOnScroll);
        expect(result.panOnScrollMode).toBe(FLOW_CANVAS_BASE_BEHAVIOR.panOnScrollMode);
        expect(result.preventScrolling).toBe(FLOW_CANVAS_BASE_BEHAVIOR.preventScrolling);
        expect(result.zoomOnDoubleClick).toBe(FLOW_CANVAS_BASE_BEHAVIOR.zoomOnDoubleClick);
        expect(result.defaultEdgeOptions).toEqual(FLOW_CANVAS_STYLE_PRESETS.standard.defaultEdgeOptions);
        expect(result.background).toEqual(FLOW_CANVAS_STYLE_PRESETS.standard.background);
    });
});
