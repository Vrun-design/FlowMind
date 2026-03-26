import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileWorkspaceGate } from './MobileWorkspaceGate';
import { MOBILE_WORKSPACE_GATE_COPY } from './mobileWorkspaceGateCopy';

describe('MobileWorkspaceGate', () => {
    it('renders the mobile workspace message and actions', () => {
        render(
            <MobileWorkspaceGate onOpenDocs={vi.fn()} onGoHome={vi.fn()}>
                <div>Desktop workspace</div>
            </MobileWorkspaceGate>
        );

        expect(screen.getByText(MOBILE_WORKSPACE_GATE_COPY.title)).toBeTruthy();
        expect(screen.getByText(MOBILE_WORKSPACE_GATE_COPY.description)).toBeTruthy();
        expect(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.openDocs })).toBeTruthy();
        expect(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.goHome })).toBeTruthy();
    });

    it('invokes navigation actions from the mobile prompt', () => {
        const onOpenDocs = vi.fn();
        const onGoHome = vi.fn();

        render(
            <MobileWorkspaceGate onOpenDocs={onOpenDocs} onGoHome={onGoHome}>
                <div>Desktop workspace</div>
            </MobileWorkspaceGate>
        );

        fireEvent.click(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.openDocs }));
        fireEvent.click(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.goHome }));

        expect(onOpenDocs).toHaveBeenCalledTimes(1);
        expect(onGoHome).toHaveBeenCalledTimes(1);
    });
});
