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
      {ranked.map((player, index) => <div className="player" key={player.uuid || index}>
        <span className="rank">#{index + 1}</span>
        <img className="head" loading="lazy" alt="" src={`https://mc-heads.net/avatar/${encodeURIComponent(player.uuid || player.name || 'Steve')}/48`} />
        <span className="player-name">{player.name || player.uuid || 'Unbekannt'}</span>
        <span className="score">{fmt(Number(player[category.key]) || 0)} {category.unit}</span>
      </div>)}
    </div>
  </section>;
}
