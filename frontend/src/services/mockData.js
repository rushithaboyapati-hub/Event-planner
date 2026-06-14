const now = new Date();

function addDays(date, days) { const r = new Date(date); r.setDate(r.getDate() + days); return r; }
function addHours(date, hours) { const r = new Date(date); r.setHours(r.getHours() + hours); return r; }
function safeStr(v) { return v != null ? String(v) : ''; }

const today = new Date();

export const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'USER', createdAt: addDays(today, -30).toISOString() },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'ORGANIZER', createdAt: addDays(today, -20).toISOString() },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'ADMIN', createdAt: addDays(today, -10).toISOString() },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'USER', createdAt: addDays(today, -5).toISOString() }
];

export const mockCategories = [
  { id: 1, name: 'Technology', description: 'Tech events, workshops, hackathons' },
  { id: 2, name: 'Business', description: 'Business strategy, entrepreneurship' },
  { id: 3, name: 'Design', description: 'UI/UX, graphic design, creative' },
  { id: 4, name: 'Science', description: 'Research, academic conferences' },
  { id: 5, name: 'Health & Wellness', description: 'Fitness, mental health, nutrition' }
];

export const mockVenues = [
  { id: 1, name: 'Tech Hub Auditorium', address: '100 Innovation Drive', city: 'San Francisco', capacity: 300, facilities: 'Projector, WiFi, Stage' },
  { id: 2, name: 'Downtown Conference Center', address: '200 Main Street', city: 'New York', capacity: 500, facilities: 'Full AV, Catering, WiFi' },
  { id: 3, name: 'Innovation Lab', address: '50 Tech Park Blvd', city: 'Austin', capacity: 80, facilities: 'Whiteboards, Screens, WiFi' },
  { id: 4, name: 'Online (Zoom)', address: 'Virtual', city: 'Online', capacity: 1000, facilities: 'Zoom Webinar, breakout rooms' }
];

