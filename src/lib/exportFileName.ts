const DEFAULT_EXPORT_BASENAME = 'openflowkit-diagram';
const MAX_EXPORT_BASENAME_LENGTH = 80;

export function sanitizeExportBaseName(value?: string | null): string {
    const normalized = (value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, MAX_EXPORT_BASENAME_LENGTH)
        .replace(/-+$/g, '');

    return normalized || DEFAULT_EXPORT_BASENAME;
}

export function buildExportFileName(baseName: string | null | undefined, extension: string): string {
    return `${sanitizeExportBaseName(baseName)}.${extension}`;
}

export function buildVariantExportFileName(
    baseName: string | null | undefined,
    variant: string,
    extension: string
): string {
    const sanitizedBaseName = sanitizeExportBaseName(baseName);
    const sanitizedVariant = sanitizeExportBaseName(variant);

    if (sanitizedVariant === DEFAULT_EXPORT_BASENAME) {
        return `${sanitizedBaseName}.${extension}`;
    }

    return `${sanitizedBaseName}-${sanitizedVariant}.${extension}`;
}
