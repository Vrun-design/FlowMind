import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocsNavigation } from './useDocsNavigation';

export const DocsBreadcrumbs: React.FC = () => {
    const { currentEntry } = useDocsNavigation();

    if (!currentEntry) return null;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Documentation",
                "item": "https://openflowkit.com/docs"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": currentEntry.section
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": currentEntry.item.title,
                "item": `https://openflowkit.com/docs/en/${currentEntry.item.slug}`
            }
        ]
    };

    return (
        <nav className="flex items-center text-sm text-[var(--brand-secondary)] mb-6 overflow-x-auto whitespace-nowrap">
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
            <Link to="/docs" className="hover:text-[var(--brand-primary)] transition-colors">
                <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="font-medium text-slate-600">{currentEntry.section}</span>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="font-medium text-[var(--brand-primary)]">{currentEntry.item.title}</span>
        </nav>
    );
};
