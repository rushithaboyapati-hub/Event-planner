const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true },
  description: String
});

categorySchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('categories');
  }
  next();
});

categorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Category', categorySchema, 'categories');
