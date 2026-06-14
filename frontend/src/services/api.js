import { getToken, getUserId } from './authService';
import * as mock from './mockData';

const apiCall = async (method, url, data = null, params = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
    ...(Object.keys(params).length && { params })
  };

  return fetch(url, config).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw { response: { status: res.status, data: err } };
    }
    const text = await res.text();
    return { data: text ? JSON.parse(text) : null };
  });
};

const withFallback = (apiCallFn, mockFn, options = {}) => {
  return apiCallFn().catch(err => {
    const isNetworkErr = err instanceof TypeError || err.message?.includes('Failed to fetch');
    const status = err.response?.status;
    const fallbackStatuses = options.fallbackStatuses || [];
    if (isNetworkErr || status >= 500 || fallbackStatuses.includes(status)) {
      console.warn('Backend unavailable, using mock data');
      return { data: mockFn() };
    }
    throw err;
  });
};

const byId = (arr, id) => arr.find(i => i.id === id);

function parse(query, items, fields) {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  return items.filter(item =>
    terms.some(term => fields.some(f => String(item[f] || '').toLowerCase().includes(term)))
  );
}

// In local dev, Vite proxies /api/* to the FastAPI gateway.
// In static deployments, VITE_API_BASE_URL should usually point at the FastAPI gateway.
// Set VITE_API_MODE=node only when pointing the frontend directly at the Node API.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_MODE = import.meta.env.VITE_API_MODE || 'gateway';
const externalBase = API_BASE_URL.replace(/\/$/, '');
const sqlBase = externalBase ? `${externalBase}/api${API_MODE === 'node' ? '' : '/sql'}` : '/api/sql';
const mongoBase = externalBase ? `${externalBase}/api${API_MODE === 'node' ? '' : '/mongo'}` : '/api/mongo';

export const eventService = {
  getAll: () => withFallback(() => apiCall('GET', `${sqlBase}/events`), () => mock.mockEvents),
  getUpcoming: () => withFallback(() => apiCall('GET', `${sqlBase}/events/upcoming`),
    () => mock.mockEvents.filter(e => e.status === 'PUBLISHED' && new Date(e.startTime) > new Date())),
  getById: (id) => withFallback(() => apiCall('GET', `${sqlBase}/events/${id}`),
    () => { const ev = byId(mock.mockEvents, parseInt(id)); if (!ev) throw { response: { status: 404 } }; return ev; }),
  create: (organizerId, data) => withFallback(() => apiCall('POST', `${sqlBase}/events?organizerId=${organizerId}`, data),
    () => { const ev = { ...data, organizerId: parseInt(organizerId), organizerName: 'Alice Johnson', registeredCount: 0, tags: data.tagIds || [], venueName: byId(mock.mockVenues, data.venueId)?.name || '', categoryName: byId(mock.mockCategories, data.categoryId)?.name || '' }; return mock.addEvent(ev); }),
  update: (id, data) => withFallback(() => apiCall('PUT', `${sqlBase}/events/${id}`, data), () => mock.updateEvent(parseInt(id), data)),
  cancel: (id) => withFallback(() => apiCall('PATCH', `${sqlBase}/events/${id}/cancel`), () => mock.updateEvent(parseInt(id), { status: 'CANCELLED' })),
  delete: (id) => withFallback(() => apiCall('DELETE', `${sqlBase}/events/${id}`), () => mock.removeEvent(parseInt(id))),
  getCalendar: (filter) => withFallback(() => apiCall('POST', `${sqlBase}/events/calendar`, filter),
    () => { const fS = filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30*86400000); const fE = filter.endDate ? new Date(filter.endDate) : new Date(Date.now() + 30*86400000); return mock.mockEvents.filter(e => { const s = new Date(e.startTime); return s >= fS && s <= fE; }); }),
  checkConflict: (eventId, userId) => withFallback(() => apiCall('GET', `${sqlBase}/events/${eventId}/conflicts/${userId}`), () => ({ hasConflict: false, conflictingEvents: [] }))
};

export const userService = {
  getAll: () => withFallback(() => apiCall('GET', `${sqlBase}/users`), () => mock.mockUsers),
  getById: (id) => withFallback(() => apiCall('GET', `${sqlBase}/users/${id}`), () => byId(mock.mockUsers, parseInt(id))),
  create: (data) => withFallback(() => apiCall('POST', `${sqlBase}/users`, data), () => mock.addUser({ ...data })),
  update: (id, data) => withFallback(() => apiCall('PUT', `${sqlBase}/users/${id}`, data), () => data),
  delete: (id) => withFallback(() => apiCall('DELETE', `${sqlBase}/users/${id}`), () => {}),
  verify: (id) => withFallback(() => apiCall('PATCH', `${sqlBase}/users/${id}/verify`), () => {})
};

export const categoryService = {
  getAll: () => withFallback(() => apiCall('GET', `${sqlBase}/categories`), () => mock.mockCategories, { fallbackStatuses: [404] }),
  create: (data) => withFallback(() => apiCall('POST', `${sqlBase}/categories`, data), () => mock.addCategory({ ...data }))
};

