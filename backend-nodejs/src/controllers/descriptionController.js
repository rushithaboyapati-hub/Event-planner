const EventDescription = require('../models/EventDescription');

exports.createDescription = async (req, res) => {
  try {
    const description = new EventDescription(req.body);
    const saved = await description.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDescription = async (req, res) => {
  try {
    const desc = await EventDescription.findOne({ eventId: parseInt(req.params.eventId) });
    if (!desc) return res.status(404).json({ error: 'Description not found' });
    res.json(desc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDescription = async (req, res) => {
  try {
    req.body['metadata.updatedAt'] = new Date();
    const desc = await EventDescription.findOneAndUpdate(
      { eventId: parseInt(req.params.eventId) },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!desc) return res.status(404).json({ error: 'Description not found' });
    res.json(desc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDescription = async (req, res) => {
  try {
    const result = await EventDescription.findOneAndDelete({ eventId: parseInt(req.params.eventId) });
    if (!result) return res.status(404).json({ error: 'Description not found' });
    res.json({ message: 'Description deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const descriptions = await EventDescription.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('eventId description format difficulty targetAudience learningOutcomes');
    const total = await EventDescription.countDocuments();
    res.json({ data: descriptions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDescriptionSummary = async (req, res) => {
  try {
    const desc = await EventDescription.findOne(
      { eventId: parseInt(req.params.eventId) },
      'eventId description format difficulty targetAudience learningOutcomes prerequisites'
    );
    if (!desc) return res.status(404).json({ error: 'Description not found' });
    res.json(desc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
