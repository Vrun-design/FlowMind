import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusPath = path.join(__dirname, 'mermaid-flowchart-gold-corpus.json');

export const MERMAID_FLOWCHART_GOLD_CORPUS = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
