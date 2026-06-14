const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ORGANIZER', 'ADMIN'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  bio: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (this.isNew && this.id == null) {
    this.id = await getNextSequence('users');
  }
  next();
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema, 'users');
