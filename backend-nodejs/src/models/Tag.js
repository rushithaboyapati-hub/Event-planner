const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const tagSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true }
});

tagSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('tags');
  }
  next();
});

tagSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Tag', tagSchema, 'tags');
