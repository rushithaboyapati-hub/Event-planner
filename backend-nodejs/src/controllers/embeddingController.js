const EventEmbedding = require('../models/EventEmbedding');

exports.createEmbedding = async (req, res) => {
  try {
    const embedding = new EventEmbedding(req.body);
    const saved = await embedding.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEmbedding = async (req, res) => {
  try {
    const emb = await EventEmbedding.findOne({ eventId: parseInt(req.params.eventId) })
      .select('-embedding');
    if (!emb) return res.status(404).json({ error: 'Embedding not found' });
    res.json(emb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEmbedding = async (req, res) => {
  try {
    const result = await EventEmbedding.findOneAndDelete({ eventId: parseInt(req.params.eventId) });
    if (!result) return res.status(404).json({ error: 'Embedding not found' });
    res.json({ message: 'Embedding deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIndexStatus = async (req, res) => {
  try {
    const total = await EventEmbedding.countDocuments();
    const sample = await EventEmbedding.findOne().select('embeddingModel');
    res.json({
      totalEmbeddings: total,
      embeddingModel: sample ? sample.embeddingModel : null,
      indexName: 'vector_index',
      collection: 'event_embeddings'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
