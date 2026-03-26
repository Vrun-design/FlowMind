export const DEFAULT_DOCS_LANGUAGE = 'en';
export const DOCS_SITE_ORIGIN = 'https://docs.openflowkit.com';

export function resolveDocsLanguage(language?: string): string {
    return language === 'tr' ? 'tr' : DEFAULT_DOCS_LANGUAGE;
}

export function buildDocsPath(slug: string, language?: string): string {
    return `/docs/${resolveDocsLanguage(language)}/${slug}`;
}

export function buildDocsSitePath(slug: string, language?: string): string {
    const resolvedLanguage = resolveDocsLanguage(language);

    if (resolvedLanguage === DEFAULT_DOCS_LANGUAGE) {
        return `/${slug}/`;
    }

    return `/${resolvedLanguage}/${slug}/`;
}

export function buildDocsSiteUrl(slug: string, language?: string): string {
    return `${DOCS_SITE_ORIGIN}${buildDocsSitePath(slug, language)}`;
}

export function buildDocsSiteHomeUrl(language?: string): string {
    const resolvedLanguage = resolveDocsLanguage(language);

    if (resolvedLanguage === DEFAULT_DOCS_LANGUAGE) {
        return `${DOCS_SITE_ORIGIN}/`;
    }

    return `${DOCS_SITE_ORIGIN}/${resolvedLanguage}/`;
}
