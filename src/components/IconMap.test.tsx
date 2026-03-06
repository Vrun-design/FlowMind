import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES, ICON_PICKER_PRIORITY_NAMES, NamedIcon, resolveIconName } from './IconMap';

describe('IconMap', () => {
    it('keeps the curated icon registry intentionally small', () => {
        expect(ICON_NAMES.length).toBeLessThan(80);
        expect(ICON_NAMES).toContain('Settings');
        expect(ICON_NAMES).toContain('Database');
        expect(ICON_NAMES).toContain('Server');
    });

    it('resolves lowercase and aliased icon names', () => {
        expect(resolveIconName('database')).toBe('Database');
        expect(resolveIconName('image')).toBe('ImageIcon');
        expect(resolveIconName('log_in')).toBe('LogIn');
    });

    it('falls back to Settings for unknown or disabled icon names', () => {
        expect(resolveIconName('none')).toBe('Settings');
        expect(resolveIconName('totallyUnknownIcon')).toBe('Settings');
    });

    it('renders a named icon element', () => {
        const view = render(<NamedIcon name="Database" data-testid="icon" />);
        const svg = view.getByTestId('icon');

        expect(svg.tagName.toLowerCase()).toBe('svg');
    });

    it('keeps picker priorities within the curated set', () => {
        expect(ICON_PICKER_PRIORITY_NAMES.every((name) => ICON_NAMES.includes(name))).toBe(true);
    });
});
