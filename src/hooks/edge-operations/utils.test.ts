import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import {
  buildConnectedMindmapTopic,
  buildConnectedEdge,
  buildConnectedNode,
  findClosestHandleTarget,
  getAddedNodeContent,
  getOppositeTargetHandle,
  isDuplicateConnection,
  resolveConnectEndAction,
} from './utils';

const processNode: FlowNode = {
  id: 'node-1',
  type: 'process',
  position: { x: 100, y: 100 },
  data: { label: 'Process' },
};

const textNode: FlowNode = {
  id: 'text-1',
  type: 'text',
  position: { x: 300, y: 100 },
  data: { label: 'Text' },
};

describe('edge operation utils', () => {
  it('detects duplicate connections by endpoints and handles', () => {
    const edges: FlowEdge[] = [
      {
        id: 'e-1',
        source: 'a',
        target: 'b',
        sourceHandle: 'right',
        targetHandle: 'left',
      },
    ];

    expect(
      isDuplicateConnection(edges, {
        source: 'a',
        target: 'b',
        sourceHandle: 'right',
        targetHandle: 'left',
      })
    ).toBe(true);

    expect(
      isDuplicateConnection(edges, {
        source: 'a',
        target: 'b',
        sourceHandle: 'bottom',
        targetHandle: 'top',
      })
    ).toBe(false);
  });

  it('finds the closest node handle near the drop position', () => {
    expect(findClosestHandleTarget([processNode], { x: 350, y: 175 })).toEqual({
      nodeId: 'node-1',
      handleId: 'right',
      dist: 0,
    });

    expect(findClosestHandleTarget([processNode], { x: 500, y: 500 })).toBeNull();
  });

  it('resolves opposite handle ids using node-specific handle conventions', () => {
    expect(getOppositeTargetHandle(processNode, 'right')).toBe('left');
    expect(getOppositeTargetHandle(textNode, 'right')).toBe('target-left');
    expect(getOppositeTargetHandle(processNode, null)).toBeNull();
  });

  it('builds translated annotation content and journey defaults', () => {
    expect(
      getAddedNodeContent('annotation', {
        noteLabel: 'Note',
        noteSubLabel: 'Add comments here',
      })
    ).toEqual({
      label: 'Note',
      subLabel: 'Add comments here',
      icon: 'StickyNote',
    });

    expect(
      getAddedNodeContent('journey', {
        noteLabel: 'Ignored',
        noteSubLabel: 'Ignored',
      })
    ).toEqual({
      label: 'User Journey',
      subLabel: 'User',
    });
  });

  it('builds connected nodes and default edges without changing runtime defaults', () => {
    const { newNode: journeyNode } = buildConnectedNode({
      type: 'journey',
      position: { x: 10, y: 20 },
      labels: {
        noteLabel: 'Note',
        noteSubLabel: 'Add comments here',
      },
    });

    expect(journeyNode.type).toBe('journey');
    expect(journeyNode.position).toEqual({ x: 10, y: 20 });
    expect(journeyNode.data.journeyTask).toBe('User Journey');

    const { newNode: annotationNode } = buildConnectedNode({
      type: 'annotation',
      position: { x: 20, y: 30 },
      labels: {
        noteLabel: 'Note',
        noteSubLabel: 'Add comments here',
      },
    });

    expect(annotationNode.type).toBe('annotation');
    expect(annotationNode.data.icon).toBe('StickyNote');

    expect(buildConnectedEdge('source', 'target', 'right', 'left')).toMatchObject({
      id: 'e-source-target',
      source: 'source',
      target: 'target',
      sourceHandle: 'right',
      targetHandle: 'left',
    });
  });

  it('inherits architecture provider metadata when connector-creating a new node', () => {
    const sourceArchitectureNode: FlowNode = {
      id: 'arch-source',
      type: 'architecture',
      position: { x: 100, y: 100 },
      data: {
        label: 'FlowMind API',
        archProvider: 'custom',
        archProviderLabel: 'FlowMind',
        customIconUrl: 'data:image/svg+xml;base64,abc',
        archEnvironment: 'production',
        archZone: 'ap-south-1',
      },
    };

    const { newNode } = buildConnectedNode({
      type: 'architecture',
      position: { x: 350, y: 100 },
      sourceNode: sourceArchitectureNode,
      labels: {
        noteLabel: 'Note',
        noteSubLabel: 'Add comments here',
      },
    });

    expect(newNode.type).toBe('architecture');
    expect(newNode.data.archProvider).toBe('custom');
    expect(newNode.data.archProviderLabel).toBe('FlowMind');
    expect(newNode.data.customIconUrl).toBe('data:image/svg+xml;base64,abc');
    expect(newNode.data.archEnvironment).toBe('production');
    expect(newNode.data.archZone).toBe('ap-south-1');
  });

  it('builds and relayouts a connected mindmap topic from the source branch', () => {
    const rootNode: FlowNode = {
      id: 'root',
      type: 'mindmap',
      position: { x: 400, y: 260 },
      data: {
        label: 'Root',
        color: 'slate',
        shape: 'rounded',
        mindmapDepth: 0,
        mindmapBranchStyle: 'curved',
      },
      selected: true,
    };

    const childNode: FlowNode = {
      id: 'child',
      type: 'mindmap',
      position: { x: 680, y: 260 },
      data: {
        label: 'Child',
        color: 'slate',
        shape: 'rounded',
        mindmapDepth: 1,
        mindmapParentId: 'root',
        mindmapSide: 'right',
      },
      selected: false,
    };

    const result = buildConnectedMindmapTopic({
      nodes: [rootNode, childNode],
      edges: [
        {
          id: 'e-root-child',
          source: 'root',
          target: 'child',
        },
      ],
      sourceNode: rootNode,
      sourceHandle: 'right',
      sourceId: 'root',
      position: { x: 720, y: 320 },
    });

    expect(result.nextNode.type).toBe('mindmap');
    expect(result.nextNode.data.mindmapParentId).toBe('root');
    expect(result.nextNode.data.mindmapSide).toBe('right');
    expect(result.insertedEdge.source).toBe('root');
    expect(result.insertedEdge.target).toBe(result.nextNode.id);
    expect(result.nextNodes.find((node) => node.id === 'root')?.position).toEqual({ x: 400, y: 260 });
  });

  it('resolves connect-end autosnap, default add, and menu fallbacks', () => {
    const autosnap = resolveConnectEndAction({
      nodes: [processNode],
      edges: [],
      sourceId: 'source',
      sourceHandle: 'right',
      position: { x: 350, y: 175 },
      clientPosition: { x: 10, y: 20 },
      targetIsPane: true,
      canvasInteractionsV1Enabled: false,
    });

    expect(autosnap).toEqual({
      type: 'connect',
      connection: {
        source: 'source',
        sourceHandle: 'right',
        target: 'node-1',
        targetHandle: 'right',
      },
    });

    const add = resolveConnectEndAction({
      nodes: [{
        id: 'mind-root',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { label: 'Root', mindmapDepth: 0 },
      }],
      edges: [],
      sourceId: 'mind-root',
      sourceHandle: 'right',
      position: { x: 600, y: 600 },
      clientPosition: { x: 30, y: 40 },
      targetIsPane: true,
      canvasInteractionsV1Enabled: false,
    });

    expect(add).toEqual({
      type: 'add',
      nodeType: 'mindmap',
      position: { x: 600, y: 600 },
    });

    const menu = resolveConnectEndAction({
      nodes: [processNode],
      edges: [],
      sourceId: 'node-1',
      sourceHandle: 'right',
      position: { x: 600, y: 600 },
      clientPosition: { x: 30, y: 40 },
      targetIsPane: true,
      canvasInteractionsV1Enabled: false,
    });

    expect(menu).toEqual({
      type: 'menu',
      clientPosition: { x: 30, y: 40 },
      sourceType: 'process',
    });

    const iconAssetMenu = resolveConnectEndAction({
      nodes: [{
        id: 'icon-1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Athena', assetPresentation: 'icon' },
      }],
      edges: [],
      sourceId: 'icon-1',
      sourceHandle: 'right',
      position: { x: 600, y: 600 },
      clientPosition: { x: 50, y: 60 },
      targetIsPane: true,
      canvasInteractionsV1Enabled: true,
    });

    expect(iconAssetMenu).toEqual({
      type: 'menu',
      clientPosition: { x: 50, y: 60 },
      sourceType: 'custom',
    });
  });
});
