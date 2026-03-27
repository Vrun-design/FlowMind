import React, { useCallback, useState } from 'react';
import { Check, Code2, Copy, ExternalLink, FileCode2, Link, X } from 'lucide-react';

interface ShareEmbedModalProps {
    viewerUrl: string;
    onClose: () => void;
}

function CopyRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }): React.ReactElement {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [value]);

    return (
        <div className="rounded-[var(--radius-sm)] border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <Icon className="h-3 w-3" />
                    {label}
                </div>
                <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    aria-label={`Copy ${label.toLowerCase()}`}
                >
                    {copied ? (
                        <><Check className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></>
                    ) : (
                        <><Copy className="h-3 w-3" />Copy</>
                    )}
                </button>
            </div>
            <p className="select-all break-all font-mono text-[11px] text-slate-600 leading-relaxed">{value}</p>
        </div>
    );
}

export function ShareEmbedModal({ viewerUrl, onClose }: ShareEmbedModalProps): React.ReactElement {
    const viewer = new URL(viewerUrl);
    const cardViewerUrl = (() => {
        const next = new URL(viewer.toString());
        next.searchParams.set('size', 'card');
        return next.toString();
    })();
    const badgeViewerUrl = (() => {
        const next = new URL(viewer.toString());
        next.searchParams.set('size', 'badge');
        return next.toString();
    })();
    const markdownLink = `[Open interactive diagram on OpenFlowKit](${viewerUrl})`;
    const readmeLink = `[View architecture diagram](${badgeViewerUrl})`;
    const iframeSnippet = `<iframe src="${cardViewerUrl}" width="720" height="420" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" title="OpenFlowKit diagram"></iframe>`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-embed-title"
                aria-describedby="share-embed-description"
                className="relative mx-4 w-full max-w-md rounded-[var(--radius-xl)] border border-white/20 bg-white shadow-[var(--shadow-overlay)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 id="share-embed-title" className="text-sm font-semibold text-slate-800">Share and embed diagram</h2>
                        <p id="share-embed-description" className="mt-0.5 text-[11px] text-slate-400">Viewer links are read-only and encode the diagram directly in the URL.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="Close share dialog">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3 p-5">
                    <CopyRow label="Viewer link" value={viewerUrl} icon={Link} />
                    <CopyRow label="Markdown link" value={markdownLink} icon={Code2} />
                    <CopyRow label="README link" value={readmeLink} icon={Code2} />
                    <CopyRow label="Embed iframe" value={iframeSnippet} icon={FileCode2} />

                    <a
                        href={cardViewerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-primary)] transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open card viewer
                    </a>
                </div>

                <div className="border-t border-slate-100 px-5 py-3">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        GitHub README usage should prefer the Markdown link. Blog posts and docs can use the iframe snippet with `size=card` or `size=badge`.
                    </p>
                </div>
            </div>
        </div>
    );
}
