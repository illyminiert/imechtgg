import { useRef, useState } from 'react';

const BLUEMAP_URL = 'https://imecht-bluemap.ilkayb.workers.dev/';

export default function Map() {
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (mapRef.current?.requestFullscreen) {
        await mapRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('Vollbildmodus konnte nicht geöffnet werden:', error);
    }
  }

  return (
    <main className="map-page" aria-label="Interaktive Minecraft-Weltkarte">
      <div className="map-page__heading">
        <div>
          <h1>Weltkarte</h1>
        </div>
        <a className="map-page__open" href={BLUEMAP_URL} target="_blank" rel="noopener noreferrer">
          Karte separat öffnen <span aria-hidden="true">↗</span>
        </a>
      </div>

      <section
        className="map-page__viewer"
        ref={mapRef}
        aria-label="BlueMap-Kartenansicht"
        onFullscreenChange={() => setIsFullscreen(Boolean(document.fullscreenElement))}
      >
        <iframe
          className="map-page__frame"
          title="BlueMap – Minecraft-Weltkarte"
          src={BLUEMAP_URL}
          allow="fullscreen"
          allowFullScreen
          loading="eager"
        />
        <button
          className="map-page__fullscreen"
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Vollbild beenden' : 'Karte im Vollbild anzeigen'}
        >
          <span aria-hidden="true">{isFullscreen ? '⤢' : '⛶'}</span>
          <span>{isFullscreen ? 'Vollbild beenden' : 'Vollbild'}</span>
        </button>
      </section>
    </main>
  );
}
