import { useMemo } from 'react';
import { useViewport } from '@/lib/reactflowCompat';
import type { ViewSettings } from '@/store/types';
import {
  isFarZoomReductionActiveForProfile,
  isLowDetailModeActiveForProfile,
} from './largeGraphSafetyMode';

interface UseFlowCanvasZoomLodParams {
  safetyModeActive: boolean;
  largeGraphSafetyProfile: ViewSettings['largeGraphSafetyProfile'];
}

interface FlowCanvasZoomLodState {
  lowDetailModeActive: boolean;
  farZoomReductionActive: boolean;
}

export function useFlowCanvasZoomLod({
  safetyModeActive,
  largeGraphSafetyProfile,
}: UseFlowCanvasZoomLodParams): FlowCanvasZoomLodState {
  const { zoom } = useViewport();
  const lowDetailModeActive = useMemo(() =>
    isLowDetailModeActiveForProfile(
      safetyModeActive,
      zoom,
      largeGraphSafetyProfile
    ),
    [largeGraphSafetyProfile, safetyModeActive, zoom]
  );
  const farZoomReductionActive = useMemo(() =>
    isFarZoomReductionActiveForProfile(
      safetyModeActive,
      zoom,
      largeGraphSafetyProfile
    ),
    [largeGraphSafetyProfile, safetyModeActive, zoom]
  );

  return {
    lowDetailModeActive,
    farZoomReductionActive,
  };
}
