import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Stats from './pages/Stats.jsx';
import PlayerProfile from './pages/PlayerProfile.jsx';
import Map from './pages/Map.jsx';
import './styles/map.css';

export default function App() {
  const { pathname } = useLocation();
  const isMap = pathname === '/map' || pathname === '/map/';

  return (
    <div className={`site-shell${isMap ? ' site-shell--map' : ''}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/stats/player/:uuid" element={<PlayerProfile />} />
        <Route path="/map" element={<Map />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
