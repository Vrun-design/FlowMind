import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '@/lib/logger';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { ChatMessage } from '@/services/aiService';
import { useFlowStore } from '@/store';
import { useToast } from '@/components/ui/ToastContext';
import { toErrorMessage } from './ai-generation/graphComposer';
import {
  appendChatExchange,
  generateAIFlowResult,
  type GenerateAIFlowResult,
} from './ai-generation/requestLifecycle';
import { buildCodeToArchitecturePrompt, type SupportedLanguage } from './ai-generation/codeToArchitecture';
import { buildSqlToErdPrompt } from './ai-generation/sqlToErd';
import { buildTerraformToCloudPrompt, type TerraformInputFormat } from './ai-generation/terraformToCloud';
import { buildOpenApiToSequencePrompt } from './ai-generation/openApiToSequence';
import { getAIReadinessState } from './ai-generation/readiness';
import { clearChatHistory, loadChatHistory, saveChatHistory } from './ai-generation/chatHistoryStorage';
import { notifyOperationOutcome } from '@/services/operationFeedback';

const logger = createLogger({ scope: 'useAIGeneration' });

export interface ImportDiff {
  addedCount: number;
  removedCount: number;
  updatedCount: number;
  result: GenerateAIFlowResult;
}

function computeImportDiff(currentNodes: FlowNode[], result: GenerateAIFlowResult): ImportDiff {
  const currentIds = new Set(currentNodes.map((n) => n.id));
  const newIds = new Set(result.layoutedNodes.map((n) => n.id));
  return {
    addedCount: result.layoutedNodes.filter((n) => !currentIds.has(n.id)).length,
    removedCount: currentNodes.filter((n) => !newIds.has(n.id)).length,
    updatedCount: result.layoutedNodes.filter((n) => currentIds.has(n.id)).length,
    result,
  };
}

function getSuccessSummary(existingNodeCount: number, focusedNodeIds?: string[]): string {
  if ((focusedNodeIds?.length ?? 0) > 0) {
    return 'Applied AI changes to the selected nodes.';
  }

  if (existingNodeCount > 0) {
    return 'Applied AI changes to the current diagram.';
  }

  return 'Created a new AI diagram draft.';
}

function getFailureSummary(existingNodeCount: number, focusedNodeIds?: string[]): string {
  if ((focusedNodeIds?.length ?? 0) > 0) {
    return 'Could not update the selected nodes.';
  }

  if (existingNodeCount > 0) {
    return 'Could not update the current diagram.';
  }

  return 'Could not generate the requested diagram.';
}

