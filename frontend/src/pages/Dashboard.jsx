import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, registrationService } from '../services/api';
import { fetchUserInfo } from '../services/authService';

export default function Dashboard({ userId, canManageEvents }) {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventService.getUpcoming(),
      registrationService.getUserRegistrations(userId),
      fetchUserInfo()
    ]).then(([upcomingRes, regRes, uinfo]) => {
      setUpcoming(upcomingRes.data.slice(0, 6));
      setMyEvents(regRes.data.filter(r => r.status !== 'CANCELLED').slice(0, 5));
      setUserInfo(uinfo);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      {userInfo && (
        <div className="card mb-2" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#4361ee',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.2rem'
          }}>
            {userInfo.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{userInfo.name}</h3>
            <p className="text-muted text-sm">{userInfo.email} · {userInfo.role} {userInfo.isVerified ? '✓' : '⏳'}</p>
          </div>
        </div>
      )}

      <div className="flex-between mb-2">
        <h2>Dashboard</h2>
        {canManageEvents && (
          <button className="btn btn-primary" onClick={() => navigate('/events/new')}>
            + Create Event
          </button>
        )}
      </div>

      <div className="grid grid-2 mb-2">
        <div className="card">
          <div className="flex-between mb-1">
            <h3>Upcoming Events</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>View All</button>
          </div>
          {upcoming.length === 0 ? <p className="text-muted">No upcoming events</p> : (
            upcoming.map(e => (
              <div key={e.id} className="event-card" style={{ padding: '0.6rem 0', borderBottom: '1px solid #eee' }}
                   onClick={() => navigate(`/events/${e.id}`)}>
                <div className="flex-between">
                  <strong>{e.title}</strong>
                  <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                </div>
                <p className="text-sm text-muted mt-1">
                  {new Date(e.startTime).toLocaleDateString()} - {new Date(e.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  {e.venueName && ` @ ${e.venueName}`}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-1">
            <h3>My Registrations</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-registrations')}>View All</button>
          </div>
          {myEvents.length === 0 ? <p className="text-muted">No registrations yet</p> : (
            myEvents.map(r => (
              <div key={r.id} className="event-card" style={{ padding: '0.6rem 0', borderBottom: '1px solid #eee' }}
                   onClick={() => navigate(`/events/${r.event?.id || r.eventId}`)}>
                <div className="flex-between">
                  <strong>{r.event?.title || `Event #${r.eventId || r.event?.id}`}</strong>
                  <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
                </div>
                <p className="text-sm text-muted mt-1">
                  Registered: {new Date(r.registeredAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
