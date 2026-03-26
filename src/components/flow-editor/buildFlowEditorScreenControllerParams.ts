import type React from 'react';
import {
    buildFlowEditorControllerChromeParams,
    buildFlowEditorControllerPanelsParams,
    buildFlowEditorControllerShellParams,
    buildFlowEditorControllerStudioParams,
} from './buildFlowEditorControllerParams';
import type { UseFlowEditorControllerParams } from './useFlowEditorController';

type BuildShellParams = Parameters<typeof buildFlowEditorControllerShellParams>[0] & {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

type BuildStudioParams = Parameters<typeof buildFlowEditorControllerStudioParams>[0];
type BuildPanelsParams = Parameters<typeof buildFlowEditorControllerPanelsParams>[0];
type BuildChromeParams = Parameters<typeof buildFlowEditorControllerChromeParams>[0];

interface BuildFlowEditorScreenControllerParamsInput {
    shell: BuildShellParams;
    studio: BuildStudioParams;
    panels: BuildPanelsParams;
    chrome: BuildChromeParams;
}

export function buildFlowEditorScreenControllerParams({
    shell,
    studio,
    panels,
    chrome,
}: BuildFlowEditorScreenControllerParamsInput): UseFlowEditorControllerParams {
    return {
        shell: {
            ...buildFlowEditorControllerShellParams(shell),
            fileInputRef: shell.fileInputRef,
        },
        studio: buildFlowEditorControllerStudioParams(studio),
        panels: buildFlowEditorControllerPanelsParams(panels),
        chrome: buildFlowEditorControllerChromeParams(chrome),
    };
}
