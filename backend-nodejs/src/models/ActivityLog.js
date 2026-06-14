const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  eventId: {
    type: Number,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'page_view', 'search', 'event_click', 'registration',
      'registration_cancel', 'event_create', 'event_update',
      'category_filter', 'calendar_view', 'semantic_search'
    ]
  },
  metadata: {
    query: String,
    category: String,
    tags: [String],
    searchResults: [Number],
    page: String,
    referrer: String,
    userAgent: String,
    ip: String,
    sessionId: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ 'metadata.query': 'text' });

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'user_activity_logs');
