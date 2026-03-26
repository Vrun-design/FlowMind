import { useCallback } from 'react';
import { useFlowStore } from '@/store';
import { buildArchitectureServiceSuggestionPrompt, buildEntityFieldGenerationPrompt } from '@/hooks/ai-generation/nodeActionPrompts';
import type { StudioCodeMode, StudioTab } from '@/hooks/useFlowEditorUIState';
import type { ArchitectureTemplateId } from '@/lib/architectureTemplates';

interface UseFlowEditorPanelActionsParams {
    handleFocusedAIRequest: (prompt: string, selectedNodeIds?: string[]) => Promise<boolean>;
    setStudioTab: (tab: StudioTab) => void;
    setStudioCodeMode: (mode: StudioCodeMode) => void;
    setStudioMode: () => void;
    handleApplyArchitectureTemplate?: (sourceId: string, templateId: ArchitectureTemplateId) => void;
}

interface UseFlowEditorPanelActionsResult {
    handleGenerateEntityFields: (nodeId: string) => Promise<void>;
    handleSuggestArchitectureNode: (nodeId: string) => Promise<void>;
    handleOpenMermaidCodeEditor: () => void;
    applyArchitectureTemplate: (sourceId: string, templateId: ArchitectureTemplateId) => void;
}

export function useFlowEditorPanelActions({
    handleFocusedAIRequest,
    setStudioTab,
    setStudioCodeMode,
    setStudioMode,
    handleApplyArchitectureTemplate,
}: UseFlowEditorPanelActionsParams): UseFlowEditorPanelActionsResult {
    const handleGenerateEntityFields = useCallback(async (nodeId: string) => {
        const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === nodeId);
        if (!node) {
            return;
        }

        await handleFocusedAIRequest(buildEntityFieldGenerationPrompt(node), [nodeId]);
    }, [handleFocusedAIRequest]);

    const handleSuggestArchitectureNode = useCallback(async (nodeId: string) => {
        const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === nodeId);
        if (!node) {
            return;
        }

        await handleFocusedAIRequest(buildArchitectureServiceSuggestionPrompt(node), [nodeId]);
    }, [handleFocusedAIRequest]);

    const handleOpenMermaidCodeEditor = useCallback(() => {
        setStudioTab('code');
        setStudioCodeMode('mermaid');
        setStudioMode();
    }, [setStudioCodeMode, setStudioMode, setStudioTab]);

    const applyArchitectureTemplate = useCallback((sourceId: string, templateId: ArchitectureTemplateId) => {
        handleApplyArchitectureTemplate?.(sourceId, templateId);
    }, [handleApplyArchitectureTemplate]);

    return {
        handleGenerateEntityFields,
        handleSuggestArchitectureNode,
        handleOpenMermaidCodeEditor,
        applyArchitectureTemplate,
    };
}
