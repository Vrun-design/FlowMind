import { useState, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { generateDiagramFromPrompt } from '../services/geminiService';
import { parseFlowMindDSL } from '../services/flowmindDSLParser';
import { getElkLayout } from '../services/elkLayout';
import { createDefaultEdge } from '../constants';
import { useFlowStore } from '../store';

import { useToast } from '../components/ui/ToastContext';

export const useAIGeneration = (
  recordHistory: () => void
) => {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const { fitView } = useReactFlow();
  const { addToast } = useToast();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIRequest = useCallback(async (prompt: string) => {
    recordHistory();
    setIsGenerating(true);
    try {
      // ... logic ...
      // 1. Prepare context
      const simplifiedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
        description: n.data.subLabel,
        x: n.position.x,
        y: n.position.y
      }));

      const currentGraph = JSON.stringify({
        nodes: simplifiedNodes,
        edges: edges.map((e) => ({ source: e.source, target: e.target, label: e.label })),
      });

      const selectedNodes = simplifiedNodes.filter(n => nodes.find(orig => orig.id === n.id)?.selected);
      const focusedContextJSON = selectedNodes.length > 0 ? JSON.stringify(selectedNodes) : undefined;

      // 2. Call AI (now returns DSL string)
      const dslText = await generateDiagramFromPrompt(prompt, currentGraph, focusedContextJSON);

      // 3. Parse DSL
      // Strip markdown code blocks if present
      const cleanDSL = dslText.replace(/```(yaml|flowmind|)?/g, '').replace(/```/g, '').trim();
      const parseResult = parseFlowMindDSL(cleanDSL);

      if (parseResult.error) {
        throw new Error(parseResult.error);
      }

      // 4. Merge Logic: Preserve IDs for existing labels
      const mergedNodes = parseResult.nodes.map(newNode => {
        const existingNode = nodes.find(n => n.data.label?.toLowerCase() === newNode.data.label?.toLowerCase());
        if (existingNode) {
          return {
            ...newNode,
            id: existingNode.id, // Keep old ID
            data: {
              ...newNode.data,
              // Optional: keep other existing data?
            }
          };
        }
        return newNode;
      });

      // Update edges to use the preserved IDs
      // The parser generates edges based on new IDs. We need to remap them if IDs changed.
      // Actually, parseResult.edges use the IDs from parseResult.nodes.
      // If we change a node's ID, we must update connected edges.

      // Better strategy: Create a map of OldID -> NewID (or vice versa? No, we want to use OldID).
      // Let's create a map of "ParserID" -> "FinalID".
      const idMap = new Map<string, string>();

      parseResult.nodes.forEach(newNode => {
        const existingNode = nodes.find(n => n.data.label?.toLowerCase() === newNode.data.label?.toLowerCase());
        if (existingNode) {
          idMap.set(newNode.id, existingNode.id);
        } else {
          idMap.set(newNode.id, newNode.id);
        }
      });

      const finalNodes = parseResult.nodes.map(n => ({
        ...n,
        id: idMap.get(n.id)!,
        // Ensure type defaults
        type: n.type || 'process'
      }));

      const finalEdges = parseResult.edges.map(e => ({
        ...e,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        id: `e-${idMap.get(e.source)}-${idMap.get(e.target)}` // Re-generate ID based on final IDs to be safe
      }));


      // 5. Apply Auto-Layout (ELK)
      // DSL parser gives basic grid positions, but ELK is better.
      const layoutedNodes = await getElkLayout(finalNodes, finalEdges, {
        direction: 'TB', // Could parse direction from DSL title/metadata if needed
        algorithm: 'layered',
        spacing: 'normal'
      });

      setNodes(layoutedNodes);
      setEdges(finalEdges);
      setIsAIOpen(false);

      // Wait for render then fit view
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);

      addToast('Diagram generated successfully!', 'success');
    } catch (error) {
      console.error('AI Generation failed:', error);
      addToast('Failed to generate diagram. Please check your API key or try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, recordHistory, setNodes, setEdges, fitView, addToast]);

  return { isAIOpen, setIsAIOpen, isGenerating, handleAIRequest };
};
