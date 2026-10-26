import { copyFileSync, mkdirSync } from 'node:fs';
// Physische Index-Datei für GitHub Pages: /stats/ liefert HTTP 200 auch beim Direktaufruf.
mkdirSync('dist/stats', { recursive: true });
copyFileSync('dist/index.html', 'dist/stats/index.html');
// Fallback für künftig weitere Client-Routen (GitHub Pages antwortet dann mit 404-Status).
copyFileSync('dist/index.html', 'dist/404.html');
