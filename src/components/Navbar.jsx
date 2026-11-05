import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ServerStatusNav from './ServerStatusNav.jsx';
import '../styles/server-status-nav.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const location = useLocation();

  // Beim Seitenwechsel das mobile Menü schließen.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event) {
      if (!navRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    function handleResize() {
      if (window.innerWidth > 600) setMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  return (
    <nav className="site-nav" aria-label="Hauptnavigation" ref={navRef}>
      <div className="nav-brand-group">
        <NavLink to="/" className="brand" aria-label="imecht.gg – Startseite">
          imecht<span>.gg</span>
        </NavLink>
        <ServerStatusNav />
      </div>

      <button
        type="button"
        ref={menuButtonRef}
        className="nav-menu-toggle"
        aria-label={menuOpen ? 'Navigationsmenü schließen' : 'Navigationsmenü öffnen'}
        aria-expanded={menuOpen}
        aria-controls="site-nav-links"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`} id="site-nav-links">
        <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/stats/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Stats</NavLink>
        <NavLink to="/map/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Map</NavLink>
      </div>
    </nav>
  );
}
