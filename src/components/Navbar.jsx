import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return <nav className="site-nav" aria-label="Hauptnavigation">
    <NavLink to="/" className="brand" aria-label="imecht.gg – Startseite">imecht<span>.gg</span></NavLink>
    <div className="nav-links">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
      <NavLink to="/stats/" className={({ isActive }) => isActive ? 'active' : ''}>Stats</NavLink>
    </div>
  </nav>;
}
