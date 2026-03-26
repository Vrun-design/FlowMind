import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
    className?: string;
}

const ARROW_CLASSES = {
    top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent',
    bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent',
    left: '-right-1 top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent',
    right: '-left-1 top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent',
} as const;

export function Tooltip({
    children,
    text,
    side = 'top',
    sideOffset = 12,
    className = ''
}: TooltipProps): React.ReactElement {
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [resolvedSide, setResolvedSide] = useState(side);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerClassName = className.trim();

    const updatePosition = useCallback((): void => {
        if (!triggerRef.current || !tooltipRef.current) {
            return;
        }

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportPadding = 8;
        const preferredSide = (() => {
            if (side === 'top' && triggerRect.top - tooltipRect.height - sideOffset < viewportPadding) {
                return 'bottom';
            }
            if (side === 'bottom' && triggerRect.bottom + tooltipRect.height + sideOffset > window.innerHeight - viewportPadding) {
                return 'top';
            }
            if (side === 'left' && triggerRect.left - tooltipRect.width - sideOffset < viewportPadding) {
                return 'right';
            }
            if (side === 'right' && triggerRect.right + tooltipRect.width + sideOffset > window.innerWidth - viewportPadding) {
                return 'left';
            }
            return side;
        })();
        setResolvedSide(preferredSide);

        let top = 0;
        let left = 0;

        switch (preferredSide) {
            case 'bottom':
                top = triggerRect.bottom + sideOffset;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.left - tooltipRect.width - sideOffset;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.right + sideOffset;
                break;
            case 'top':
            default:
                top = triggerRect.top - tooltipRect.height - sideOffset;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
        }

        const maxLeft = window.innerWidth - tooltipRect.width - viewportPadding;
        const maxTop = window.innerHeight - tooltipRect.height - viewportPadding;
        setPosition({
            left: Math.min(Math.max(left, viewportPadding), Math.max(maxLeft, viewportPadding)),
            top: Math.min(Math.max(top, viewportPadding), Math.max(maxTop, viewportPadding)),
        });
    }, [side, sideOffset]);

    useLayoutEffect(() => {
        if (!isOpen) {
            return;
        }
        updatePosition();
    }, [isOpen, text, updatePosition]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleViewportChange(): void {
            updatePosition();
        }

        window.addEventListener('scroll', handleViewportChange, true);
        window.addEventListener('resize', handleViewportChange);
        return () => {
            window.removeEventListener('scroll', handleViewportChange, true);
            window.removeEventListener('resize', handleViewportChange);
        };
    }, [isOpen, text, updatePosition]);

    return (
        <div
            ref={triggerRef}
            className={triggerClassName}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
        >
            {children}
            {isOpen && typeof document !== 'undefined'
                ? createPortal(
                    <div
                        ref={tooltipRef}
                        className="pointer-events-none fixed z-[120] px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-sm whitespace-nowrap"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                    >
                        {text}
                        <span className={`absolute border-4 border-transparent ${ARROW_CLASSES[resolvedSide]}`}></span>
                    </div>,
                    document.body
                )
                : null}
        </div>
    );
}
