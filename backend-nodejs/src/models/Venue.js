const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const venueSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  capacity: { type: Number, required: true },
  facilities: String
});

venueSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('venues');
  }
  next();
});

venueSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Venue', venueSchema, 'venues');
