# imecht.gg

Die Website für unseren Minecraft-Server: **[imecht.gg](https://imecht.gg)**. Gebaut mit **React und Vite**, bereitgestellt über **GitHub Pages** und automatisch mit aktuellen Minecraft-Spielerstatistiken versorgt.

## Funktionen

| Seite | Beschreibung |
| --- | --- |
| [Home](https://imecht.gg/) | Startseite im imecht.gg-Design mit Discord-Verlinkung. |
| [Stats](https://imecht.gg/stats/) | Minecraft-Statistiken, Kategorien, Ranglisten und Spielerprofile. |
| [Map](https://imecht.gg/map/) | Interaktive 3D-Weltkarte auf Basis von BlueMap mit optionalem Vollbildmodus. |

### Live-Serverstatus

Die gemeinsame Navigation (`Navbar`) zeigt direkt neben dem **imecht.gg**-Schriftzug einen kompakten Live-Status. Per Klick öffnet sich ein Panel mit Spieleranzahl, Serverstatus, Version und der kopierbaren Serveradresse **`mc.imecht.gg`**. Die Anzeige wird etwa alle **60 Sekunden** aktualisiert und nutzt die **mcstatus.io-API**. Eine zusätzliche Statusanzeige befindet sich auf der Stats-Seite.

### Minecraft-Statistiken

- Auswertung der vom Minecraft-Server erzeugten Spielerdateien in `world/stats/*.json`.
- Kategorieansicht und Ranglisten mit Hervorhebung der ersten drei Plätze.
- Spielerprofile mit individuellen Statistiken.
- Automatische Aktualisierung über den Deployment-Workflow, sofern sich die Daten geändert haben.

### Weltkarte (BlueMap)

Die 3D-Karte wird durch **BlueMap** auf dem Minecraft-Server bei **Space Node** bereitgestellt. Die Website bindet sie über einen **Cloudflare Worker** per HTTPS ein:

- Öffentliche HTTPS-Adresse: **https://imecht-bluemap.ilkayb.workers.dev/**
- BlueMap-Origin: `http://bluemap-origin.imecht.gg:25215/`
- Anzeige auf der Website: **https://imecht.gg/map/**

Die Map-Seite verwendet die reguläre Navigation, einen großen abgerundeten Kartencontainer und einen **Vollbild-Button unten links**. Die Kartenoberfläche selbst wird von BlueMap bereitgestellt; ihre Konfiguration und ihr Styling liegen auf dem Minecraft-Server und nicht im React-Projekt.

> Die Origin-Adresse verwendet HTTP. Der Cloudflare Worker stellt HTTPS für die Verbindung zum Browser bereit; die Verbindung vom Worker zum Minecraft-Server ist dabei nicht Ende-zu-Ende-verschlüsselt.

## Technischer Aufbau

- **Frontend:** React, Vite, CSS
- **Hosting:** GitHub Pages mit Custom Domain `imecht.gg`
- **Minecraft-Server:** Space Node / NeoForge
- **Statistikdaten:** Minecraft-JSON-Dateien, Python-Auswertung
- **Dateiübertragung:** SFTP über Paramiko innerhalb von GitHub Actions
- **Live-Status:** mcstatus.io
- **3D-Karte:** BlueMap und Cloudflare Worker als HTTPS-Proxy

## Lokal entwickeln

Voraussetzung: **Node.js 22 oder neuer** und npm.

```bash
npm install
npm run dev
```

Vite gibt die lokale Adresse aus, normalerweise **http://localhost:5173/**. Dort lassen sich `/`, `/stats/` und `/map/` testen.

Produktionsbuild prüfen:

```bash
npm run build
npm run preview
```

Der Build landet in `dist/`. Das Build-Skript erzeugt zusätzlich statische Einstiegspunkte für Unterseiten wie `/stats/`, `/map/` und Spielerprofile, damit diese auch bei direkten Aufrufen über GitHub Pages funktionieren.

## Automatische Statistik-Synchronisierung und Deployment

Der Workflow **`.github/workflows/deploy.yml`** wird beim Push auf `main` sowie über `workflow_dispatch` ausgelöst. Für die regelmäßige Auslösung wird **cron-job.org** verwendet, weil zeitgesteuerte GitHub-Actions-Läufe nicht immer pünktlich starten.

Ablauf:

1. GitHub Actions checkt das Repository aus und richtet Python ein.
2. `scripts/fetch_sftp.py` lädt die aktuellen Spielerstatistiken vom Space-Node-Server über SFTP.
3. Das Statistik-Build-Skript verarbeitet die JSON-Dateien für das Frontend.
4. `scripts/check_stats_changed.py` prüft, ob sich die relevanten Statistikdaten verändert haben (ohne rein technische Zeitstempel als Änderung zu behandeln).
5. Bei neuen Daten wird die Website gebaut und auf GitHub Pages veröffentlicht. Unveränderte Daten können bei automatischen Aufrufen einen unnötigen Deploy vermeiden; ein Push auf `main` veröffentlicht weiterhin Codeänderungen.

Die wichtigsten GitHub-Actions-Secrets sind:

| Secret | Zweck |
| --- | --- |
| `SFTP_HOST` | Host des SFTP-Servers |
| `SFTP_USER` | SFTP-Benutzername |
| `SFTP_PASSWORD` | SFTP-Passwort |
| `SFTP_KNOWN_HOSTS` | Vertrauenswürdiger SSH-Host-Key |

Weitere Konfigurationswerte sind `SFTP_PORT` und `SFTP_SERVER_ROOT` (als GitHub-Actions-Variablen). Zugangsdaten und Tokens gehören **ausschließlich** in Secrets, nicht ins Repository.

## Deployment über GitHub Pages

Unter **GitHub → Settings → Pages → Build and deployment** muss **GitHub Actions** als Source eingestellt sein.

- `public/CNAME` enthält die Custom Domain `imecht.gg` und muss im Repository bleiben.
- Vite verwendet `base: '/'`.
- GitHub Pages bietet keine allgemeine SPA-Rewrite-Regel. Deshalb erzeugt `scripts/create-static-routes.mjs` zusätzliche `index.html`-Dateien für direkte Routenaufrufe.

Änderungen veröffentlichen:

```bash
npm run build
git add .
git commit -m "Update imecht.gg"
git pull --rebase origin main
git push origin main
```

## Projektstruktur (wichtige Dateien)

```text
.github/workflows/deploy.yml      # Statistik-Sync und GitHub-Pages-Deployment
public/CNAME                      # Custom Domain imecht.gg
public/stats/data.json            # Aufbereitete öffentliche Statistikdaten
scripts/fetch_sftp.py             # Statistiken vom Server laden
scripts/build_stats.py            # Minecraft-JSON auswerten
scripts/check_stats_changed.py    # Unnötige Deployments vermeiden
scripts/create-static-routes.mjs  # Direkte Aufrufe von Unterseiten unterstützen
src/components/Navbar.jsx        # Gemeinsame Navigation
src/components/ServerStatusNav.jsx # Live-Status in der Navbar
src/components/Leaderboard.jsx   # Spieler-Ranglisten
src/pages/Home.jsx               # Homepage
src/pages/Stats.jsx              # Statistikseite
src/pages/Map.jsx                # BlueMap-Einbindung und Vollbildfunktion
src/styles/                     # Globale und seitenspezifische Styles
```

Je nach Projektstand können weitere Komponenten für Spielerprofile und Statistikansichten vorhanden sein.

## Sicherheit und Datenschutz

- `public/stats/data.json` ist öffentlich abrufbar. Keine IP-Adressen, Zugangsdaten oder anderen vertraulichen Informationen einfügen.
- SFTP-Zugangsdaten und der Token für `workflow_dispatch` werden als Secrets beim jeweiligen Dienst gespeichert.
- Die BlueMap-Origin ist direkt erreichbar. Der Worker ist **kein Zugriffsschutz**.
- Vor dem Veröffentlichen neuer Spieler- oder Aktivitätsdaten prüfen, welche Informationen öffentlich sichtbar sein sollen.
