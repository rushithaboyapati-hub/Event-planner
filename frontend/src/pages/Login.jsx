import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.role);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      const data = err.response?.data || {};
      const text = data.error || data.message || 'Authentication failed';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto' }}>
      <div className="card">
        <h2 className="mb-2">{isRegister ? 'Create Account' : 'Sign In'}</h2>
        <p className="text-muted mb-2">
          {isRegister
            ? 'Register to start managing events'
            : 'Sign in with your credentials'}
        </p>

        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')}
                   placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')}
                   placeholder="Enter password" required />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option value="USER">User</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-2" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button className="btn btn-outline btn-sm" onClick={() => { setIsRegister(!isRegister); setMsg(null); }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
