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
