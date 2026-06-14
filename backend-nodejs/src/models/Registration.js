const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const registrationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  userId: { type: Number, required: true },
  eventId: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED'], default: 'PENDING' },
  registeredAt: { type: Date, default: Date.now }
});

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

registrationSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('registrations');
  }
  next();
});

registrationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Registration', registrationSchema, 'registrations');
