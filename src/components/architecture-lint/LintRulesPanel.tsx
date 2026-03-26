import React, { useCallback, useState } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Code2,
    Download,
    Info,
    Plus,
    Shield,
    ShieldCheck,
    Trash2,
    Globe,
} from 'lucide-react';
import { useFlowStore } from '@/store';
import { useCanvasState } from '@/store/canvasHooks';
import { useArchitectureLint } from '@/context/ArchitectureLintContext';
import { EXAMPLE_LINT_RULES } from '@/services/architectureLint/defaultRules';
import { RULE_LIBRARY } from '@/services/architectureLint/ruleLibrary';
import { loadWorkspaceRules, saveWorkspaceRules } from '@/services/architectureLint/workspaceRules';
import { parseRulesJson } from '@/services/architectureLint/ruleEngine';
import type { LintRule, LintSeverity, LintRuleType, NodeMatcher } from '@/services/architectureLint/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: LintSeverity }): React.ReactElement {
    switch (severity) {
        case 'error':
            return <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />;
        case 'warning':
            return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
        case 'info':
            return <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />;
    }
}

function mergeRulesJson(existing: string, newRules: LintRule[]): string {
    const { rules } = parseRulesJson(existing);
    const merged = [...rules, ...newRules];
    return JSON.stringify({ rules: merged }, null, 2);
}

// ─── NodeMatcher form ────────────────────────────────────────────────────────

type MatcherField = 'labelContains' | 'labelEquals' | 'nodeType' | 'id' | 'none';

function matcherToField(m: NodeMatcher | undefined): { field: MatcherField; value: string } {
    if (!m) return { field: 'none', value: '' };
    if (m.labelContains) return { field: 'labelContains', value: m.labelContains };
    if (m.labelEquals) return { field: 'labelEquals', value: m.labelEquals };
    if (m.nodeType) return { field: 'nodeType', value: m.nodeType };
    if (m.id) return { field: 'id', value: m.id };
    return { field: 'none', value: '' };
}

function fieldToMatcher(field: MatcherField, value: string): NodeMatcher | undefined {
    if (field === 'none' || !value.trim()) return undefined;
    return { [field]: value.trim() };
}

interface NodeMatcherFormProps {
    label: string;
    value: NodeMatcher | undefined;
    onChange: (m: NodeMatcher | undefined) => void;
}

function NodeMatcherForm({ label, value, onChange }: NodeMatcherFormProps): React.ReactElement {
    const { field, value: val } = matcherToField(value);

    function onFieldChange(f: MatcherField): void {
        onChange(fieldToMatcher(f, val));
    }

    function onValueChange(v: string): void {
        onChange(fieldToMatcher(field, v));
    }

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</label>
            <div className="flex gap-1.5">
                <select
                    value={field}
                    onChange={(e) => onFieldChange(e.target.value as MatcherField)}
                    className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                >
                    <option value="none">Any node</option>
                    <option value="labelContains">Label contains</option>
                    <option value="labelEquals">Label equals</option>
                    <option value="nodeType">Node type</option>
                    <option value="id">Node ID</option>
                </select>
                {field !== 'none' && (
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder="value"
                        className="h-7 min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                    />
                )}
            </div>
        </div>
    );
}

// ─── Rule builder form ───────────────────────────────────────────────────────

const RULE_TYPES: { value: LintRuleType; label: string }[] = [
    { value: 'cannot-connect', label: 'Cannot connect' },
    { value: 'must-connect', label: 'Must connect' },
    { value: 'forbidden-cycle', label: 'Forbidden cycle' },
    { value: 'must-have-node', label: 'Must have node' },
    { value: 'node-count', label: 'Node count' },
];

function emptyRule(): LintRule {
    return { id: `rule-${Date.now()}`, severity: 'error', type: 'cannot-connect', description: '' };
}

interface RuleFormProps {
    initial?: LintRule;
    onSave: (r: LintRule) => void;
    onCancel: () => void;
}

