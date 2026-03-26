import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TopNavMenu } from './TopNavMenu';

describe('TopNavMenu', () => {
    it('closes when clicking outside', async () => {
        const onClose = vi.fn();

        render(
            <div>
                <TopNavMenu
                    isOpen={true}
                    isBeveled={false}
                    onToggle={vi.fn()}
                    onClose={onClose}
                    onGoHome={vi.fn()}
                    onOpenSettings={vi.fn()}
                    onHistory={vi.fn()}
                    onImportJSON={vi.fn()}
                />
                <button type="button">Outside</button>
            </div>
        );

        fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });
});
