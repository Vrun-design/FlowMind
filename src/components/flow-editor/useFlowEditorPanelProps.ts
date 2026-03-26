import type { FlowEditorPanelsProps } from '@/components/FlowEditorPanels';
import {
    buildFlowEditorPanelsProps,
    type BuildFlowEditorPanelsPropsParams,
} from './panelProps';

export function useFlowEditorPanelProps(
    params: BuildFlowEditorPanelsPropsParams
): FlowEditorPanelsProps {
    return buildFlowEditorPanelsProps(params);
}
