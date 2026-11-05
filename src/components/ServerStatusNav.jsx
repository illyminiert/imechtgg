import { useEffect, useRef, useState } from 'react';

const ADDRESS = 'mc.imecht.gg';
const STATUS_URL = `https://api.mcstatus.io/v2/status/java/${ADDRESS}?query=false`;
const REFRESH_MS = 60_000;

export default function ServerStatusNav() {
  const [status, setStatus] = useState({ type: 'loading' });
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    let active = true;
    let controller;

    async function refresh() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const res = await fetch(STATUS_URL, { cache: 'no-store', signal: current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!active || current.signal.aborted) return;
        setStatus(data.online ? {
          type: 'online',
          online: data.players?.online,
          max: data.players?.max,
          version: data.version?.name_clean || null,
        } : { type: 'offline' });
      } catch {
        if (active && !current.signal.aborted) setStatus({ type: 'error' });
      }
    }

    refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const isOnline = status.type === 'online';
  const hasCount = isOnline && Number.isFinite(status.online);
  const count = hasCount
    ? `${status.online}${Number.isFinite(status.max) ? `/${status.max}` : ''}`
    : null;
  const chipText = hasCount ? `${count} online` : ({
    loading: 'Verbinde …', offline: 'Offline', error: 'Status unbekannt', online: 'Online'
  })[status.type];

  return (
    <div className="nav-server-status" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`nav-server-chip nav-server-chip--${status.type}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="nav-server-popover"
        onClick={() => setOpen(value => !value)}
        title="Minecraft-Serverstatus anzeigen"
      >
        <span className="nav-server-dot" aria-hidden="true" />
        <span className="nav-server-chip-label">{chipText}</span>
        <svg className="nav-server-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <section className="nav-server-popover" id="nav-server-popover" aria-label="Minecraft-Serverstatus">
          <div className="nav-server-popover-head">
            <strong>Minecraft-Server</strong>
            <span className={`nav-server-state nav-server-state--${status.type}`}>
              {isOnline ? 'Online' : status.type === 'offline' ? 'Offline' : status.type === 'loading' ? 'Lädt …' : 'Unbekannt'}
            </span>
          </div>
          <div className="nav-server-count">
            <strong>{count || '–'}</strong>
            <span>Spieler online</span>
          </div>
          {status.version && <div className="nav-server-version">{status.version}</div>}
          <div className="nav-server-address">
            <span>{ADDRESS}</span>
            <button type="button" onClick={copyAddress} title="Serveradresse kopieren" aria-label="Serveradresse kopieren">
              {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
