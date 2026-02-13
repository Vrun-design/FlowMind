import { useFlowStore } from '../store';
import { useMemo } from 'react';
import { DesignSystem } from '../types';

export const useDesignSystem = (): DesignSystem => {
    const { designSystems, activeDesignSystemId } = useFlowStore();

    const activeSystem = useMemo(() => {
        return designSystems.find(ds => ds.id === activeDesignSystemId) || designSystems[0];
    }, [designSystems, activeDesignSystemId]);

    return activeSystem;
};
