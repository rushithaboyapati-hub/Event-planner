import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Calendar from './pages/Calendar';
import Search from './pages/Search';
import MyRegistrations from './pages/MyRegistrations';
import Users from './pages/Users';
import Login from './pages/Login';
import { isAuthenticated, logout, getAuth } from './services/authService';

export default function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getAuth());
  const userId = auth?.userId || 1;
  const role = auth?.role || 'USER';
  const canManageEvents = role === 'ORGANIZER' || role === 'ADMIN';
  const canManageUsers = role === 'ADMIN';

  useEffect(() => {
    const check = () => setAuth(getAuth());
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const handleLogout = () => {
    logout();
    setAuth(null);
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return <Login onAuthenticated={() => setAuth(getAuth())} />;
  }

  return (
    <div>
      <nav className="navbar">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>EventPlanner</h1>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/search">Search</NavLink>
          <NavLink to="/my-registrations">My Registrations</NavLink>
          {canManageUsers && <NavLink to="/users">Users</NavLink>}
          <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.8rem' }}>
            {auth?.name || auth?.email}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}
                  style={{ marginLeft: '0.5rem', color: '#ccc', borderColor: '#ccc' }}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard userId={userId} canManageEvents={canManageEvents} />} />
          <Route path="/events" element={<Events userId={userId} canManageEvents={canManageEvents} />} />
          <Route path="/events/new" element={<CreateEvent userId={userId} canManageEvents={canManageEvents} />} />
          <Route path="/events/:id" element={<EventDetail userId={userId} />} />
          <Route path="/calendar" element={<Calendar userId={userId} />} />
          <Route path="/search" element={<Search userId={userId} />} />
          <Route path="/my-registrations" element={<MyRegistrations userId={userId} />} />
          <Route path="/users" element={canManageUsers ? <Users /> : <Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
