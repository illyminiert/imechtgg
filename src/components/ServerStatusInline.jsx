import { useEffect, useState } from 'react';

const ADDRESS = 'mc.imecht.gg';
const URL = `https://api.mcstatus.io/v2/status/java/${ADDRESS}?query=false`;
const REFRESH_INTERVAL = 60_000;

export default function ServerStatusInline() {
  const [status, setStatus] = useState({ type: 'loading' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    let currentController;
    async function refresh() {
      currentController?.abort();
      const controller = new AbortController();
      currentController = controller;
      try {
        const response = await fetch(URL, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (!active || controller.signal.aborted) return;
        setStatus(json.online
          ? { type: 'online', online: json.players?.online, max: json.players?.max, version: json.version?.name_clean || null }
          : { type: 'offline' });
      } catch {
        if (active && !controller.signal.aborted) setStatus({ type: 'error' });
      }
    }
    refresh();
    const interval = window.setInterval(refresh, REFRESH_INTERVAL);
    return () => { active = false; window.clearInterval(interval); currentController?.abort(); };
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const labels = {
    loading: 'Status wird geladen …',
    online: 'Server online',
    offline: 'Server offline',
    error: 'Status nicht verfügbar',
  };
  const playerCount = status.type === 'online' && Number.isFinite(status.online)
    ? `${status.online}${Number.isFinite(status.max) ? ` / ${status.max}` : ''} Spieler`
    : 'Spielerzahl nicht verfügbar';

  return <section className="stats-live" aria-label="Live-Serverstatus">
    <div className={`stats-live-status stats-live-${status.type}`} role="status">
      <span className="stats-live-dot" aria-hidden="true" />
      <span>{labels[status.type]}</span>
    </div>
    <div className="stats-live-players">{playerCount}</div>
    <div className="stats-live-address-row">
      <span className="stats-live-address">{ADDRESS}</span>
      <button type="button" className="stats-live-copy" onClick={copyAddress} aria-label="Minecraft-Serveradresse kopieren" title="Serveradresse kopieren">
        {copied ? '✓ Kopiert' : '⧉ Kopieren'}
      </button>
    </div>
    {status.type === 'online' && status.version && <span className="stats-live-version">{status.version}</span>}
  </section>;
}
