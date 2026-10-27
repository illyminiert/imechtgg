import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Stats from './pages/Stats.jsx';
import PlayerProfile from './pages/PlayerProfile.jsx';

export default function App() {
  return <div className="site-shell">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/stats/player/:uuid" element={<PlayerProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>;
}
