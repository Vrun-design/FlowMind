import { describe, expect, it } from 'vitest';
import {
    buildExportFileName,
    buildVariantExportFileName,
    sanitizeExportBaseName,
} from './exportFileName';

describe('exportFileName', () => {
    it('sanitizes tab names into safe export base names', () => {
        expect(sanitizeExportBaseName('Auth Service / API V2')).toBe('auth-service-api-v2');
    });

    it('falls back to the default export base name when the source is empty', () => {
        expect(buildExportFileName('', 'png')).toBe('openflowkit-diagram.png');
    });

    it('builds variant filenames for specialized exports', () => {
        expect(buildVariantExportFileName('Checkout Flow', 'figma', 'svg')).toBe('checkout-flow-figma.svg');
    });
});
