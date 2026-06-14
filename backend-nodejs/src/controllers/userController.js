const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendError } = require('../utils/errors');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }).sort({ id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return sendError(res, 404, `User not found with id : '${req.params.id}'`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return sendError(res, 404, `User with email ${req.params.email} not found`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, passwordHash, role, bio, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(passwordHash, 10);
    const user = await User.create({
      name,
      email,
      passwordHash: hashed,
      role: role || 'USER',
      isVerified: true,
      bio,
      phone
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return sendError(res, 404, `User not found with id : '${req.params.id}'`);

    const { name, bio, phone, role } = req.body;
    if (name != null) user.name = name;
    if (bio != null) user.bio = bio;
    if (phone != null) user.phone = phone;
    if (role != null) user.role = role;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return sendError(res, 404, `User not found with id : '${req.params.id}'`);
    user.isVerified = true;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: Number(req.params.id) });
    if (!user) return sendError(res, 404, `User not found with id : '${req.params.id}'`);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
