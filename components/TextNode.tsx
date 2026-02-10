import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { NodeData } from '../types';

const TEXT_COLORS: Record<string, string> = {
    slate: 'text-slate-700',
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    violet: 'text-violet-700',
    red: 'text-red-700',
    pink: 'text-pink-700',
    yellow: 'text-yellow-800', // Darker yellow for visibility
};

const TextNode = ({ data, selected }: NodeProps<NodeData>) => {
    const color = data.color || 'slate';
    const textColor = TEXT_COLORS[color] || TEXT_COLORS.slate;

    // Font Size Map
    const fontSizeMap: Record<string, string> = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xl: 'text-xl',
    };
    const fontSizeClass = fontSizeMap[data.fontSize || 'medium'];

    // Font Family Map
    const fontFamilyMap: Record<string, string> = {
        sans: 'font-sans',
        serif: 'font-serif',
        mono: 'font-mono',
    };
    const fontFamilyClass = fontFamilyMap[data.fontFamily || 'sans'];

    return (
        <>
            <NodeResizer
                color="#94a3b8"
                isVisible={selected}
                minWidth={50}
                minHeight={30}
                lineStyle={{ borderStyle: 'solid', borderWidth: 1 }}
                handleStyle={{ width: 6, height: 6, borderRadius: 3 }}
            />

            {/* Invisible Handles for connections */}
            <Handle type="target" position={Position.Top} className="opacity-0 hover:opacity-100 w-3 h-3 bg-slate-400" />
            <Handle type="target" position={Position.Left} className="opacity-0 hover:opacity-100 w-3 h-3 bg-slate-400" />

            <div
                className={`
          flex items-center justify-center p-2 rounded-lg transition-all duration-200
          ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
          ${!data.backgroundColor ? 'hover:bg-slate-100/50' : ''}
        `}
                style={{
                    minWidth: 50,
                    minHeight: 30,
                    backgroundColor: data.backgroundColor || 'transparent',
                }}
            >
                <div className={`prose prose-sm max-w-none text-center leading-snug font-medium select-none pointer-events-none ${textColor} ${fontSizeClass} ${fontFamilyClass}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {data.label || 'Text'}
                    </ReactMarkdown>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="opacity-0 hover:opacity-100 w-3 h-3 bg-slate-400" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 hover:opacity-100 w-3 h-3 bg-slate-400" />
        </>
    );
};

export default memo(TextNode);
