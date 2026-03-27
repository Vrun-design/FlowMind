import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CinematicRenderState } from '@/services/export/cinematicRenderState';

const EMPTY_SET = new Set<string>();

function createInactiveRenderState(): CinematicRenderState {
  return {
    active: false,
    backgroundMode: 'light',
    visibleNodeIds: EMPTY_SET,
    builtEdgeIds: EMPTY_SET,
    visibleEdgeIds: EMPTY_SET,
    activeNodeId: null,
    activeNodeProgress: 0,
    activeEdgeId: null,
    activeEdgeProgress: 0,
    currentSegment: null,
  };
}

export interface CinematicExportSurfaceConfig {
  width: number;
  height: number;
}

interface CinematicExportContextValue {
  renderState: CinematicRenderState;
  surfaceConfig: CinematicExportSurfaceConfig | null;
  setRenderState: (nextState: CinematicRenderState) => void;
  setSurfaceConfig: (nextConfig: CinematicExportSurfaceConfig | null) => void;
  resetRenderState: () => void;
}

const INACTIVE_CONTEXT_VALUE: CinematicExportContextValue = {
  renderState: createInactiveRenderState(),
  surfaceConfig: null,
  setRenderState: () => undefined,
  setSurfaceConfig: () => undefined,
  resetRenderState: () => undefined,
};

const CinematicExportContext = createContext<CinematicExportContextValue>(INACTIVE_CONTEXT_VALUE);

export function CinematicExportProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [renderState, setRenderStateState] = useState<CinematicRenderState>(() => createInactiveRenderState());
  const [surfaceConfig, setSurfaceConfigState] = useState<CinematicExportSurfaceConfig | null>(null);

  const value = useMemo<CinematicExportContextValue>(() => ({
    renderState,
    surfaceConfig,
    setRenderState: (nextState) => setRenderStateState(nextState),
    setSurfaceConfig: (nextConfig) => setSurfaceConfigState(nextConfig),
    resetRenderState: () => {
      setRenderStateState(createInactiveRenderState());
      setSurfaceConfigState(null);
    },
  }), [renderState, surfaceConfig]);

  return (
    <CinematicExportContext.Provider value={value}>
      {children}
    </CinematicExportContext.Provider>
  );
}

function useCinematicExportContext(): CinematicExportContextValue {
  return useContext(CinematicExportContext);
}

export function useCinematicExportState(): CinematicRenderState {
  return useCinematicExportContext().renderState;
}

export function useCinematicExportSurfaceConfig(): CinematicExportSurfaceConfig | null {
  return useCinematicExportContext().surfaceConfig;
}

export function useCinematicExportActions(): Pick<CinematicExportContextValue, 'setRenderState' | 'setSurfaceConfig' | 'resetRenderState'> {
  const { setRenderState, setSurfaceConfig, resetRenderState } = useCinematicExportContext();
  return {
    setRenderState,
    setSurfaceConfig,
    resetRenderState,
  };
}
