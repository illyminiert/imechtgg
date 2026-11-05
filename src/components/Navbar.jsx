import { NavLink } from 'react-router-dom';
import ServerStatusNav from './ServerStatusNav.jsx';
import '../styles/server-status-nav.css';

export default function Navbar() {
  return (
    <nav className="site-nav" aria-label="Hauptnavigation">
      <div className="nav-brand-group">
        <NavLink to="/" className="brand" aria-label="imecht.gg – Startseite">
          imecht<span>.gg</span>
        </NavLink>
        <ServerStatusNav />
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/stats/" className={({ isActive }) => isActive ? 'active' : ''}>Stats</NavLink>
        <NavLink to="/map/" className={({ isActive }) => isActive ? 'active' : ''}>Map</NavLink>
      </div>
    </nav>
  );
}
