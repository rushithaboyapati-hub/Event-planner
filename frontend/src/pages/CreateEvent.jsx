import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, categoryService, venueService } from '../services/api';

export default function CreateEvent({ userId, canManageEvents }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    title: '', startTime: '', endTime: '', capacity: 50,
    categoryId: '', venueId: ''
  });

  useEffect(() => {
    Promise.all([
      categoryService.getAll().catch(() => ({ data: [] })),
      venueService.getAll().catch(() => ({ data: [] }))
    ]).then(([c, v]) => {
      setCategories(c.data);
      setVenues(v.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) {
      setMsg({ type: 'error', text: 'Title, start, and end time are required' });
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setMsg({ type: 'error', text: 'End time must be after start time' });
      return;
    }
    try {
      const payload = {
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
        capacity: parseInt(form.capacity),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        venueId: form.venueId ? parseInt(form.venueId) : null
      };
      await eventService.create(userId, payload);
      navigate('/events');
    } catch (err) {
      const data = err.response?.data;
      let text = 'Failed to create event';
      if (data?.errors) {
        text = Object.values(data.errors).join(', ');
      } else if (data?.message) {
        text = data.message;
      } else if (err.response?.status === 403) {
        text = 'You do not have permission to create events';
      }
      setMsg({ type: 'error', text });
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (!canManageEvents) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 className="mb-2">Create Event</h2>
        <div className="alert alert-error">
          You don't have permission to create events. Only organizers and admins can create events.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 className="mb-2">Create Event</h2>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="Event title" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input type="datetime-local" value={form.startTime} onChange={set('startTime')} />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input type="datetime-local" value={form.endTime} onChange={set('endTime')} />
            </div>
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" value={form.capacity} onChange={set('capacity')} min="1" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Venue</label>
              <select value={form.venueId} onChange={set('venueId')}>
                <option value="">Select venue</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-1">Create Event</button>
        </div>
      </form>
    </div>
  );
}
