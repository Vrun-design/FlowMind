import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsSiteRedirect } from './DocsSiteRedirect';

const replaceSpy = vi.fn();

describe('DocsSiteRedirect', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                replace: replaceSpy,
            },
        });
    });

    afterEach(() => {
        replaceSpy.mockClear();
    });

    it('redirects the base docs route to the introduction page', () => {
        render(
            <MemoryRouter initialEntries={['/docs']}>
                <Routes>
                    <Route path="/docs" element={<DocsSiteRedirect />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Opening docs')).toBeTruthy();
        expect(replaceSpy).toHaveBeenCalledWith('https://docs.openflowkit.com/');
    });

    it('redirects language-specific docs routes to the docs site', () => {
        render(
            <MemoryRouter initialEntries={['/docs/tr/quick-start']}>
                <Routes>
                    <Route path="/docs/:lang/:slug" element={<DocsSiteRedirect />} />
                </Routes>
            </MemoryRouter>
        );

        expect(replaceSpy).toHaveBeenCalledWith('https://docs.openflowkit.com/tr/quick-start/');
    });
});
