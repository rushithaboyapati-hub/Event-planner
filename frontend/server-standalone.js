import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));

// Support both /api/* and /api/sql/*, /api/mongo/* prefixes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/sql/')) req.url = req.url.replace('/api/sql', '/api');
  else if (req.path.startsWith('/api/mongo/')) req.url = req.url.replace('/api/mongo', '/api');
  next();
});

// ─── Helpers ───────────────────────────────────────────────
function addDays(date, days) { const r = new Date(date); r.setDate(r.getDate() + days); return r; }
function addHours(date, hours) { const r = new Date(date); r.setHours(r.getHours() + hours); return r; }
function byId(arr, id) { return arr.find(i => i.id === id); }

let _nextId = 100;
function nextId() { return _nextId++; }

// ─── In-memory Mock Data ───────────────────────────────────
const today = new Date();

const categories = [
  { id: 1, name: 'Technology', description: 'Tech events, workshops, hackathons' },
  { id: 2, name: 'Business', description: 'Business strategy, entrepreneurship' },
  { id: 3, name: 'Design', description: 'UI/UX, graphic design, creative' },
  { id: 4, name: 'Science', description: 'Research, academic conferences' },
  { id: 5, name: 'Health & Wellness', description: 'Fitness, mental health, nutrition' }
];

const venues = [
  { id: 1, name: 'Tech Hub Auditorium', address: '100 Innovation Drive', city: 'San Francisco', capacity: 300, facilities: 'Projector, WiFi, Stage' },
  { id: 2, name: 'Downtown Conference Center', address: '200 Main Street', city: 'New York', capacity: 500, facilities: 'Full AV, Catering, WiFi' },
  { id: 3, name: 'Innovation Lab', address: '50 Tech Park Blvd', city: 'Austin', capacity: 80, facilities: 'Whiteboards, Screens, WiFi' },
  { id: 4, name: 'Online (Zoom)', address: 'Virtual', city: 'Online', capacity: 1000, facilities: 'Zoom Webinar, breakout rooms' }
];

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'USER', createdAt: addDays(today, -30).toISOString() },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'ORGANIZER', createdAt: addDays(today, -20).toISOString() },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'ADMIN', createdAt: addDays(today, -10).toISOString() },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'USER', createdAt: addDays(today, -5).toISOString() }
];

