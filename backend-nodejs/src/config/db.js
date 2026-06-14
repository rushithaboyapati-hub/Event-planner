const mongoose = require('mongoose');
const EventDescription = require('../models/EventDescription');
const EventEmbedding = require('../models/EventEmbedding');
const ActivityLog = require('../models/ActivityLog');

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

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
