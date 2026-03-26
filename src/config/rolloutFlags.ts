export type RolloutFlagKey =
    | 'relationSemanticsV1'
    | 'documentModelV2'
    | 'collaborationEnabled'
    | 'architectureLintEnabled';

interface RolloutFlagDefinition {
    key: RolloutFlagKey;
    envVar: string;
    defaultEnabled: boolean;
    description: string;
}

const ROLLOUT_FLAG_DEFINITIONS: Record<RolloutFlagKey, RolloutFlagDefinition> = {
    relationSemanticsV1: {
        key: 'relationSemanticsV1',
        envVar: 'VITE_RELATION_SEMANTICS_V1',
        defaultEnabled: false,
        description: 'Class/ER relation marker and routing semantics rollout',
    },
    documentModelV2: {
        key: 'documentModelV2',
        envVar: 'VITE_DOCUMENT_MODEL_V2',
        defaultEnabled: false,
        description: 'Extended document metadata for scenes, exports, and bindings',
    },
    collaborationEnabled: {
        key: 'collaborationEnabled',
        envVar: 'VITE_COLLABORATION_ENABLED',
        defaultEnabled: true,
        description: 'WebRTC peer collaboration (beta)',
    },
    architectureLintEnabled: {
        key: 'architectureLintEnabled',
        envVar: 'VITE_ARCHITECTURE_LINT_ENABLED',
        defaultEnabled: true,
        description: 'Architecture diagram lint rules panel',
    },
};

function readBooleanEnvFlag(envValue: string | undefined, defaultEnabled: boolean): boolean {
    if (envValue === '1') {
        return true;
    }
    if (envValue === '0') {
        return false;
    }
    return defaultEnabled;
}

export function isRolloutFlagEnabled(key: RolloutFlagKey): boolean {
    const definition = ROLLOUT_FLAG_DEFINITIONS[key];
    if (!definition.envVar) {
        return definition.defaultEnabled;
    }
    const envValue = import.meta.env[definition.envVar as keyof ImportMetaEnv] as string | undefined;
    return readBooleanEnvFlag(envValue, definition.defaultEnabled);
}

export const ROLLOUT_FLAGS: Record<RolloutFlagKey, boolean> = {
    relationSemanticsV1: isRolloutFlagEnabled('relationSemanticsV1'),
    documentModelV2: isRolloutFlagEnabled('documentModelV2'),
    collaborationEnabled: isRolloutFlagEnabled('collaborationEnabled'),
    architectureLintEnabled: isRolloutFlagEnabled('architectureLintEnabled'),
};
