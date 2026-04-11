import React, { memo, useMemo } from 'react';
import type { LegacyNodeProps } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { NodeChrome } from './NodeChrome';

function sanitizeMermaidSvgMarkup(svgMarkup: string | undefined): string | null {
  if (typeof svgMarkup !== 'string' || svgMarkup.trim().length === 0) {
    return null;
  }

  // Mermaid owns the markup, but we still strip script tags as a hard safety floor.
  return svgMarkup.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim();
}

function MermaidSvgNode({ id, data, selected }: LegacyNodeProps<NodeData>): React.ReactElement {
  const sanitizedSvg = useMemo(() => sanitizeMermaidSvgMarkup(data.mermaidSvg), [data.mermaidSvg]);

  return (
    <NodeChrome
      nodeId={id}
      selected={Boolean(selected)}
      minWidth={240}
      minHeight={160}
      keepAspectRatio
      showQuickCreateButtons={false}
      handles={[]}
      handleClassName=""
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--color-brand-border)] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
        style={{
          opacity: data.transparency ?? 1,
          transform: data.rotation ? `rotate(${data.rotation}deg)` : 'none',
        }}
      >
        {sanitizedSvg ? (
          <div
            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--brand-background)] text-[var(--brand-secondary)]">
            <span className="text-xs font-medium">Mermaid render unavailable</span>
          </div>
        )}
      </div>
    </NodeChrome>
  );
}

export default memo(MermaidSvgNode);
