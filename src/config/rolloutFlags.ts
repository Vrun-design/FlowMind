export type RolloutFlagKey =
    | 'visualQualityV2'
    | 'mermaidSyncV1'
    | 'codeToArchitectureV1'
    | 'familyPluginV1'
    | 'connectorModelV1'
    | 'relationSemanticsV1'
    | 'stateDiagramV1'
    | 'indexedDbStorageV1'
    | 'canvasInteractionsV1'
    | 'shapeLibraryV1'
    | 'templateLibraryV1'
    | 'collaborationV1'
    | 'collaborationIndexedDbV1'
    | 'animationTimelineV1'
    | 'playbackStudioV1'
    | 'animatedExportV1'
    | 'importAdaptersV1'
    | 'terraformImportV1'
    | 'openApiImportV1'
    | 'liveBindingsV1'
    | 'documentModelV2';

interface RolloutFlagDefinition {
    key: RolloutFlagKey;
    envVar: string;
    defaultEnabled: boolean;
    description: string;
}

const ROLLOUT_FLAG_DEFINITIONS: Record<RolloutFlagKey, RolloutFlagDefinition> = {
    visualQualityV2: {
        key: 'visualQualityV2',
        envVar: 'VITE_VISUAL_QUALITY_V2',
        defaultEnabled: true,
        description: 'Phase 0 visual quality rollout',
    },
    mermaidSyncV1: {
        key: 'mermaidSyncV1',
        envVar: 'VITE_MERMAID_SYNC_V1',
        defaultEnabled: true,
        description: 'Bidirectional Mermaid code panel and diagnostics',
    },
    codeToArchitectureV1: {
        key: 'codeToArchitectureV1',
        envVar: 'VITE_CODE_TO_ARCHITECTURE_V1',
        defaultEnabled: true,
        description: 'Generate architecture diagrams from pasted source code',
    },
    familyPluginV1: {
        key: 'familyPluginV1',
        envVar: 'VITE_FAMILY_PLUGIN_V1',
        defaultEnabled: false,
        description: 'Diagram family plugin routing rollout',
    },
    connectorModelV1: {
        key: 'connectorModelV1',
        envVar: 'VITE_CONNECTOR_MODEL_V1',
        defaultEnabled: false,
        description: 'Unified custom renderer coverage for all regular connector styles',
    },
    relationSemanticsV1: {
        key: 'relationSemanticsV1',
        envVar: 'VITE_RELATION_SEMANTICS_V1',
        defaultEnabled: false,
        description: 'Class/ER relation marker and routing semantics rollout',
    },
    stateDiagramV1: {
        key: 'stateDiagramV1',
        envVar: 'VITE_STATE_DIAGRAM_V1',
        defaultEnabled: true,
        description: 'Dedicated state diagram plugin dispatch rollout',
    },
    indexedDbStorageV1: {
        key: 'indexedDbStorageV1',
        envVar: 'VITE_INDEXEDDB_STORAGE_V1',
        defaultEnabled: true,
        description: 'IndexedDB storage abstraction scaffold rollout',
    },
    canvasInteractionsV1: {
        key: 'canvasInteractionsV1',
        envVar: 'VITE_CANVAS_INTERACTIONS_V1',
        defaultEnabled: true,
        description: 'Canvas micro-interactions rollout (double-click create, drag-create/connect)',
    },
    shapeLibraryV1: {
        key: 'shapeLibraryV1',
        envVar: 'VITE_SHAPE_LIBRARY_V1',
        defaultEnabled: true,
        description: 'Shape library registry scaffold rollout',
    },
    templateLibraryV1: {
        key: 'templateLibraryV1',
        envVar: 'VITE_TEMPLATE_LIBRARY_V1',
        defaultEnabled: true,
        description: 'Template registry rollout',
    },
    collaborationV1: {
        key: 'collaborationV1',
        envVar: 'VITE_COLLABORATION_V1',
        defaultEnabled: true,
        description: 'Real-time collaboration scaffold rollout',
    },
    collaborationIndexedDbV1: {
        key: 'collaborationIndexedDbV1',
        envVar: 'VITE_COLLABORATION_INDEXEDDB_V1',
        defaultEnabled: true,
        description: 'Local IndexedDB persistence for collaboration rooms',
    },
    animationTimelineV1: {
        key: 'animationTimelineV1',
        envVar: 'VITE_ANIMATION_TIMELINE_V1',
        defaultEnabled: true,
        description: 'Typed playback timeline contracts and sequencing foundation',
    },
    playbackStudioV1: {
        key: 'playbackStudioV1',
        envVar: 'VITE_PLAYBACK_STUDIO_V1',
        defaultEnabled: true,
        description: 'Dedicated playback studio shell and authoring tools',
    },
    animatedExportV1: {
        key: 'animatedExportV1',
        envVar: 'VITE_ANIMATED_EXPORT_V1',
        defaultEnabled: true,
        description: 'Animated diagram export pipeline',
    },
    importAdaptersV1: {
        key: 'importAdaptersV1',
        envVar: 'VITE_IMPORT_ADAPTERS_V1',
        defaultEnabled: true,
        description: 'External import adapter framework',
    },
    terraformImportV1: {
        key: 'terraformImportV1',
        envVar: 'VITE_TERRAFORM_IMPORT_V1',
        defaultEnabled: true,
        description: 'Terraform graph and plan import pipeline',
    },
    openApiImportV1: {
        key: 'openApiImportV1',
        envVar: 'VITE_OPENAPI_IMPORT_V1',
        defaultEnabled: true,
        description: 'OpenAPI-driven topology import pipeline',
    },
    liveBindingsV1: {
        key: 'liveBindingsV1',
        envVar: 'VITE_LIVE_BINDINGS_V1',
        defaultEnabled: false,
        description: 'Read-only live bindings and runtime overlays',
    },
    documentModelV2: {
        key: 'documentModelV2',
        envVar: 'VITE_DOCUMENT_MODEL_V2',
        defaultEnabled: false,
        description: 'Extended document metadata for scenes, exports, and bindings',
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
    const envValue = import.meta.env[definition.envVar as keyof ImportMetaEnv] as string | undefined;
    return readBooleanEnvFlag(envValue, definition.defaultEnabled);
}

export const ROLLOUT_FLAGS: Record<RolloutFlagKey, boolean> = {
    visualQualityV2: isRolloutFlagEnabled('visualQualityV2'),
    mermaidSyncV1: isRolloutFlagEnabled('mermaidSyncV1'),
    codeToArchitectureV1: isRolloutFlagEnabled('codeToArchitectureV1'),
    familyPluginV1: isRolloutFlagEnabled('familyPluginV1'),
    connectorModelV1: isRolloutFlagEnabled('connectorModelV1'),
    relationSemanticsV1: isRolloutFlagEnabled('relationSemanticsV1'),
    stateDiagramV1: isRolloutFlagEnabled('stateDiagramV1'),
    indexedDbStorageV1: isRolloutFlagEnabled('indexedDbStorageV1'),
    canvasInteractionsV1: isRolloutFlagEnabled('canvasInteractionsV1'),
    shapeLibraryV1: isRolloutFlagEnabled('shapeLibraryV1'),
    templateLibraryV1: isRolloutFlagEnabled('templateLibraryV1'),
    collaborationV1: isRolloutFlagEnabled('collaborationV1'),
    collaborationIndexedDbV1: isRolloutFlagEnabled('collaborationIndexedDbV1'),
    animationTimelineV1: isRolloutFlagEnabled('animationTimelineV1'),
    playbackStudioV1: isRolloutFlagEnabled('playbackStudioV1'),
    animatedExportV1: isRolloutFlagEnabled('animatedExportV1'),
    importAdaptersV1: isRolloutFlagEnabled('importAdaptersV1'),
    terraformImportV1: isRolloutFlagEnabled('terraformImportV1'),
    openApiImportV1: isRolloutFlagEnabled('openApiImportV1'),
    liveBindingsV1: isRolloutFlagEnabled('liveBindingsV1'),
    documentModelV2: isRolloutFlagEnabled('documentModelV2'),
};

export function getRolloutFlagDefinitions(): RolloutFlagDefinition[] {
    return Object.values(ROLLOUT_FLAG_DEFINITIONS);
}
