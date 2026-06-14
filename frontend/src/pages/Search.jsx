import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/api';

export default function Search({ userId }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('semantic');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      let res;
      if (mode === 'semantic') res = await searchService.semantic(query, 12, userId);
      else if (mode === 'text') res = await searchService.text(query, 12);
      else res = await searchService.hybrid(query, 12);
      setResults(res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div>
      <h2 className="mb-2">Event Search</h2>

      <div className="search-type">
        <button className={mode === 'semantic' ? 'active' : ''} onClick={() => setMode('semantic')}>Semantic AI</button>
        <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>Text</button>
        <button className={mode === 'hybrid' ? 'active' : ''} onClick={() => setMode('hybrid')}>Hybrid</button>
      </div>

      <div className="search-bar">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'semantic' ? 'e.g., "AI workshops near me", "Cloud computing seminars"...' : 'Search events...'}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && !loading && (
        <p className="text-muted mb-2">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
      )}

      <div className="grid grid-3">
        {results.map((r, i) => (
          <div key={r.eventId || i} className="card event-card"
               onClick={() => navigate(`/events/${r.eventId || r.event_id}`)}>
            <h3>{r.title || `Event #${r.eventId}`}</h3>
            {r.category && <p className="text-muted text-sm">📂 {r.category}</p>}
            {r.tags?.length > 0 && (
              <div className="mt-1">{r.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            )}
            {r.score && <p className="text-sm mt-1">Score: {(r.score * 100).toFixed(0)}%</p>}
            {r.description && <p className="text-sm text-muted mt-1">{r.description.substring(0, 120)}...</p>}
            {r.difficulty && <span className={`badge badge-${r.difficulty === 'beginner' ? 'published' : r.difficulty === 'advanced' ? 'cancelled' : 'completed'}`}>{r.difficulty}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