export const venueService = {
  getAll: () => withFallback(() => apiCall('GET', `${sqlBase}/venues`), () => mock.mockVenues, { fallbackStatuses: [404] }),
  create: (data) => withFallback(() => apiCall('POST', `${sqlBase}/venues`, data), () => mock.addVenue({ ...data }))
};

export const registrationService = {
  register: (eventId, userId) => withFallback(() => apiCall('POST', `${sqlBase}/events/${eventId}/register?userId=${userId}`),
    () => { const ev = byId(mock.mockEvents, parseInt(eventId)); const u = byId(mock.mockUsers, parseInt(userId)); if (ev) ev.registeredCount = (ev.registeredCount || 0) + 1; return mock.addRegistration({ userId: parseInt(userId), eventId: parseInt(eventId), user: u, event: ev, status: 'CONFIRMED' }); }),
  cancel: (eventId, userId) => withFallback(() => apiCall('DELETE', `${sqlBase}/events/${eventId}/register?userId=${userId}`),
    () => { const ev = byId(mock.mockEvents, parseInt(eventId)); if (ev && ev.registeredCount > 0) ev.registeredCount--; mock.removeRegistration(parseInt(eventId), parseInt(userId)); }),
  getUserRegistrations: (userId) => withFallback(() => apiCall('GET', `${sqlBase}/users/${userId}/registrations`),
    () => mock.mockRegistrations.filter(r => r.userId === parseInt(userId)).map(r => { const ev = byId(mock.mockEvents, r.eventId); return { ...r, event: ev || r.event }; })),
  getEventRegistrations: (eventId) => withFallback(() => apiCall('GET', `${sqlBase}/events/${eventId}/registrations`),
    () => mock.mockRegistrations.filter(r => r.eventId === parseInt(eventId))),
  markAttended: (id) => withFallback(() => apiCall('PATCH', `${sqlBase}/registrations/${id}/attend`), () => {})
};

export const descriptionService = {
  get: (eventId) => withFallback(() => apiCall('GET', `${mongoBase}/descriptions/${eventId}`), () => mock.mockDescriptions[parseInt(eventId)] || null),
  create: (data) => withFallback(() => apiCall('POST', `${mongoBase}/descriptions`, data), () => data),
  update: (eventId, data) => withFallback(() => apiCall('PUT', `${mongoBase}/descriptions/${eventId}`, data), () => data),
  delete: (eventId) => withFallback(() => apiCall('DELETE', `${mongoBase}/descriptions/${eventId}`), () => {})
};

export const searchService = {
  semantic: (q, limit = 10) => withFallback(() => apiCall('GET', `${mongoBase}/search/semantic?q=${encodeURIComponent(q)}&limit=${limit}`),
    () => { const results = parse(q, mock.mockSearchResults, ['title', 'category', 'tags', 'textChunk']).slice(0, limit); return { query: q, results, total: results.length }; }),
  text: (q, limit = 10) => withFallback(() => apiCall('GET', `${mongoBase}/search/text?q=${encodeURIComponent(q)}&limit=${limit}`),
    () => { const results = parse(q, Object.values(mock.mockDescriptions), ['description', 'learningOutcomes', 'targetAudience']); return { query: q, results: results.map(d => ({ eventId: d.eventId, description: d.description.substring(0, 200), difficulty: d.difficulty, source: 'text' })).slice(0, limit), total: results.length }; }),
  hybrid: (q, limit = 10) => withFallback(() => apiCall('GET', `${mongoBase}/search/hybrid?q=${encodeURIComponent(q)}&limit=${limit}`),
    () => { const semantic = parse(q, mock.mockSearchResults, ['title', 'category', 'tags', 'textChunk']).slice(0, limit); const seen = new Set(semantic.map(r => r.eventId)); const textArr = Object.values(mock.mockDescriptions).filter(d => !seen.has(d.eventId)); const textResults = parse(q, textArr, ['description', 'learningOutcomes']).map(d => ({ eventId: d.eventId, source: 'text', score: 0.3 })); return { query: q, results: [...semantic.map(r => ({ ...r, source: 'semantic' })), ...textResults].slice(0, limit), total: semantic.length + textResults.length, semanticCount: semantic.length, textCount: textResults.length }; })
};

export const activityLogService = {
  create: (data) => withFallback(() => apiCall('POST', `${mongoBase}/activity-logs`, data), () => data),
  getUserLogs: (userId) => withFallback(() => apiCall('GET', `${mongoBase}/activity-logs/users/${userId}`), () => []),
  getEventLogs: (eventId) => withFallback(() => apiCall('GET', `${mongoBase}/activity-logs/events/${eventId}`), () => []),
  getAnalytics: () => withFallback(() => apiCall('GET', `${mongoBase}/activity-logs/analytics`), () => ({ total: 0, breakdown: [] }))
};
