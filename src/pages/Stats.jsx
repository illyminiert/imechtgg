import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import Leaderboard from '../components/Leaderboard.jsx';

const categories = [
  { key: 'playHours', label: 'Spielzeit', unit: 'Std.', icon: '◷', description: 'Gespielte Stunden' },
  { key: 'deaths', label: 'Tode', unit: '', icon: '☠', description: 'Gestorbene Male' },
  { key: 'blocksMined', label: 'Abgebaute Blöcke', unit: '', icon: '▦', description: 'Blöcke abgebaut' },
  { key: 'mobKills', label: 'Mob-Kills', unit: '', icon: '⚔', description: 'Besiegte Mobs' },
  { key: 'playerKills', label: 'Spieler-Kills', unit: '', icon: '♜', description: 'Besiegte Spieler' },
  { key: 'diamondOre', label: 'Diamanterze', unit: '', icon: '◆', description: 'Erze abgebaut' },
  { key: 'walkKm', label: 'Gelaufene Strecke', unit: 'km', icon: '➜', description: 'Zu Fuß zurückgelegt' },
  { key: 'jumps', label: 'Sprünge', unit: '', icon: '↑', description: 'Gesamte Sprünge' }
];
const fmt = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value);

export default function Stats() {
  const [activeKey, setActiveKey] = useState('playHours');
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
  const players = Array.isArray(data?.players) ? data.players : [];
  const total = key => players.reduce((sum, p) => sum + (Number(p[key]) || 0), 0);
  const category = categories.find(item => item.key === activeKey);

  return <main className="stats-main">
    <header className="stats-hero"><p className="eyebrow">MINECRAFT COMMUNITY</p><h1>Server-Statistiken</h1>
      <p className="muted">Zahlen, Rekorde und die Bestenlisten deiner Minecraft-Welt.</p></header>
    {error && <p className="error" role="alert">Statistiken konnten nicht geladen werden: {error}. Prüfe public/stats/data.json.</p>}
    {!data && !error && <p className="muted" role="status">Statistiken werden geladen …</p>}
    {data && <>
      <section className="overview" aria-label="Serverüberblick">
        <StatCard label="Spieler" value={fmt(players.length)} />
        <StatCard label="Gesamte Spielzeit" value={`${fmt(total('playHours'))} Std.`} />
        <StatCard label="Tode insgesamt" value={fmt(total('deaths'))} />
        <StatCard label="Blöcke abgebaut" value={fmt(total('blocksMined'))} />
      </section>
      <section className="statistics" aria-label="Statistik-Kategorien">
        <div className="section-heading"><div><p className="eyebrow">BESTENLISTEN</p><h2>Kategorie auswählen</h2></div><p className="muted hint">Klicke auf eine Kachel</p></div>
        <div className="category-grid" role="group" aria-label="Statistik auswählen">
          {categories.map(item => <button type="button" key={item.key} className={`category-card${item.key === activeKey ? ' selected' : ''}`}
            aria-pressed={item.key === activeKey} onClick={() => setActiveKey(item.key)}>
            <span className="category-icon" aria-hidden="true">{item.icon}</span>
            <span className="category-label">{item.label}</span>
            <span className="category-description">{item.description}</span>
          </button>)}
        </div>
      </section>
      <Leaderboard players={players} category={category} />
      <footer>{data.generatedAt && !Number.isNaN(Date.parse(data.generatedAt)) && <p className="muted">Letzte Datenaktualisierung: {new Date(data.generatedAt).toLocaleString('de-DE')}</p>}
        <p className="muted small">Unabhängiges Community-Projekt – nicht mit Mojang oder Microsoft verbunden.</p></footer>
    </>}
  </main>;
}
