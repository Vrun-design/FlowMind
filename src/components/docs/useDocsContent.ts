import { useState, useEffect } from 'react';

// Use Vite's glob import to get raw content of all markdown files by language
const markdownFiles = import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default' });

export const useDocsContent = (slug: string | undefined, lang: string = 'en') => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                // Construct path key relative to project root with language folder
                const path = `/docs/${lang}/${slug}.md`;
                const fallbackPath = `/docs/en/${slug}.md`;

                let loader = markdownFiles[path];

                // Fallback to English if translation doesn't exist
                if (!loader && lang !== 'en') {
                    console.log(`Translation not found for ${lang}, falling back to English`);
                    loader = markdownFiles[fallbackPath];
                }

                if (!loader) {
                    console.warn(`Doc not found: ${path}. Available:`, Object.keys(markdownFiles));
                    throw new Error(`Document not found: ${slug} for language ${lang}`);
                }

                const rawContent = await loader() as string;
                setContent(rawContent);
            } catch (err) {
                console.error(err);
                setError('Failed to load documentation');
                setContent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [slug, lang]);

    return { content, loading, error };
};
