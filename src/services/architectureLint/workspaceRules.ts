const WORKSPACE_RULES_KEY = 'openflowkit:workspace-lint-rules';
export const WORKSPACE_RULES_CHANGED_EVENT = 'openflowkit:workspace-lint-rules-changed';

export function loadWorkspaceRules(): string {
    try {
        return localStorage.getItem(WORKSPACE_RULES_KEY) ?? '';
    } catch {
        return '';
    }
}

function notifyWorkspaceRulesChanged(): void {
    window.dispatchEvent(new CustomEvent(WORKSPACE_RULES_CHANGED_EVENT));
}

export function saveWorkspaceRules(json: string): void {
    try {
        if (json.trim()) {
            localStorage.setItem(WORKSPACE_RULES_KEY, json);
        } else {
            localStorage.removeItem(WORKSPACE_RULES_KEY);
        }
    } catch { /* storage unavailable */ }
    notifyWorkspaceRulesChanged();
}

export function clearWorkspaceRules(): void {
    try {
        localStorage.removeItem(WORKSPACE_RULES_KEY);
    } catch { /* storage unavailable */ }
    notifyWorkspaceRulesChanged();
}
