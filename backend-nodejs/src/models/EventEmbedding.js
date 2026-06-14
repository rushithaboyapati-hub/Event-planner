const mongoose = require('mongoose');

const eventEmbeddingSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  category: String,
  tags: [String],
  embedding: {
    type: [Number],
    required: true
  },
  embeddingModel: {
    type: String,
    default: 'text-embedding-ada-002'
  },
  textChunk: {
    type: String,
    required: true
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
});

eventEmbeddingSchema.index({ eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventEmbedding', eventEmbeddingSchema, 'event_embeddings');
