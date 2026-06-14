import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';

const statusColors = { DRAFT: 'badge-draft', PUBLISHED: 'badge-published', CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed' };

export default function Events({ userId, canManageEvents }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getAll().then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <div className="flex-between mb-2">
        <h2>Events</h2>
        {canManageEvents && (
          <button className="btn btn-primary" onClick={() => navigate('/events/new')}>+ Create Event</button>
        )}
      </div>
      <div className="grid grid-3">
        {events.map(e => (
          <div key={e.id} className="card event-card" onClick={() => navigate(`/events/${e.id}`)}>
            <div className="flex-between mb-1">
              <h3>{e.title}</h3>
              <span className={`badge ${statusColors[e.status]}`}>{e.status}</span>
            </div>
            <p className="text-sm text-muted mb-1">
              {new Date(e.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' '}{new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' - '}{new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="meta">
              {e.categoryName && <span>📂 {e.categoryName}</span>}
              {e.venueName && <span>📍 {e.venueName}</span>}
              <span>👥 {e.registeredCount}/{e.capacity}</span>
            </div>
            {e.tags?.length > 0 && (
              <div className="mt-1">{e.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            )}
          </div>
        ))}
        {events.length === 0 && <p className="text-muted">No events found. Create your first event!</p>}
      </div>
    </div>
  );
}
