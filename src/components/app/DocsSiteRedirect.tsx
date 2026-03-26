import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { buildDocsSiteHomeUrl, buildDocsSiteUrl, resolveDocsLanguage } from '@/docs/docsRoutes';

export function DocsSiteRedirect(): React.ReactElement {
    const { slug, lang } = useParams<{ slug?: string; lang?: string }>();

    useEffect(() => {
        const targetLanguage = resolveDocsLanguage(lang);
        const targetUrl = slug
            ? buildDocsSiteUrl(slug, targetLanguage)
            : buildDocsSiteHomeUrl(targetLanguage);
        window.location.replace(targetUrl);
    }, [lang, slug]);

    return (
        <RouteLoadingFallback
            title="Opening docs"
            description="Redirecting to the OpenFlowKit docs site."
        />
    );
}
