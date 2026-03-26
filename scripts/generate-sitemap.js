import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.resolve(__dirname, '../public/sitemap.xml');

const ROUTES = [
  { loc: 'https://openflowkit.com/', changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://app.openflowkit.com/', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://docs.openflowkit.com/', changefreq: 'weekly', priority: '0.8' },
];

function renderUrl({ loc, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function generateSitemap() {
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ROUTES.map(renderUrl),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');
  console.log(`Sitemap generated at ${OUTPUT_FILE}`);
}

generateSitemap();
