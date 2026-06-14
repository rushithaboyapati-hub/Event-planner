const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendError } = require('../utils/errors');

function toLoginResponse(token, user) {
  return {
    token,
    tokenType: 'Bearer',
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, `User with email ${email} not found`);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.role);
    res.json(toLoginResponse(token, user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, passwordHash, role, bio, phone } = req.body;
    if (!name || !email || !passwordHash) {
      return sendError(res, 400, 'Name, email and password are required');
    }
    if (passwordHash.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const userCount = await User.countDocuments();
    let finalRole = role;

    if (userCount === 0) {
      finalRole = 'ADMIN';
    } else if (finalRole === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot register as ADMIN. Contact an existing admin to assign this role.' });
    } else if (!finalRole) {
      finalRole = 'USER';
    }

    const hashed = await bcrypt.hash(passwordHash, 10);
    const user = await User.create({
      name,
      email,
      passwordHash: hashed,
      role: finalRole,
      isVerified: true,
      bio,
      phone
    });

    const token = generateToken(user.id, user.email, user.role);
    res.status(201).json(toLoginResponse(token, user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return sendError(res, 404, `User not found`);
    }
    res.json(toLoginResponse(req.token, user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
