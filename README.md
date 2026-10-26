# imecht.gg – React / Vite

Eine React-Migration der bisherigen imecht.gg-Homepage mit gemeinsamer Navbar, Discord-Karte und Minecraft-Statistikseite.

## Wichtig: Echte Statistikdaten übernehmen

`public/stats/data.json` enthält zunächst absichtlich nur `{"generatedAt":null,"players":[]}`. Die existierende `stats/data.json` aus deinem bisherigen Repository **vor dem Deployment** nach `public/stats/data.json` kopieren. Die bisherigen Spielerstatistiken wurden nicht mitgeliefert, weil keine echte Datei vorlag.

## Lokal starten

1. Node.js 22 oder neuer installieren.
2. Terminal im Projektordner öffnen.
3. `npm install` (beim ersten Mal; erzeugt `package-lock.json`).
4. `npm run dev` – Vite zeigt dir die lokale URL an (meist `http://localhost:5173/`).
5. Home und `/stats/` testen.
6. `npm run build` – baut die fertige Website in `dist/`; `npm run preview` testet den Build.

## Dein bestehendes GitHub-Repository migrieren

- Bestehendes Repo **vorher sichern oder Branch erstellen**.
- Die alten statischen Website-Dateien nicht zusammen mit der neuen Root-`index.html` verwenden; neue Projektdateien ins Repo-Root kopieren und die alten `css/`, `components/`, `js/`, `stats/index.html` etc. entfernen, sofern sie nur zur alten Website gehören.
- Vorhandenen echten Discord-Einladungslink in `src/pages/Home.jsx` eintragen (der Platzhalter ist nicht funktionsfähig).
- `public/CNAME` enthält `imecht.gg`. Im alten Repo vorhandene CNAME-/Domain-Konfiguration prüfen und erhalten.
- Die echte `data.json` nach `public/stats/data.json` kopieren.
- `npm install` ausführen und **package-lock.json mit committen**, damit GitHub Actions `npm ci` verwenden kann.
- GitHub → Settings → Pages → Build and deployment → Source → **GitHub Actions**.
- Workflow liegt unter `.github/workflows/deploy.yml` (für den Branch `main`; ggf. anpassen).
- `git add .`, `git commit -m "Migrate imecht.gg to React"`, `git push`.

## GitHub Pages und Routing

Vite ist auf `base: '/'` eingestellt, weil imecht.gg eine Custom Domain nutzt. Das Build-Skript legt neben `dist/index.html` auch `dist/stats/index.html` an, damit ein direkter Aufruf von `https://imecht.gg/stats/` mit HTTP 200 funktioniert. `404.html` ist ein zusätzlicher Fallback für später neu hinzukommende Routes. GitHub Pages hat keine generelle SPA-Rewrite-Funktion.

## Dateien

- `src/components/Navbar.jsx` – eine Navbar für alle React-Seiten
- `src/pages/Home.jsx` – Startseite
- `src/pages/Stats.jsx` – Statistik-Kacheln und Übersicht
- `src/components/Leaderboard.jsx` – Spieler-Ranglisten
- `src/styles/` – globales Design und seitenspezifische Styles
- `public/stats/data.json` – JSON-Datei für die Spielerstatistiken
- `.github/workflows/deploy.yml` – GitHub Pages Deployment

## Sicherheit

Minecraft-Statistiken sind im öffentlichen `data.json` sichtbar. Keine Secrets, Spieler-IP-Adressen oder SFTP-Zugangsdaten dorthin übernehmen. Die automatische Space-Node-Synchronisierung ist **noch nicht** eingerichtet.
