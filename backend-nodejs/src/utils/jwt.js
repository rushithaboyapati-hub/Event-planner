const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'EventPlannerSecretKeyForJWTTokenGeneration2026VeryLongAndSecure';
const JWT_EXPIRATION_MS = parseInt(process.env.JWT_EXPIRATION_MS || '86400000', 10);

function generateToken(userId, email, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { subject: email, algorithm: 'HS384', expiresIn: Math.floor(JWT_EXPIRATION_MS / 1000) }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS384'] });
}

module.exports = { generateToken, verifyToken };