export let mockEvents = [
  {
    id: 1, title: 'Introduction to AI & Machine Learning',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 3), 9).toISOString(),
    endTime: addHours(addDays(today, 3), 17).toISOString(),
    capacity: 100, registeredCount: 45,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 1, venueName: 'Tech Hub Auditorium',
    tags: ['AI', 'Machine Learning', 'Python', 'Workshop'],
    createdAt: addDays(today, -15).toISOString()
  },
  {
    id: 2, title: 'Cloud Computing Summit 2026',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 7), 8).toISOString(),
    endTime: addHours(addDays(today, 7), 18).toISOString(),
    capacity: 200, registeredCount: 178,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 2, venueName: 'Downtown Conference Center',
    tags: ['Cloud', 'AWS', 'Azure', 'DevOps', 'Kubernetes'],
    createdAt: addDays(today, -20).toISOString()
  },
  {
    id: 3, title: 'Startup Pitch Night',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 1), 18).toISOString(),
    endTime: addHours(addDays(today, 1), 21).toISOString(),
    capacity: 80, registeredCount: 62,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 2, categoryName: 'Business',
    venueId: 1, venueName: 'Tech Hub Auditorium',
    tags: ['Startup', 'Pitching', 'Networking', 'Entrepreneurship'],
    createdAt: addDays(today, -10).toISOString()
  },
  {
    id: 4, title: 'UI/UX Design Workshop: Figma Masterclass',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 5), 10).toISOString(),
    endTime: addHours(addDays(today, 5), 16).toISOString(),
    capacity: 30, registeredCount: 28,
    organizerId: 1, organizerName: 'Alice Johnson',
    categoryId: 3, categoryName: 'Design',
    venueId: 3, venueName: 'Innovation Lab',
    tags: ['Figma', 'UI/UX', 'Design', 'Prototyping'],
    createdAt: addDays(today, -8).toISOString()
  },
  {
    id: 5, title: 'Data Science with Python: From Zero to Hero',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 10), 9).toISOString(),
    endTime: addHours(addDays(today, 12), 17).toISOString(),
    capacity: 50, registeredCount: 35,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 4, venueName: 'Online (Zoom)',
    tags: ['Data Science', 'Python', 'Pandas', 'SQL'],
    createdAt: addDays(today, -12).toISOString()
  },
  {
    id: 6, title: 'Mindfulness & Meditation for Professionals',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 2), 12).toISOString(),
    endTime: addHours(addDays(today, 2), 13).toISOString(),
    capacity: 40, registeredCount: 12,
    organizerId: 1, organizerName: 'Alice Johnson',
    categoryId: 5, categoryName: 'Health & Wellness',
    venueId: 3, venueName: 'Innovation Lab',
    tags: ['Meditation', 'Wellness', 'Mental Health', 'Stress Relief'],
    createdAt: addDays(today, -5).toISOString()
  },
  {
    id: 7, title: 'Web Development Bootcamp: React & Node.js',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 14), 9).toISOString(),
    endTime: addHours(addDays(today, 18), 17).toISOString(),
    capacity: 25, registeredCount: 25,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 3, venueName: 'Innovation Lab',
    tags: ['React', 'Node.js', 'JavaScript', 'Full Stack'],
    createdAt: addDays(today, -7).toISOString()
  },
  {
    id: 8, title: 'Blockchain & Web3: Beyond the Hype',
    status: 'DRAFT',
    startTime: addHours(addDays(today, 21), 10).toISOString(),
    endTime: addHours(addDays(today, 21), 16).toISOString(),
    capacity: 60, registeredCount: 0,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 4, venueName: 'Online (Zoom)',
    tags: ['Blockchain', 'Web3', 'Solidity', 'DeFi'],
    createdAt: addDays(today, -3).toISOString()
  },
  {
    id: 9, title: 'Annual Science Research Symposium',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 30), 8).toISOString(),
    endTime: addHours(addDays(today, 30), 18).toISOString(),
    capacity: 400, registeredCount: 210,
    organizerId: 3, organizerName: 'Carol Williams',
    categoryId: 4, categoryName: 'Science',
    venueId: 2, venueName: 'Downtown Conference Center',
    tags: ['Research', 'Science', 'Keynote', 'Networking'],
    createdAt: addDays(today, -25).toISOString()
  },
  {
    id: 10, title: 'Cybersecurity Fundamentals Workshop',
    status: 'PUBLISHED',
    startTime: addHours(addDays(today, 4), 9).toISOString(),
    endTime: addHours(addDays(today, 4), 13).toISOString(),
    capacity: 35, registeredCount: 20,
    organizerId: 2, organizerName: 'Bob Smith',
    categoryId: 1, categoryName: 'Technology',
    venueId: 3, venueName: 'Innovation Lab',
    tags: ['Cybersecurity', 'Network Security', 'Ethical Hacking'],
    createdAt: addDays(today, -6).toISOString()
  }
];

export let mockRegistrations = [
  { id: 1, userId: 1, user: { id: 1, name: 'Alice Johnson' }, eventId: 1, event: mockEvents[0], status: 'CONFIRMED', registeredAt: addDays(today, -2).toISOString() },
  { id: 2, userId: 1, eventId: 3, event: mockEvents[2], status: 'CONFIRMED', registeredAt: addDays(today, -1).toISOString() },
  { id: 3, userId: 4, eventId: 1, event: mockEvents[0], status: 'CONFIRMED', registeredAt: addDays(today, -3).toISOString() },
  { id: 4, userId: 4, eventId: 2, event: mockEvents[1], status: 'PENDING', registeredAt: addDays(today, -1).toISOString() },
  { id: 5, userId: 1, eventId: 7, event: mockEvents[6], status: 'CONFIRMED', registeredAt: addDays(today, -4).toISOString() },
  { id: 6, userId: 4, eventId: 4, event: mockEvents[3], status: 'CONFIRMED', registeredAt: addDays(today, -2).toISOString() },
  { id: 7, userId: 1, eventId: 6, event: mockEvents[5], status: 'ATTENDED', registeredAt: addDays(today, -10).toISOString() }
];