let events = [
  { id: 1, title: 'Introduction to AI & Machine Learning', status: 'PUBLISHED', startTime: addHours(addDays(today, 3), 9).toISOString(), endTime: addHours(addDays(today, 3), 17).toISOString(), capacity: 100, registeredCount: 45, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 1, venueName: 'Tech Hub Auditorium', tags: ['AI', 'Machine Learning', 'Python', 'Workshop'], createdAt: addDays(today, -15).toISOString() },
  { id: 2, title: 'Cloud Computing Summit 2026', status: 'PUBLISHED', startTime: addHours(addDays(today, 7), 8).toISOString(), endTime: addHours(addDays(today, 7), 18).toISOString(), capacity: 200, registeredCount: 178, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 2, venueName: 'Downtown Conference Center', tags: ['Cloud', 'AWS', 'Azure', 'DevOps', 'Kubernetes'], createdAt: addDays(today, -20).toISOString() },
  { id: 3, title: 'Startup Pitch Night', status: 'PUBLISHED', startTime: addHours(addDays(today, 1), 18).toISOString(), endTime: addHours(addDays(today, 1), 21).toISOString(), capacity: 80, registeredCount: 62, organizerId: 2, organizerName: 'Bob Smith', categoryId: 2, categoryName: 'Business', venueId: 1, venueName: 'Tech Hub Auditorium', tags: ['Startup', 'Pitching', 'Networking', 'Entrepreneurship'], createdAt: addDays(today, -10).toISOString() },
  { id: 4, title: 'UI/UX Design Workshop: Figma Masterclass', status: 'PUBLISHED', startTime: addHours(addDays(today, 5), 10).toISOString(), endTime: addHours(addDays(today, 5), 16).toISOString(), capacity: 30, registeredCount: 28, organizerId: 1, organizerName: 'Alice Johnson', categoryId: 3, categoryName: 'Design', venueId: 3, venueName: 'Innovation Lab', tags: ['Figma', 'UI/UX', 'Design', 'Prototyping'], createdAt: addDays(today, -8).toISOString() },
  { id: 5, title: 'Data Science with Python: From Zero to Hero', status: 'PUBLISHED', startTime: addHours(addDays(today, 10), 9).toISOString(), endTime: addHours(addDays(today, 12), 17).toISOString(), capacity: 50, registeredCount: 35, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 4, venueName: 'Online (Zoom)', tags: ['Data Science', 'Python', 'Pandas', 'SQL'], createdAt: addDays(today, -12).toISOString() },
  { id: 6, title: 'Mindfulness & Meditation for Professionals', status: 'PUBLISHED', startTime: addHours(addDays(today, 2), 12).toISOString(), endTime: addHours(addDays(today, 2), 13).toISOString(), capacity: 40, registeredCount: 12, organizerId: 1, organizerName: 'Alice Johnson', categoryId: 5, categoryName: 'Health & Wellness', venueId: 3, venueName: 'Innovation Lab', tags: ['Meditation', 'Wellness', 'Mental Health'], createdAt: addDays(today, -5).toISOString() },
  { id: 7, title: 'Web Development Bootcamp: React & Node.js', status: 'PUBLISHED', startTime: addHours(addDays(today, 14), 9).toISOString(), endTime: addHours(addDays(today, 18), 17).toISOString(), capacity: 25, registeredCount: 25, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 3, venueName: 'Innovation Lab', tags: ['React', 'Node.js', 'JavaScript', 'Full Stack'], createdAt: addDays(today, -7).toISOString() },
  { id: 8, title: 'Blockchain & Web3: Beyond the Hype', status: 'DRAFT', startTime: addHours(addDays(today, 21), 10).toISOString(), endTime: addHours(addDays(today, 21), 16).toISOString(), capacity: 60, registeredCount: 0, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 4, venueName: 'Online (Zoom)', tags: ['Blockchain', 'Web3', 'Solidity', 'DeFi'], createdAt: addDays(today, -3).toISOString() },
  { id: 9, title: 'Annual Science Research Symposium', status: 'PUBLISHED', startTime: addHours(addDays(today, 30), 8).toISOString(), endTime: addHours(addDays(today, 30), 18).toISOString(), capacity: 400, registeredCount: 210, organizerId: 3, organizerName: 'Carol Williams', categoryId: 4, categoryName: 'Science', venueId: 2, venueName: 'Downtown Conference Center', tags: ['Research', 'Science', 'Keynote', 'Networking'], createdAt: addDays(today, -25).toISOString() },
  { id: 10, title: 'Cybersecurity Fundamentals Workshop', status: 'PUBLISHED', startTime: addHours(addDays(today, 4), 9).toISOString(), endTime: addHours(addDays(today, 4), 13).toISOString(), capacity: 35, registeredCount: 20, organizerId: 2, organizerName: 'Bob Smith', categoryId: 1, categoryName: 'Technology', venueId: 3, venueName: 'Innovation Lab', tags: ['Cybersecurity', 'Network Security', 'Ethical Hacking'], createdAt: addDays(today, -6).toISOString() }
];

let registrations = [
  { id: 1, userId: 1, eventId: 1, status: 'CONFIRMED', registeredAt: addDays(today, -2).toISOString() },
  { id: 2, userId: 1, eventId: 3, status: 'CONFIRMED', registeredAt: addDays(today, -1).toISOString() },
  { id: 3, userId: 4, eventId: 1, status: 'CONFIRMED', registeredAt: addDays(today, -3).toISOString() },
  { id: 4, userId: 4, eventId: 2, status: 'PENDING', registeredAt: addDays(today, -1).toISOString() },
  { id: 5, userId: 1, eventId: 7, status: 'CONFIRMED', registeredAt: addDays(today, -4).toISOString() },
  { id: 6, userId: 4, eventId: 4, status: 'CONFIRMED', registeredAt: addDays(today, -2).toISOString() },
  { id: 7, userId: 1, eventId: 6, status: 'ATTENDED', registeredAt: addDays(today, -10).toISOString() }
];

const descriptions = {
  1: { eventId: 1, description: 'A comprehensive introduction to AI and Machine Learning. Covers supervised/unsupervised learning, neural networks, and model deployment.', format: 'in-person', difficulty: 'beginner', learningOutcomes: ['Understand ML algorithms', 'Build models', 'Deploy ML models'], prerequisites: ['Basic Python'], targetAudience: ['Engineers', 'Students'] },
  2: { eventId: 2, description: 'Cloud Computing Summit discussing cloud infrastructure, serverless computing, and multi-cloud strategies with hands-on Kubernetes labs.', format: 'in-person', difficulty: 'intermediate', learningOutcomes: ['Multi-cloud architecture', 'Kubernetes', 'Serverless'], prerequisites: ['Basic cloud knowledge'], targetAudience: ['Cloud architects', 'DevOps'] }
};

// ─── API Routes (mirror both SQL and MongoDB endpoints) ────

// Users
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => { const u = byId(users, +req.params.id); u ? res.json(u) : res.status(404).json({ error: 'Not found' }); });
app.post('/api/users', (req, res) => { const u = { id: nextId(), ...req.body, createdAt: new Date().toISOString() }; users.push(u); res.status(201).json(u); });
app.put('/api/users/:id', (req, res) => { const idx = users.findIndex(u => u.id === +req.params.id); if(idx>=0){ users[idx]={...users[idx],...req.body}; res.json(users[idx]); } else res.status(404).json({ error: 'Not found' }); });
app.delete('/api/users/:id', (req, res) => { const idx = users.findIndex(u => u.id === +req.params.id); if(idx>=0){ users.splice(idx,1); res.json({message:'Deleted'}); } else res.status(404).json({ error: 'Not found' }); });