export function useAIGeneration(
  recordHistory: () => void,
  applyComposedGraph: (nodes: FlowNode[], edges: FlowEdge[]) => void
) {
  const { nodes, edges, aiSettings, globalEdgeOptions, activeTabId } = useFlowStore();
  const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingDiff, setPendingDiff] = useState<ImportDiff | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadChatHistory(activeTabId));

  useEffect(() => {
    setChatMessages(loadChatHistory(activeTabId));
  }, [activeTabId]);
  const [lastError, setLastError] = useState<string | null>(null);
  const readiness = getAIReadinessState(aiSettings);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearChat = useCallback(() => {
    clearChatHistory(activeTabId);
    setChatMessages([]);
  }, [activeTabId]);

  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  const confirmPendingDiff = useCallback(() => {
    if (!pendingDiff) return;
    recordHistory();
    applyComposedGraph(pendingDiff.result.layoutedNodes, pendingDiff.result.layoutedEdges);
    notifyOperationOutcome(addToast, { status: 'success', summary: 'Import applied to canvas.' });
    setPendingDiff(null);
  }, [pendingDiff, applyComposedGraph, addToast, recordHistory]);

  const discardPendingDiff = useCallback(() => {
    setPendingDiff(null);
  }, []);

  const runAIRequest = useCallback(async (
    prompt: string,
    imageBase64?: string,
    focusedNodeIds?: string[],
    showPreview = false,
  ): Promise<boolean> => {
    if (!readiness.canGenerate && readiness.blockingIssue) {
      setLastError(readiness.blockingIssue.detail);
      notifyOperationOutcome(addToast, {
        status: readiness.blockingIssue.tone,
        summary: readiness.blockingIssue.title,
        detail: readiness.blockingIssue.detail,
      });
      return false;
    }

    setLastError(null);
    setStreamingText('');
    setRetryCount(0);
    if (!showPreview) recordHistory();
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await generateAIFlowResult({
        chatMessages,
        prompt,
        imageBase64,
        nodes,
        edges,
        selectedNodeIds: focusedNodeIds ?? selectedNodeIds,
        aiSettings,
        globalEdgeOptions,
        onChunk: (delta) => setStreamingText((prev) => (prev ?? '') + delta),
        onRetry: (attempt) => {
          setRetryCount(attempt);
          setStreamingText('');
        },
        signal: controller.signal,
      });

      const { dslText, userMessage, layoutedNodes, layoutedEdges } = result;
      const isEditMode = nodes.length > 0;
      setChatMessages((previousMessages) => {
        const next = appendChatExchange(previousMessages, userMessage, dslText, isEditMode);
        saveChatHistory(activeTabId, next);
        return next;
      });

      if (showPreview) {
        setPendingDiff(computeImportDiff(nodes, result));
        notifyOperationOutcome(addToast, { status: 'success', summary: 'Import ready — review changes before applying.' });
      } else {
        applyComposedGraph(layoutedNodes, layoutedEdges);
        notifyOperationOutcome(addToast, {
          status: 'success',
          summary: getSuccessSummary(nodes.length, focusedNodeIds),
        });
      }
      return true;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false;
      }
      const errorMessage = toErrorMessage(error);
      logger.error('AI generation failed.', { error });
      setLastError(errorMessage);
      notifyOperationOutcome(addToast, {
        status: 'error',
        summary: getFailureSummary(nodes.length, focusedNodeIds),
        detail: errorMessage,
      });
      return false;
    } finally {
      abortControllerRef.current = null;
      setIsGenerating(false);
      setStreamingText(null);
      setRetryCount(0);
    }
  }, [
    addToast,
    aiSettings,
    activeTabId,
    chatMessages,
    edges,
    globalEdgeOptions,
    readiness,
    nodes,
    selectedNodeIds,
    recordHistory,
    applyComposedGraph,
  ]);

  const handleAIRequest = useCallback(async (prompt: string, imageBase64?: string): Promise<boolean> => {
    return runAIRequest(prompt, imageBase64);
  }, [runAIRequest]);

  const handleFocusedAIRequest = useCallback(async (prompt: string, focusedNodeIds: string[], imageBase64?: string): Promise<boolean> => {
    return runAIRequest(prompt, imageBase64, focusedNodeIds);
  }, [runAIRequest]);

  const handleCodeAnalysis = useCallback(async (code: string, language: SupportedLanguage): Promise<boolean> => {
    return runAIRequest(buildCodeToArchitecturePrompt({ code, language }), undefined, undefined, true);
  }, [runAIRequest]);

  const handleSqlAnalysis = useCallback(async (sql: string): Promise<boolean> => {
    return runAIRequest(buildSqlToErdPrompt(sql), undefined, undefined, true);
  }, [runAIRequest]);

  const handleTerraformAnalysis = useCallback(async (input: string, format: TerraformInputFormat): Promise<boolean> => {
    return runAIRequest(buildTerraformToCloudPrompt(input, format), undefined, undefined, true);
  }, [runAIRequest]);

  const handleOpenApiAnalysis = useCallback(async (spec: string): Promise<boolean> => {
    return runAIRequest(buildOpenApiToSequencePrompt(spec), undefined, undefined, true);
  }, [runAIRequest]);

  return {
    isGenerating,
    streamingText,
    retryCount,
    cancelGeneration,
    pendingDiff,
    confirmPendingDiff,
    discardPendingDiff,
    readiness,
    lastError,
    handleAIRequest,
    handleFocusedAIRequest,
    handleCodeAnalysis,
    handleSqlAnalysis,
    handleTerraformAnalysis,
    handleOpenApiAnalysis,
    chatMessages,
    clearChat,
    clearLastError,
  };
}
