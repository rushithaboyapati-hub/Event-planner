const User = require('../models/User');
const { sendError } = require('../utils/errors');

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return sendError(res, 404, `User not found with id : '${req.user.id}'`);
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      bio: user.bio,
      phone: user.phone,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