// Categories
app.get('/api/categories', (req, res) => res.json(categories));
app.post('/api/categories', (req, res) => { const c = { id: nextId(), ...req.body }; categories.push(c); res.status(201).json(c); });

// Venues
app.get('/api/venues', (req, res) => res.json(venues));
app.post('/api/venues', (req, res) => { const v = { id: nextId(), ...req.body }; venues.push(v); res.status(201).json(v); });

// Events
app.get('/api/events', (req, res) => res.json(events));
app.get('/api/events/upcoming', (req, res) => res.json(events.filter(e => e.status === 'PUBLISHED' && new Date(e.startTime) > new Date())));
app.get('/api/events/:id', (req, res) => { const e = byId(events, +req.params.id); e ? res.json(e) : res.status(404).json({ error: 'Not found' }); });
app.post('/api/events', (req, res) => {
  const organizerId = +req.query.organizerId;
  const org = byId(users, organizerId);
  const cat = byId(categories, req.body.categoryId);
  const ven = byId(venues, req.body.venueId);
  const ev = { id: nextId(), ...req.body, status: 'PUBLISHED', registeredCount: 0, organizerId, organizerName: org?.name || 'Unknown', categoryName: cat?.name || '', venueName: ven?.name || '', tags: [], createdAt: new Date().toISOString() };
  events.push(ev);
  res.status(201).json(ev);
});
app.put('/api/events/:id', (req, res) => { const idx = events.findIndex(e => e.id === +req.params.id); if(idx>=0){ events[idx]={...events[idx],...req.body}; res.json(events[idx]); } else res.status(404).json({ error: 'Not found' }); });
app.patch('/api/events/:id/cancel', (req, res) => { const e = byId(events, +req.params.id); if(e){ e.status='CANCELLED'; res.json(e); } else res.status(404).json({ error: 'Not found' }); });
app.delete('/api/events/:id', (req, res) => { const idx = events.findIndex(e => e.id === +req.params.id); if(idx>=0){ events.splice(idx,1); res.json({message:'Deleted'}); } else res.status(404).json({ error: 'Not found' }); });
app.post('/api/events/calendar', (req, res) => {
  const fS = req.body.startDate ? new Date(req.body.startDate) : new Date(Date.now() - 30*86400000);
  const fE = req.body.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 30*86400000);
  res.json(events.filter(e => { const s = new Date(e.startTime); return s >= fS && s <= fE; }));
});
app.get('/api/events/:eventId/conflicts/:userId', (req, res) => res.json({ hasConflict: false, conflictingEvents: [] }));

// Registrations
app.post('/api/events/:eventId/register', (req, res) => {
  const eventId = +req.params.eventId;
  const userId = +req.query.userId;
  const ev = byId(events, eventId);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  if (registrations.find(r => r.userId === userId && r.eventId === eventId))
    return res.status(409).json({ error: 'Already registered' });
  ev.registeredCount = (ev.registeredCount || 0) + 1;
  const reg = { id: nextId(), userId, eventId, status: 'CONFIRMED', registeredAt: new Date().toISOString() };
  registrations.push(reg);
  res.status(201).json(reg);
});
app.delete('/api/events/:eventId/register', (req, res) => {
  const eventId = +req.params.eventId, userId = +req.query.userId;
  const idx = registrations.findIndex(r => r.eventId === eventId && r.userId === userId);
  if (idx >= 0) { registrations.splice(idx, 1); const ev = byId(events, eventId); if (ev) ev.registeredCount = Math.max(0, (ev.registeredCount||0)-1); }
  res.json({ message: 'Cancelled' });
});
app.get('/api/users/:userId/registrations', (req, res) => {
  const uid = +req.params.userId;
  res.json(registrations.filter(r => r.userId === uid).map(r => {
    const ev = byId(events, r.eventId);
    return { ...r, event: ev || null, user: byId(users, uid) || null };
  }));
});
app.get('/api/events/:eventId/registrations', (req, res) => {
  const eid = +req.params.eventId;
  res.json(registrations.filter(r => r.eventId === eid).map(r => ({
    ...r, user: byId(users, r.userId) || null
  })));
});
app.patch('/api/registrations/:id/attend', (req, res) => {
  const r = byId(registrations, +req.params.id);
  if (r) r.status = 'ATTENDED';
  res.json(r || {});
});

