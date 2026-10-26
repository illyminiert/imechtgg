export default function Home() {
  return <main className="home-main">
    <section className="home-hero">
      <h1 className="glow-title">imecht<span>.gg</span></h1>
      <p>Willkommen in unserer Gaming-Community.</p>
      <a className="discord-card" href="https://discord.gg/DEIN-CODE" target="_blank" rel="noopener noreferrer">
        <img className="discord-logo" src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord-Logo" />
        <h2>Unser Discord</h2>
        <p>Gaming, Community &amp; mehr.</p>
        <span className="join-button">Discord beitreten</span>
      </a>
    </section>
  </main>;
}