function RuleForm({ initial, onSave, onCancel }: RuleFormProps): React.ReactElement {
    const [rule, setRule] = useState<LintRule>(initial ?? emptyRule());

    function set<K extends keyof LintRule>(key: K, val: LintRule[K]): void {
        setRule((r) => ({ ...r, [key]: val }));
    }

    const showTo = ['cannot-connect', 'must-connect'].includes(rule.type);
    const showCount = rule.type === 'node-count';

    return (
        <div className="space-y-3 rounded-[var(--radius-md)] border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Rule ID</label>
                    <input
                        type="text"
                        value={rule.id}
                        onChange={(e) => set('id', e.target.value)}
                        className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Type</label>
                    <select
                        value={rule.type}
                        onChange={(e) => set('type', e.target.value as LintRuleType)}
                        className="h-7 w-full rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                    >
                        {RULE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Description (shown in violations)</label>
                <input
                    type="text"
                    value={rule.description ?? ''}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="e.g. Services must not call databases directly"
                    className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Severity</label>
                <select
                    value={rule.severity}
                    onChange={(e) => set('severity', e.target.value as LintSeverity)}
                    className="h-7 w-full rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                >
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
            </div>

            <NodeMatcherForm
                label={showTo ? 'From node' : 'Node matcher'}
                value={rule.from}
                onChange={(m) => set('from', m)}
            />
            {showTo && (
                <NodeMatcherForm
                    label="To node"
                    value={rule.to}
                    onChange={(m) => set('to', m)}
                />
            )}
            {showCount && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Min count</label>
                        <input
                            type="number"
                            min={0}
                            value={rule.min ?? ''}
                            onChange={(e) => set('min', e.target.value ? Number(e.target.value) : undefined)}
                            className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Max count</label>
                        <input
                            type="number"
                            min={0}
                            value={rule.max ?? ''}
                            onChange={(e) => set('max', e.target.value ? Number(e.target.value) : undefined)}
                            className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-[var(--brand-primary)]"
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex h-7 flex-1 items-center justify-center rounded border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(rule)}
                    className="flex h-7 flex-1 items-center justify-center rounded bg-[var(--brand-primary)] text-[11px] font-medium text-white hover:bg-[var(--brand-primary-600)]"
                >
                    {initial ? 'Update rule' : 'Add rule'}
                </button>
            </div>
        </div>
    );
}

// ─── Rule list row ───────────────────────────────────────────────────────────

interface RuleRowProps {
    rule: LintRule;
    onEdit: () => void;
    onDelete: () => void;
}

function RuleRow({ rule, onEdit, onDelete }: RuleRowProps): React.ReactElement {
    return (
        <div className="flex items-center gap-2 rounded border border-slate-100 bg-white px-2.5 py-2">
            <SeverityIcon severity={rule.severity} />
            <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-slate-700">{rule.description || rule.id}</p>
                <p className="text-[10px] font-mono text-slate-400">{rule.type}</p>
            </div>
            <button onClick={onEdit} className="shrink-0 text-[10px] text-slate-400 hover:text-[var(--brand-primary)]">Edit</button>
            <button onClick={onDelete} className="shrink-0 text-slate-300 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Template library picker ─────────────────────────────────────────────────

interface LibraryPickerProps {
    onApply: (rulesJson: string) => void;
    existingJson: string;
    onClose: () => void;
}

function LibraryPicker({ onApply, existingJson, onClose }: LibraryPickerProps): React.ReactElement {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-700">Rule Templates</p>
                <button onClick={onClose} className="text-[11px] text-slate-400 hover:text-slate-600">Back</button>
            </div>
            <p className="text-[11px] text-slate-400">Pick a template to add to this diagram&apos;s rules.</p>
            {RULE_LIBRARY.map((tpl) => (
                <div key={tpl.id} className="rounded border border-slate-200 bg-white">
                    <button
                        onClick={() => setExpanded(expanded === tpl.id ? null : tpl.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left"
                    >
                        {expanded === tpl.id
                            ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        }
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-slate-700">{tpl.name}</p>
                            <p className="text-[10px] text-slate-400">{tpl.description}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onApply(mergeRulesJson(existingJson, tpl.rules));
                                onClose();
                            }}
                            className="shrink-0 rounded bg-[var(--brand-primary)] px-2 py-0.5 text-[10px] font-medium text-white hover:bg-[var(--brand-primary-600)]"
                        >
                            Add
                        </button>
                    </button>
                    {expanded === tpl.id && (
                        <div className="border-t border-slate-100 px-3 py-2 space-y-1">
                            {tpl.rules.map((r) => (
                                <div key={r.id} className="flex items-center gap-1.5">
                                    <SeverityIcon severity={r.severity} />
                                    <p className="text-[10px] text-slate-600">{r.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Visual rule editor ──────────────────────────────────────────────────────

type EditorMode = 'visual' | 'json';

interface VisualEditorProps {
    rulesJson: string;
    onSave: (json: string) => void;
    onCancel: () => void;
    showLibrary: boolean;
    onToggleLibrary: () => void;
}

function VisualEditor({ rulesJson, onSave, onCancel, showLibrary, onToggleLibrary }: VisualEditorProps): React.ReactElement {
    const [mode, setMode] = useState<EditorMode>('visual');
    const [draft, setDraft] = useState(rulesJson || JSON.stringify({ rules: [] }, null, 2));
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [addingNew, setAddingNew] = useState(false);

    const { rules, error } = parseRulesJson(draft);

    function updateRules(newRules: LintRule[]): void {
        setDraft(JSON.stringify({ rules: newRules }, null, 2));
    }

    function saveRule(r: LintRule, index: number | null): void {
        if (index === null) {
            updateRules([...rules, r]);
            setAddingNew(false);
        } else {
            const updated = rules.map((existing, i) => (i === index ? r : existing));
            updateRules(updated);
            setEditingIndex(null);
        }
    }

    function deleteRule(index: number): void {
        updateRules(rules.filter((_, i) => i !== index));
    }

    if (showLibrary) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 p-3">
                <LibraryPicker
                    existingJson={draft}
                    onApply={(json) => { setDraft(json); onToggleLibrary(); }}
                    onClose={onToggleLibrary}
                />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
                <p className="flex-1 text-xs font-medium text-slate-700">Edit Rules</p>
                <button
                    onClick={() => setMode(mode === 'visual' ? 'json' : 'visual')}
                    className="flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                >
                    <Code2 className="h-3 w-3" />{mode === 'visual' ? 'JSON' : 'Visual'}
                </button>
                <button
                    onClick={onToggleLibrary}
                    className="flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                >
                    <BookOpen className="h-3 w-3" />Templates
                </button>
            </div>

            {mode === 'json' ? (
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    spellCheck={false}
                    className="min-h-[200px] flex-1 resize-none rounded border border-slate-200 bg-white px-3 py-3 font-mono text-xs text-slate-700 outline-none placeholder-slate-300 focus:border-[var(--brand-primary)] custom-scrollbar"
                    placeholder={EXAMPLE_LINT_RULES}
                />
            ) : (
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="rounded border border-red-200 bg-red-50 p-2">
                            <p className="text-[10px] font-mono text-red-600">{error}</p>
                        </div>
                    )}
                    {rules.map((rule, i) => (
                        editingIndex === i ? (
                            <RuleForm
                                key={rule.id}
                                initial={rule}
                                onSave={(r) => saveRule(r, i)}
                                onCancel={() => setEditingIndex(null)}
                            />
                        ) : (
                            <RuleRow
                                key={rule.id}
                                rule={rule}
                                onEdit={() => setEditingIndex(i)}
                                onDelete={() => deleteRule(i)}
                            />
                        )
                    ))}
                    {addingNew ? (
                        <RuleForm
                            onSave={(r) => saveRule(r, null)}
                            onCancel={() => setAddingNew(false)}
                        />
                    ) : (
                        <button
                            onClick={() => setAddingNew(true)}
                            className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-slate-300 py-2 text-[11px] text-slate-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        >
                            <Plus className="h-3.5 w-3.5" />Add rule
                        </button>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex h-8 flex-1 items-center justify-center rounded border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(draft)}
                    className="flex h-8 flex-1 items-center justify-center rounded bg-[var(--brand-primary)] text-xs font-medium text-white hover:bg-[var(--brand-primary-600)]"
                >
                    Save rules
                </button>
            </div>
        </div>
    );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

type PanelView = 'overview' | 'diagram-rules' | 'workspace-rules';

export function LintRulesPanel(): React.ReactElement {
    const { viewSettings, setViewSettings } = useFlowStore();
    const { nodes } = useCanvasState();
    const { violations, parseError } = useArchitectureLint();
    const [view, setView] = useState<PanelView>('overview');
    const [showLibrary, setShowLibrary] = useState(false);

    const lintRules = viewSettings.lintRules;
    const hasRules = lintRules.trim().length > 0;
    const { rules: diagramRules } = parseRulesJson(lintRules);
    const workspaceRulesJson = loadWorkspaceRules();
    const hasWorkspaceRules = workspaceRulesJson.trim().length > 0;
    const { rules: workspaceRules } = parseRulesJson(workspaceRulesJson);

    const errorCount = violations.filter((v) => v.severity === 'error').length;
    const warningCount = violations.filter((v) => v.severity === 'warning').length;

    const exportViolations = useCallback(() => {
        const data = JSON.stringify({ violations, exportedAt: new Date().toISOString() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lint-violations.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [violations]);

    if (view === 'diagram-rules') {
        return (
            <VisualEditor
                rulesJson={lintRules}
                onSave={(json) => { setViewSettings({ lintRules: json }); setView('overview'); }}
                onCancel={() => setView('overview')}
                showLibrary={showLibrary}
                onToggleLibrary={() => setShowLibrary((s) => !s)}
            />
        );
    }

    if (view === 'workspace-rules') {
        return (
            <VisualEditor
                rulesJson={workspaceRulesJson}
                onSave={(json) => { saveWorkspaceRules(json); setView('overview'); }}
                onCancel={() => setView('overview')}
                showLibrary={showLibrary}
                onToggleLibrary={() => setShowLibrary((s) => !s)}
            />
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 custom-scrollbar">
            <div className="rounded-[var(--radius-md)] border border-slate-200 bg-[var(--brand-primary-50)] p-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[var(--brand-primary)]" />
                    <p className="text-xs font-medium text-[var(--brand-primary)]">Architecture Linting</p>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Enforce architecture constraints in real time — like ESLint for diagrams.
                </p>
            </div>

            {/* Violation summary */}
            {(hasRules || hasWorkspaceRules) && (
                <>
                    {parseError ? (
                        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-medium text-red-700">Rule file error</p>
                                <p className="text-[11px] text-red-600 mt-0.5 font-mono">{parseError}</p>
                            </div>
                        </div>
                    ) : violations.length === 0 ? (
                        <div className="flex items-center gap-2.5 rounded border border-emerald-200 bg-emerald-50/50 p-3">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <div>
                                <p className="text-xs font-medium text-slate-700">All rules pass</p>
                                <p className="text-[11px] text-slate-400">
                                    {nodes.length} node{nodes.length !== 1 ? 's' : ''} checked, no violations found.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded border border-red-100 bg-red-50/30">
                            <div className="flex items-center justify-between border-b border-red-100 px-3 py-2">
                                <span className="text-xs font-medium text-slate-700">
                                    {violations.length} violation{violations.length !== 1 ? 's' : ''}
                                </span>
                                <div className="flex items-center gap-2 text-[11px]">
                                    {errorCount > 0 && (
                                        <span className="flex items-center gap-1 text-red-600 font-medium">
                                            <AlertCircle className="h-3 w-3" /> {errorCount}
                                        </span>
                                    )}
                                    {warningCount > 0 && (
                                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                                            <AlertTriangle className="h-3 w-3" /> {warningCount}
                                        </span>
                                    )}
                                    <button
                                        onClick={exportViolations}
                                        className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                                    >
                                        <Download className="h-2.5 w-2.5" />Export
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-red-100/60">
                                {violations.map((v, i) => (
                                    <div key={`${v.ruleId}-${i}`} className="flex items-start gap-2 px-3 py-2.5">
                                        <SeverityIcon severity={v.severity} />
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-medium text-slate-700 leading-snug">{v.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{v.ruleId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Diagram-level rules */}
            <div className="rounded border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-[11px] font-medium text-slate-700">Diagram rules</p>
                        {hasRules && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0 text-[10px] text-slate-500">
                                {diagramRules.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => { setShowLibrary(false); setView('diagram-rules'); }}
                        className="flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                    >
                        {hasRules ? 'Edit' : <><Plus className="h-3 w-3" />Add</>}
                    </button>
                </div>
                {!hasRules ? (
                    <p className="px-3 py-2 text-[11px] text-slate-400">No diagram-level rules yet.</p>
                ) : (
                    <div className="divide-y divide-slate-50 px-3">
                        {diagramRules.map((r) => (
                            <div key={r.id} className="flex items-center gap-2 py-2">
                                <SeverityIcon severity={r.severity} />
                                <p className="min-w-0 flex-1 truncate text-[11px] text-slate-600">{r.description || r.id}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Workspace-level rules */}
            <div className="rounded border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-[11px] font-medium text-slate-700">Workspace rules</p>
                        {hasWorkspaceRules && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0 text-[10px] text-slate-500">
                                {workspaceRules.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => { setShowLibrary(false); setView('workspace-rules'); }}
                        className="flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                    >
                        {hasWorkspaceRules ? 'Edit' : <><Plus className="h-3 w-3" />Add</>}
                    </button>
                </div>
                {!hasWorkspaceRules ? (
                    <p className="px-3 py-2 text-[11px] text-slate-400">
                        Workspace rules apply to all diagrams. Good for org-wide standards.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-50 px-3">
                        {workspaceRules.map((r) => (
                            <div key={r.id} className="flex items-center gap-2 py-2">
                                <SeverityIcon severity={r.severity} />
                                <p className="min-w-0 flex-1 truncate text-[11px] text-slate-600">{r.description || r.id}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty state */}
            {!hasRules && !hasWorkspaceRules && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <ShieldCheck className="h-10 w-10 text-slate-200" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">No rules defined yet</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Add rules to automatically detect architecture violations as you draw.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowLibrary(true); setView('diagram-rules'); }}
                        className="flex h-9 items-center gap-2 rounded-[var(--brand-radius)] border border-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary-50)]"
                    >
                        <BookOpen className="h-4 w-4" />
                        Browse templates
                    </button>
                </div>
            )}
        </div>
    );
}
