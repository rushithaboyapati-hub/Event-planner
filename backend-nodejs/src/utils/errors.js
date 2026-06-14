function sendError(res, status, message) {
  return res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    message
  });
}

module.exports = { sendError };
