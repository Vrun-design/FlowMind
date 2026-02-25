import { useCallback } from 'react';
import { Node } from 'reactflow';
import { useFlowStore } from '../store';
import { alignNodes, distributeNodes } from '../services/AlignDistribute';
import { useTranslation } from 'react-i18next';

export const useLayoutOperations = (recordHistory: () => void) => {
    const { t } = useTranslation();
    const { setNodes } = useFlowStore();

    const handleAlignNodes = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        const { nodes } = useFlowStore.getState();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length < 2) return;

        recordHistory();
        const updates = alignNodes(selectedNodes, direction);
        setNodes((nds) => nds.map((n) => {
            const update = updates.find(u => u.id === n.id);
            return update ? { ...n, position: update.position } : n;
        }));
    }, [recordHistory, setNodes]);

    const handleDistributeNodes = useCallback((direction: 'horizontal' | 'vertical') => {
        const { nodes } = useFlowStore.getState();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length < 3) return;

        recordHistory();
        const updates = distributeNodes(selectedNodes, direction);
        setNodes((nds) => nds.map((n) => {
            const update = updates.find(u => u.id === n.id);
            return update ? { ...n, position: update.position } : n;
        }));
    }, [recordHistory, setNodes]);

    const handleGroupNodes = useCallback(() => {
        const { nodes } = useFlowStore.getState();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length < 2) return;

        recordHistory();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedNodes.forEach(n => {
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + (n.width || 150));
            maxY = Math.max(maxY, n.position.y + (n.height || 40));
        });

        const padding = 40;
        const groupNode: Node = {
            id: `group-${Date.now()}`,
            type: 'group',
            position: { x: minX - padding, y: minY - padding },
            style: { width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 },
            data: { label: t('nodes.group'), subLabel: `${selectedNodes.length} ${t('nodes.items')}` },
            selected: true,
            zIndex: -1
        };

        setNodes((nds) => [groupNode, ...nds]);
    }, [recordHistory, setNodes, t]);

    return {
        handleAlignNodes,
        handleDistributeNodes,
        handleGroupNodes
    };
};
