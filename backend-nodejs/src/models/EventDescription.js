const mongoose = require('mongoose');

const eventDescriptionSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  prerequisites: [String],
  materials: [{
    name: String,
    url: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'slides'] }
  }],
  speakerBios: [{
    name: String,
    bio: String,
    photoUrl: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String
    }
  }],
  faq: [{
    question: String,
    answer: String
  }],
  targetAudience: [String],
  learningOutcomes: [String],
  format: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    default: 'in-person'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
});

eventDescriptionSchema.index({ description: 'text', 'agenda.title': 'text', learningOutcomes: 'text' });

module.exports = mongoose.model('EventDescription', eventDescriptionSchema, 'event_descriptions');
