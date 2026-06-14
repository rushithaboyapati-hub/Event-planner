import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { getUserRole } from '../services/authService';

const roleBadge = { USER: 'badge-pending', ORGANIZER: 'badge-published', ADMIN: 'badge-completed' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'pass123', role: 'USER' });
  const [msg, setMsg] = useState(null);
  const currentRole = getUserRole();

  const loadUsers = () => {
    setLoading(true);
    userService.getAll().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userService.create({ ...form, passwordHash: form.password });
      setMsg({ type: 'success', text: 'User created' });
      setShowForm(false);
      setForm({ name: '', email: '', password: 'pass123', role: 'USER' });
      loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    }
  };

  const handleVerify = async (id) => {
    try {
      await userService.verify(id);
      setMsg({ type: 'success', text: 'User verified!' });
      loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Verification failed' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {}
  };

  return (
    <div>
      <div className="flex-between mb-2">
        <h2>Users</h2>
        {currentRole === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showForm && currentRole === 'ADMIN' && (
        <form onSubmit={handleCreate} className="card mb-2" style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="USER">User</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success">Create</button>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="grid grid-3">
          {users.map(u => (
            <div key={u.id} className="card">
              <div className="flex-between mb-1">
                <h3>{u.name}</h3>
                <span className={`badge ${roleBadge[u.role] || 'badge-pending'}`}>{u.role}</span>
              </div>
              <p className="text-sm text-muted">{u.email}</p>
              <p className="text-sm text-muted">
                Joined: {new Date(u.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm" style={{ color: u.isVerified ? '#155724' : '#856404' }}>
                {u.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </p>
              <div className="flex gap-1 mt-1">
                {currentRole === 'ADMIN' && !u.isVerified && (
                  <button className="btn btn-success btn-sm" onClick={() => handleVerify(u.id)}>
                    Approve
                  </button>
                )}
                {currentRole === 'ADMIN' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
