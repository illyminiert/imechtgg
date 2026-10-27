import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function routeIndex(dir) {
  mkdirSync(dir, { recursive: true });
  copyFileSync('dist/index.html', join(dir, 'index.html'));
}

routeIndex('dist/stats');

// Exakte Spielerpfade auf GitHub Pages ermöglichen (auch bei Browser-Refresh).
try {
  const stats = JSON.parse(readFileSync('public/stats/data.json', 'utf8'));
  for (const player of stats.players ?? []) {
    if (!/^[0-9a-fA-F-]{36}$/.test(player.uuid ?? '')) continue;
    routeIndex(join('dist', 'stats', 'player', player.uuid));
  }
} catch (error) {
  console.warn('Spielerrouten konnten nicht erstellt werden:', error.message);
}

// Fallback für unbekannte Client-Routen (bei GitHub Pages mit 404-Status).
copyFileSync('dist/index.html', 'dist/404.html');
