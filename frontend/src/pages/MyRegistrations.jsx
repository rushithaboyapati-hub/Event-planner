import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationService } from '../services/api';

const statusColors = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled', ATTENDED: 'badge-attended' };

export default function MyRegistrations({ userId }) {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService.getUserRegistrations(userId)
      .then(r => setRegistrations(r.data))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleCancel = async (eventId) => {
    try {
      await registrationService.cancel(eventId, userId);
      setRegistrations(prev => prev.map(r =>
        r.event?.id === eventId || r.eventId === eventId ? { ...r, status: 'CANCELLED' } : r
      ));
    } catch {}
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="mb-2">My Registrations</h2>
      {registrations.length === 0 ? (
        <div className="card"><p className="text-muted">You haven't registered for any events yet.</p></div>
      ) : (
        <div className="grid grid-2">
          {registrations.map(r => {
            const ev = r.event;
            return (
              <div key={r.id} className="card" style={{ cursor: ev ? 'pointer' : 'default' }}
                   onClick={() => ev && navigate(`/events/${ev.id}`)}>
                <div className="flex-between mb-1">
                  <h3>{ev?.title || `Event #${r.eventId}`}</h3>
                  <span className={`badge ${statusColors[r.status]}`}>{r.status}</span>
                </div>
                {ev && (
                  <p className="text-sm text-muted">
                    {new Date(ev.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {' '}{new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <p className="text-sm text-muted">Registered: {new Date(r.registeredAt).toLocaleDateString()}</p>
                {r.status !== 'CANCELLED' && (
                  <button className="btn btn-danger btn-sm mt-1" onClick={(e) => { e.stopPropagation(); handleCancel(r.eventId || ev?.id); }}>
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
