const ActivityLog = require('../models/ActivityLog');

exports.createLog = async (req, res) => {
  try {
    const log = new ActivityLog(req.body);
    const saved = await log.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.bulkCreateLogs = async (req, res) => {
  try {
    const logs = req.body.logs;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'logs array is required' });
    }
    const saved = await ActivityLog.insertMany(logs);
    res.status(201).json({ inserted: saved.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, action } = req.query;

    const filter = { userId: parseInt(userId) };
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventLogs = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 50, action } = req.query;

    const filter = { eventId: parseInt(eventId) };
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    const analytics = await ActivityLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = analytics.reduce((sum, a) => sum + a.count, 0);
    res.json({ total, breakdown: analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchLogs = async (req, res) => {
  try {
    const { query, limit = 50 } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter required' });

    const logs = await ActivityLog.find({
      $or: [
        { 'metadata.query': { $regex: query, $options: 'i' } },
        { action: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