export const mockDescriptions = {
  1: {
    eventId: 1,
    description: 'A comprehensive introduction to Artificial Intelligence and Machine Learning concepts. Covers supervised and unsupervised learning, neural networks, and practical ML model deployment.',
    format: 'in-person', difficulty: 'beginner',
    learningOutcomes: ['Understand ML algorithms', 'Build models with scikit-learn', 'Deploy ML models', 'Understand neural networks'],
    prerequisites: ['Basic Python programming'],
    targetAudience: ['Software engineers', 'Data enthusiasts', 'Students']
  },
  2: {
    eventId: 2,
    description: 'The Cloud Computing Summit brings together industry leaders to discuss cloud infrastructure, serverless computing, and multi-cloud strategies with hands-on Kubernetes labs.',
    format: 'in-person', difficulty: 'intermediate',
    learningOutcomes: ['Multi-cloud architecture', 'Kubernetes orchestration', 'Serverless design patterns', 'Cloud security'],
    prerequisites: ['Basic cloud knowledge'],
    targetAudience: ['Cloud architects', 'DevOps engineers']
  },
  4: {
    eventId: 4,
    description: 'Master Figma from the ground up. Learn design systems, auto layout, components, prototyping, and collaboration features.',
    format: 'in-person', difficulty: 'beginner',
    learningOutcomes: ['Figma proficiency', 'Design system creation', 'Interactive prototyping'],
    prerequisites: [],
    targetAudience: ['UI/UX designers', 'Product designers']
  },
  7: {
    eventId: 7,
    description: 'Intensive 5-day bootcamp covering modern full-stack web development with React 18, Node.js, Express, and MongoDB.',
    format: 'in-person', difficulty: 'intermediate',
    learningOutcomes: ['Build React SPAs', 'Create REST APIs', 'Database design', 'Auth'],
    prerequisites: ['JavaScript fundamentals'],
    targetAudience: ['Junior developers', 'Career switchers']
  }
};

export const mockSearchResults = [
  { eventId: 1, title: 'Introduction to AI & Machine Learning', category: 'Technology', tags: ['AI', 'Machine Learning'], textChunk: 'AI and Machine Learning workshop', score: 0.95 },
  { eventId: 2, title: 'Cloud Computing Summit 2026', category: 'Technology', tags: ['Cloud', 'AWS'], textChunk: 'Cloud computing summit with hands-on labs', score: 0.88 },
  { eventId: 10, title: 'Cybersecurity Fundamentals Workshop', category: 'Technology', tags: ['Cybersecurity'], textChunk: 'Cybersecurity workshop covering network security', score: 0.76 },
  { eventId: 5, title: 'Data Science with Python: From Zero to Hero', category: 'Technology', tags: ['Data Science', 'Python'], textChunk: 'Data science bootcamp using Python', score: 0.72 },
  { eventId: 7, title: 'Web Development Bootcamp: React & Node.js', category: 'Technology', tags: ['React', 'Node.js'], textChunk: 'Full-stack web development bootcamp', score: 0.65 }
];

let _nextId = 100;

export function nextId() { return _nextId++; }

export function addEvent(ev) {
  ev.id = nextId();
  ev.createdAt = new Date().toISOString();
  if (!ev.status) ev.status = 'PUBLISHED';
  if (!ev.tags) ev.tags = [];
  if (!ev.registeredCount && ev.registeredCount !== 0) ev.registeredCount = 0;
  mockEvents.push(ev);
  return ev;
}

export function addUser(u) {
  u.id = nextId();
  u.createdAt = new Date().toISOString();
  mockUsers.push(u);
  return u;
}

export function addRegistration(r) {
  r.id = nextId();
  r.registeredAt = new Date().toISOString();
  mockRegistrations.push(r);
  return r;
}

export function addCategory(c) {
  c.id = nextId();
  mockCategories.push(c);
  return c;
}

export function addVenue(v) {
  v.id = nextId();
  mockVenues.push(v);
  return v;
}

export function removeEvent(id) {
  mockEvents = mockEvents.filter(e => e.id !== id);
}

export function removeRegistration(eventId, userId) {
  mockRegistrations = mockRegistrations.filter(r => !(r.eventId === eventId && r.userId === userId));
}

export function updateEvent(id, changes) {
  const idx = mockEvents.findIndex(e => e.id === id);
  if (idx >= 0) {
    mockEvents[idx] = { ...mockEvents[idx], ...changes };
    return mockEvents[idx];
  }
  return null;
}
