import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, registrationService, descriptionService } from '../services/api';

export default function EventDetail({ userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [desc, setDesc] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      eventService.getById(id),
      registrationService.getEventRegistrations(id),
      descriptionService.get(id).catch(() => null)
    ]).then(([e, regs, d]) => {
      setEvent(e.data);
      setRegistrations(regs.data);
      setDesc(d?.data || null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleRegister = async () => {
    try {
      const conflictRes = await eventService.checkConflict(id, userId);
      if (conflictRes.data.hasConflict) {
        setConflict(conflictRes.data.conflictingEvents);
        setMsg({ type: 'error', text: 'Scheduling conflict detected!' });
        return;
      }
      await registrationService.register(id, userId);
      setMsg({ type: 'success', text: 'Successfully registered!' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    }
  };

  const handleCancel = async () => {
    try {
      await registrationService.cancel(id, userId);
      setMsg({ type: 'success', text: 'Registration cancelled' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Cancel failed' });
    }
  };

  const isRegistered = registrations.some(r => r.userId === userId || r.user?.id === userId);
  const myReg = registrations.find(r => r.userId === userId || r.user?.id === userId);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div>
      <button className="btn btn-outline btn-sm mb-2" onClick={() => navigate(-1)}>← Back</button>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="detail-header">
        <div>
          <h2>{event.title}</h2>
          <span className={`badge badge-${event.status.toLowerCase()}`}>{event.status}</span>
        </div>
        <div className="flex gap-1">
          {!isRegistered && event.status === 'PUBLISHED' && (
            <button className="btn btn-primary" onClick={handleRegister}>Register</button>
          )}
          {isRegistered && myReg?.status !== 'CANCELLED' && (
            <button className="btn btn-danger" onClick={handleCancel}>Cancel Registration</button>
          )}
        </div>
      </div>

      <div className="detail-meta">
        <div className="detail-meta-item">
          <div className="label">Date & Time</div>
          <div className="value">
            {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <br />
            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="detail-meta-item">
          <div className="label">Capacity</div>
          <div className="value">{event.registeredCount} / {event.capacity} registered</div>
        </div>
        <div className="detail-meta-item">
          <div className="label">Organizer</div>
          <div className="value">{event.organizerName}</div>
        </div>
        <div className="detail-meta-item">
          <div className="label">Location</div>
          <div className="value">{event.venueName || 'TBD'}</div>
        </div>
        {event.categoryName && <div className="detail-meta-item">
          <div className="label">Category</div>
          <div className="value">{event.categoryName}</div>
        </div>}
        {event.tags?.length > 0 && <div className="detail-meta-item">
          <div className="label">Tags</div>
          <div className="value">{event.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        </div>}
      </div>

      {conflict && conflict.length > 0 && (
        <div className="card">
          <h3 className="mb-1">⚠️ Conflicting Events</h3>
          {conflict.map(e => (
            <div key={e.id} className="flex-between" style={{ padding: '0.4rem 0' }}>
              <span>{e.title}</span>
              <span className="text-muted text-sm">{new Date(e.startTime).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {desc && (
        <div className="card">
          <h3 className="mb-1">Description</h3>
          <p>{desc.description}</p>
          {desc.learningOutcomes?.length > 0 && (
            <>
              <h4 className="mt-2 mb-1">Learning Outcomes</h4>
              <ul>{desc.learningOutcomes.map((o, i) => <li key={i}>{o}</li>)}</ul>
            </>
          )}
          {desc.prerequisites?.length > 0 && (
            <>
              <h4 className="mt-2 mb-1">Prerequisites</h4>
              <ul>{desc.prerequisites.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </>
          )}
        </div>
      )}

      <div className="card">
        <h3 className="mb-1">Registrations ({registrations.length})</h3>
        {registrations.length === 0 ? <p className="text-muted">No registrations yet</p> : (
          registrations.map(r => (
            <div key={r.id} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <span>{r.user?.name || `User #${r.userId}`}</span>
              <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