// MongoDB mock endpoints (descriptions)
app.get('/api/descriptions/:eventId', (req, res) => {
  const desc = descriptions[+req.params.eventId];
  desc ? res.json(desc) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/descriptions', (req, res) => { descriptions[req.body.eventId] = req.body; res.status(201).json(req.body); });
app.put('/api/descriptions/:eventId', (req, res) => { descriptions[+req.params.eventId] = { ...(descriptions[+req.params.eventId]||{}), ...req.body }; res.json(descriptions[+req.params.eventId]); });
app.delete('/api/descriptions/:eventId', (req, res) => { delete descriptions[+req.params.eventId]; res.json({ message: 'Deleted' }); });

// Search
const searchData = [
  { eventId: 1, title: 'Introduction to AI & Machine Learning', category: 'Technology', tags: ['AI','Machine Learning'], textChunk: 'AI and Machine Learning workshop', score: 0.95 },
  { eventId: 2, title: 'Cloud Computing Summit 2026', category: 'Technology', tags: ['Cloud','AWS'], textChunk: 'Cloud computing summit', score: 0.88 },
  { eventId: 10, title: 'Cybersecurity Fundamentals Workshop', category: 'Technology', tags: ['Cybersecurity'], textChunk: 'Cybersecurity workshop', score: 0.76 },
  { eventId: 5, title: 'Data Science with Python', category: 'Technology', tags: ['Data Science','Python'], textChunk: 'Data science bootcamp', score: 0.72 },
  { eventId: 7, title: 'Web Development Bootcamp: React & Node.js', category: 'Technology', tags: ['React','Node.js'], textChunk: 'Full-stack bootcamp', score: 0.65 }
];
function searchLocal(q, arr, fields) {
  const terms = q.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  return arr.filter(item => terms.some(term => fields.some(f => String(item[f]||'').toLowerCase().includes(term))));
}
app.get('/api/search/semantic', (req, res) => {
  const q = req.query.q || '';
  const results = searchLocal(q, searchData, ['title','category','tags','textChunk']);
  res.json({ query: q, results, total: results.length });
});
app.get('/api/search/text', (req, res) => {
  const q = req.query.q || '';
  const results = searchLocal(q, Object.values(descriptions), ['description','learningOutcomes']);
  res.json({ query: q, results: results.map(d => ({ eventId: d.eventId, description: d.description?.substring(0,200), difficulty: d.difficulty, source: 'text' })), total: results.length });
});
app.get('/api/search/hybrid', (req, res) => {
  const q = req.query.q || '';
  const semantic = searchLocal(q, searchData, ['title','category','tags','textChunk']).map(r => ({...r, source:'semantic'}));
  const seen = new Set(semantic.map(r => r.eventId));
  const textResults = searchLocal(q, Object.values(descriptions).filter(d => !seen.has(d.eventId)), ['description','learningOutcomes']).map(d => ({ eventId: d.eventId, source: 'text', score: 0.3 }));
  res.json({ query: q, results: [...semantic, ...textResults], total: semantic.length + textResults.length, semanticCount: semantic.length, textCount: textResults.length });
});

// Activity logs (in-memory)
const activityLogs = [];
app.post('/api/activity-logs', (req, res) => { const l = { id: nextId(), ...req.body, timestamp: new Date().toISOString() }; activityLogs.push(l); res.status(201).json(l); });
app.post('/api/activity-logs/bulk', (req, res) => { res.status(201).json({ inserted: 0 }); });
app.get('/api/activity-logs/analytics', (req, res) => res.json({ total: activityLogs.length, breakdown: [] }));
app.get('/api/activity-logs/users/:userId', (req, res) => res.json(activityLogs.filter(l => l.userId === +req.params.userId)));
app.get('/api/activity-logs/events/:eventId', (req, res) => res.json(activityLogs.filter(l => l.eventId === +req.params.eventId)));
app.get('/api/activity-logs/search', (req, res) => res.json([]));

// Embeddings
app.post('/api/search/embeddings', (req, res) => res.status(201).json(req.body));
app.get('/api/search/embeddings/:eventId', (req, res) => res.status(404).json({ error: 'Not found' }));
app.delete('/api/search/embeddings/:eventId', (req, res) => res.json({ message: 'Deleted' }));
app.get('/api/search/embeddings/status/index', (req, res) => res.json({ totalEmbeddings: 0, embeddingModel: 'mock', indexName: 'vector_index', collection: 'event_embeddings' }));

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Standalone Server', timestamp: new Date().toISOString() }));

// ─── Serve built frontend ─────────────────────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving built frontend from:', distPath);
} else {
  console.warn('WARNING: No dist/ folder found. Run `npm run build` first.');
  app.get('*', (req, res) => res.send('Frontend not built. Run: npm run build'));
}

app.listen(PORT, () => {
  console.log(`Event Planner running at http://localhost:${PORT}`);
  console.log('No databases required — using in-memory mock data');
});
