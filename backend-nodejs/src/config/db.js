const mongoose = require('mongoose');
const EventDescription = require('../models/EventDescription');
const EventEmbedding = require('../models/EventEmbedding');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const { Counter } = require('../models/Counter');

const defaultCategories = [
  { id: 1, name: 'Technology', description: 'Tech events, workshops, hackathons' },
  { id: 2, name: 'Business', description: 'Business strategy, entrepreneurship' },
  { id: 3, name: 'Design', description: 'UI/UX, graphic design, creative' },
  { id: 4, name: 'Science', description: 'Research, academic conferences' },
  { id: 5, name: 'Health & Wellness', description: 'Fitness, mental health, nutrition' }
];

const defaultVenues = [
  { id: 1, name: 'Tech Hub Auditorium', address: '100 Innovation Drive', city: 'San Francisco', capacity: 300, facilities: 'Projector, WiFi, Stage' },
  { id: 2, name: 'Downtown Conference Center', address: '200 Main Street', city: 'New York', capacity: 500, facilities: 'Full AV, Catering, WiFi' },
  { id: 3, name: 'Innovation Lab', address: '50 Tech Park Blvd', city: 'Austin', capacity: 80, facilities: 'Whiteboards, Screens, WiFi' },
  { id: 4, name: 'Online (Zoom)', address: 'Virtual', city: 'Online', capacity: 1000, facilities: 'Zoom Webinar, breakout rooms' }
];

async function seedDropdownData() {
  if (await Category.countDocuments() === 0) {
    await Category.insertMany(defaultCategories);
    await Counter.findByIdAndUpdate('categories', { $max: { seq: defaultCategories.length } }, { upsert: true });
  }

  if (await Venue.countDocuments() === 0) {
    await Venue.insertMany(defaultVenues);
    await Counter.findByIdAndUpdate('venues', { $max: { seq: defaultVenues.length } }, { upsert: true });
  }
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventplanner';

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });

    await Promise.all([
      mongoose.connection.db.listCollections({ name: 'event_descriptions' }).toArray(),
      mongoose.connection.db.listCollections({ name: 'event_embeddings' }).toArray(),
      mongoose.connection.db.listCollections({ name: 'user_activity_logs' }).toArray()
    ]);

    await EventDescription.syncIndexes().catch(() => {});
    await EventEmbedding.syncIndexes().catch(() => {});
    await ActivityLog.syncIndexes().catch(() => {});

    await seedDropdownData();

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
