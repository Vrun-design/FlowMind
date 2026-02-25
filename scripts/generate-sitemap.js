import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs/en');
const BASE_URL = 'https://openflowkit.com/docs'; // Update with actual domain later if needed

const generateSitemap = () => {
    const files = fs.readdirSync(DOCS_DIR);

    const urls = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const slug = file.replace('.md', '');
            return `  <url>\n    <loc>${BASE_URL}/en/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${slug === 'introduction' ? '1.0' : '0.8'}</priority>\n  </url>`;
        });

    // Add main landing page and app routes
    const coreRoutes = [
        `  <url>\n    <loc>https://openflowkit.com/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
        `  <url>\n    <loc>https://openflowkit.com/#/home</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        `  <url>\n    <loc>https://openflowkit.com/#/canvas</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${coreRoutes.join('\n')}\n${urls.join('\n')}\n</urlset>`;

    fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemap);
    console.log('Sitemap generated at public/sitemap.xml');
};

generateSitemap();
