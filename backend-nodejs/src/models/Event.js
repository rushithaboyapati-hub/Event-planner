const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const eventSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'], default: 'DRAFT' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  capacity: { type: Number, required: true },
  organizerId: { type: Number, required: true },
  categoryId: { type: Number, default: null },
  venueId: { type: Number, default: null },
  tagIds: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

eventSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('events');
  }
  this.updatedAt = new Date();
  next();
});

eventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Event', eventSchema, 'events');
