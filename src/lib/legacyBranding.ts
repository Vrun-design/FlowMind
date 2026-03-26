const LEGACY_FLOWMIND_NAMESPACE = 'flowmind';

export const LEGACY_STORAGE_KEYS = {
    clipboard: `${LEGACY_FLOWMIND_NAMESPACE}-clipboard`,
    styleClipboard: `${LEGACY_FLOWMIND_NAMESPACE}-style-clipboard`,
    snapshots: `${LEGACY_FLOWMIND_NAMESPACE}_snapshots`,
} as const;

export const LEGACY_EVENT_NAMES = {
    nodeLabelEditRequest: `${LEGACY_FLOWMIND_NAMESPACE}:node-label-edit-request`,
    nodeQuickCreateRequest: `${LEGACY_FLOWMIND_NAMESPACE}:node-quick-create-request`,
    mindmapTopicActionRequest: `${LEGACY_FLOWMIND_NAMESPACE}:mindmap-topic-action-request`,
} as const;

export const LEGACY_COLLABORATION_KEYS = {
    identity: `${LEGACY_FLOWMIND_NAMESPACE}:collab-identity-v1`,
    roomSecretPrefix: `${LEGACY_FLOWMIND_NAMESPACE}:collab-room-secret:`,
    clientIdPrefix: `${LEGACY_FLOWMIND_NAMESPACE}:collab-client-id:`,
    indexedDbPrefix: `${LEGACY_FLOWMIND_NAMESPACE}-collab:`,
} as const;

export const LEGACY_DSL_CODE_FENCE_ALIASES = ['flowmind'] as const;
