import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';

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

  const player = data?.players?.find(p => p.uuid?.toLowerCase() === uuid?.toLowerCase());

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
          <h1>{player.name || player.uuid}</h1>
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
