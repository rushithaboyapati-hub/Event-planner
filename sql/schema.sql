-- Event Planner - PostgreSQL Schema
-- Run after creating/selecting the eventplanner database:
-- psql -U postgres -d eventplanner -f sql/schema.sql

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ORGANIZER', 'ADMIN')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Venues
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    facilities TEXT
);

-- Tags
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    venue_id INTEGER REFERENCES venues(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_time CHECK (start_time < end_time)
);

-- Event-Tags (many-to-many)
CREATE TABLE event_tags (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- Registrations
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED')),
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, event_id)
);

-- Waitlist
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, event_id)
);

-- Indexes
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_user_event ON registrations(user_id, event_id);
CREATE INDEX idx_waitlist_event_position ON waitlist(event_id, position);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verified ON users(is_verified);

-- Seed data for create-event dropdowns
INSERT INTO categories (name, description)
SELECT 'Technology', 'Tech events, workshops, hackathons'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Technology');

INSERT INTO categories (name, description)
SELECT 'Business', 'Business strategy, entrepreneurship'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Business');

INSERT INTO categories (name, description)
SELECT 'Design', 'UI/UX, graphic design, creative'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Design');

INSERT INTO categories (name, description)
SELECT 'Science', 'Research, academic conferences'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Science');

INSERT INTO categories (name, description)
SELECT 'Health & Wellness', 'Fitness, mental health, nutrition'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Health & Wellness');

INSERT INTO venues (name, address, city, capacity, facilities)
SELECT 'Tech Hub Auditorium', '100 Innovation Drive', 'San Francisco', 300, 'Projector, WiFi, Stage'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Tech Hub Auditorium' AND city = 'San Francisco');

INSERT INTO venues (name, address, city, capacity, facilities)
SELECT 'Downtown Conference Center', '200 Main Street', 'New York', 500, 'Full AV, Catering, WiFi'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Downtown Conference Center' AND city = 'New York');

INSERT INTO venues (name, address, city, capacity, facilities)
SELECT 'Innovation Lab', '50 Tech Park Blvd', 'Austin', 80, 'Whiteboards, Screens, WiFi'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Innovation Lab' AND city = 'Austin');

INSERT INTO venues (name, address, city, capacity, facilities)
SELECT 'Online (Zoom)', 'Virtual', 'Online', 1000, 'Zoom Webinar, breakout rooms'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Online (Zoom)' AND city = 'Online');
