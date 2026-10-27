import { Link } from 'react-router-dom';

const fmt = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value);

export default function Leaderboard({ players, category }) {
  const ranked = [...players].sort((a, b) => (Number(b[category.key]) || 0) - (Number(a[category.key]) || 0));
  return <section className="leaderboard" aria-label="Spielerrangliste">
    <div className="section-heading">
      <div><p className="eyebrow">RANGLISTE</p><h2>{category.label}</h2></div>
      <span className="pill">{ranked.length} Spieler</span>
    </div>
    <div className="players">
      {ranked.length === 0 && <p>Noch keine Spielerdaten vorhanden.</p>}
      {ranked.map((player, index) => <Link className="player player-link" to={`/stats/player/${encodeURIComponent(player.uuid)}`} key={player.uuid || index} aria-label={`Profil von ${player.name || player.uuid} ansehen`}>
        <span className={`rank rank-number${index < 3 ? ` rank-top-${index + 1}` : ''}`} aria-label={`Platz ${index + 1}`}>
          #{index + 1}
        </span>
        <img className="head" loading="lazy" alt="" src={`https://mc-heads.net/avatar/${encodeURIComponent(player.uuid || player.name || 'Steve')}/48`} />
        <span className="player-name">{player.name || player.uuid || 'Unbekannt'} <span className="player-open" aria-hidden="true">↗</span></span>
        <span className="score">{fmt(Number(player[category.key]) || 0)} {category.unit}</span>
      </Link>)}
    </div>
  </section>;
}
