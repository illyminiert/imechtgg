import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';

const STATUS_URL = 'https://api.mcstatus.io/v2/status/java/mc.imecht.gg?query=false';
const REFRESH_MS = 60_000;

const fmt = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Number(value) || 0);

const metrics = [
  ['Spielzeit', 'playHours', 'Std.'],
  ['Tode', 'deaths', ''],
  ['Abgebaute Blöcke', 'blocksMined', ''],
  ['Mob-Kills', 'mobKills', ''],
  ['Spieler-Kills', 'playerKills', ''],
  ['Diamanterze', 'diamondOre', ''],
  ['Gelaufene Strecke', 'walkKm', 'km'],
  ['Sprünge', 'jumps', '']
];

function readableId(id) {
  const raw = String(id || '').split(':').pop().replace(/_/g, ' ');
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Unbekannt';
}

function TopList({ title, entries, emptyText }) {
  return <section className="profile-panel">
    <h2>{title}</h2>
    {!Array.isArray(entries) || entries.length === 0
      ? <p className="muted">{emptyText}</p>
      : <ol className="profile-top-list">
        {entries.map(([id, amount]) => <li key={id}>
          <span title={id}>{readableId(id)}</span>
          <strong>{fmt(amount)}</strong>
        </li>)}
      </ol>}
  </section>;
}

export default function PlayerProfile() {
  const { uuid } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/stats/data.json', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(setData)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;
    let controller;

    async function refreshOnlinePlayers() {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;

      try {
        const response = await fetch(STATUS_URL, { cache: 'no-store', signal: requestController.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!active || requestController.signal.aborted) return;

        if (!result.online) {
          setOnlinePlayers(null);
          return;
        }

        const list = result.players?.list;
        const count = result.players?.online;
        // Manche Server liefern nur eine Teilmenge der online Spieler.
        // Nur bei vollständiger Liste darf "nicht enthalten" als offline gelten.
        if (!Array.isArray(list) || !Number.isFinite(count) || list.length !== count ||
            list.some(p => typeof p.uuid !== 'string')) {
          setOnlinePlayers(null);
          return;
        }
        setOnlinePlayers(new Set(list.map(p => p.uuid.toLowerCase())));
      } catch (e) {
        if (active && !requestController.signal.aborted) setOnlinePlayers(null);
      }
    }

    refreshOnlinePlayers();
    const interval = window.setInterval(refreshOnlinePlayers, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  const player = data?.players?.find(p => p.uuid?.toLowerCase() === uuid?.toLowerCase());
  const onlineState = onlinePlayers === null ? 'unknown' :
    onlinePlayers.has(String(player?.uuid || '').toLowerCase()) ? 'online' : 'offline';
  const statusLabel = { online: 'Online', offline: 'Offline', unknown: 'Unbekannt' }[onlineState];

  return <main className="stats-main player-profile-main">
    <Link className="profile-back" to="/stats/">← Zurück zu den Statistiken</Link>
    {error && <p className="error" role="alert">Spielerprofil konnte nicht geladen werden: {error}</p>}
    {!data && !error && <p className="muted" role="status">Spielerprofil wird geladen …</p>}
    {data && !player && <div className="profile-panel"><h1>Spieler nicht gefunden</h1><p className="muted">Zu dieser UUID liegen keine Statistikdaten vor.</p></div>}
    {player && <>
      <header className="profile-header">
        <img className="profile-avatar" src={`https://mc-heads.net/avatar/${encodeURIComponent(player.uuid)}/128`} alt={`Minecraft-Kopf von ${player.name || 'Spieler'}`} />
        <div>
          <p className="eyebrow">MINECRAFT SPIELERPROFIL</p>
          <div className="profile-name-row">
            <h1>{player.name || player.uuid}</h1>
            <span className={`profile-status-tag profile-status-tag--${onlineState}`}
              role="status" aria-label={`Spielerstatus: ${statusLabel}`}>
              <span className="profile-status-tag-dot" aria-hidden="true" />
              {statusLabel}
            </span>
          </div>
          <span className="profile-uuid">{player.uuid}</span>
        </div>
      </header>
      <section className="profile-metrics" aria-label="Persönliche Statistiken">
        {metrics.map(([label, key, unit]) => <StatCard key={key} label={label} value={`${fmt(player[key])}${unit ? ` ${unit}` : ''}`} />)}
      </section>
      <div className="profile-details">
        <TopList title="Meistabgebaute Blöcke" entries={player.topMined} emptyText="Noch keine Blockdaten vorhanden." />
        <TopList title="Meistgetötete Mobs" entries={player.topKilled} emptyText="Noch keine Mobdaten vorhanden." />
      </div>
      <footer>
        {data.generatedAt && !Number.isNaN(Date.parse(data.generatedAt)) && <p className="muted small">Letzte Datenaktualisierung: {new Date(data.generatedAt).toLocaleString('de-DE')}</p>}
      </footer>
    </>}
  </main>;
}
