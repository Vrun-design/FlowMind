import type { ReactElement } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useFlowStore } from '../../store';
import type { FlowNode } from '@/lib/types';

interface WireframesViewProps {
    onClose: () => void;
    handleBack: () => void;
}

type WireframeNodeType = 'browser' | 'mobile';

interface WireframeItem {
    id: string;
    label: string;
    icon: ReactElement;
    type: WireframeNodeType;
}

const WIREFRAME_ITEMS: WireframeItem[] = [
    { id: 'browser', label: 'Browser Window', icon: <Monitor size={20} />, type: 'browser' },
    { id: 'mobile', label: 'Mobile Device', icon: <Smartphone size={20} />, type: 'mobile' },
];

function getWireframeLabel(type: WireframeNodeType): string {
    switch (type) {
        case 'browser':
            return 'New Window';
        case 'mobile':
            return 'Mobile App';
    }
}

export function WireframesView({ onClose, handleBack }: WireframesViewProps): ReactElement {
    const { nodes, setNodes, brandConfig } = useFlowStore();
    const isBeveled = brandConfig.ui.buttonStyle === 'beveled';

    const handleAdd = (type: WireframeNodeType) => {
        const nextIndex = nodes.length + 1;
        const id = `wf-${type}-${nextIndex}`;
        const position = {
            x: 100 + (nextIndex % 6) * 12,
            y: 100 + (nextIndex % 8) * 10
        };

        const label = getWireframeLabel(type);

        const newNode: FlowNode = {
            id,
            type,
            position,
            data: {
                label,
                color: 'slate',
            }
        };

        setNodes((prev) => [...prev, newNode]);
        onClose();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center px-4 py-3 border-b border-slate-100 shrink-0 gap-2">
                <button onClick={handleBack} className="p-1 hover:bg-slate-100 rounded text-slate-400 active:scale-95 transition-all">
                    <span className="text-xs">←</span>
                </button>
                <div className="text-sm font-medium text-slate-800">Wireframe Screens</div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto flex-1 custom-scrollbar">
                {WIREFRAME_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleAdd(item.type)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all group active:scale-[0.98]
                            ${isBeveled
                                ? 'bg-white border-slate-200 btn-beveled hover:border-[var(--brand-primary-200)]'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-white hover:border-[var(--brand-primary-200)] hover:shadow-md'}
                        `}
                    >
                        <div className={`p-2 bg-white rounded-lg border border-slate-100 text-slate-500 group-hover:text-[var(--brand-primary)] group-hover:scale-110 transition-all ${isBeveled ? 'shadow-sm' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
