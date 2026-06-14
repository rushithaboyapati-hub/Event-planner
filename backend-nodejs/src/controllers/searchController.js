const EventDescription = require('../models/EventDescription');
const EventEmbedding = require('../models/EventEmbedding');
const ActivityLog = require('../models/ActivityLog');
const vectorSearchService = require('../services/vectorSearchService');

exports.semanticSearch = async (req, res) => {
  try {
    const { q, limit = 10, userId } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await vectorSearchService.search(q, { limit: parseInt(limit) });

    if (userId) {
      const log = new ActivityLog({
        userId: parseInt(userId),
        action: 'semantic_search',
        metadata: { query: q, searchResults: results.map(r => r.eventId) }
      });
      await log.save().catch(() => {});
    }

    const eventIds = results.map(r => r.eventId);
    const descriptions = await EventDescription.find({ eventId: { $in: eventIds } })
      .select('eventId format difficulty targetAudience learningOutcomes')
      .lean();

    const descMap = {};
    descriptions.forEach(d => { descMap[d.eventId] = d; });

    const enriched = results.map(r => ({
      ...r,
      ...(descMap[r.eventId] || {})
    }));

    res.json({ query: q, results: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.textSearch = async (req, res) => {
  try {
    const { q, limit = 10, category, difficulty } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const filter = {
      $or: [
        { description: { $regex: q, $options: 'i' } },
        { 'agenda.title': { $regex: q, $options: 'i' } },
        { learningOutcomes: { $regex: q, $options: 'i' } },
        { 'speakerBios.name': { $regex: q, $options: 'i' } },
        { targetAudience: { $regex: q, $options: 'i' } }
      ]
    };

    if (category) filter['format'] = category;
    if (difficulty) filter['difficulty'] = difficulty;

    const descriptions = await EventDescription.find(filter)
      .select('eventId description format difficulty targetAudience learningOutcomes')
      .limit(parseInt(limit))
      .lean();

    res.json({ query: q, results: descriptions, total: descriptions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hybridSearch = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    const [semanticResults, textResults] = await Promise.all([
      vectorSearchService.search(q, { limit: parseInt(limit) }),
      EventDescription.find({
        $or: [
          { description: { $regex: q, $options: 'i' } },
          { learningOutcomes: { $regex: q, $options: 'i' } },
          { targetAudience: { $regex: q, $options: 'i' } }
        ]
      })
        .select('eventId description format difficulty')
        .limit(parseInt(limit))
        .lean()
    ]);

    const seen = new Set();
    const merged = [];

    for (const r of semanticResults) {
      if (!seen.has(r.eventId)) {
        merged.push({ ...r, source: 'semantic' });
        seen.add(r.eventId);
      }
    }

    for (const r of textResults) {
      if (!seen.has(r.eventId)) {
        merged.push({ ...r, source: 'text', score: 0.3 });
        seen.add(r.eventId);
      }
    }

    res.json({
      query: q,
      results: merged.slice(0, parseInt(limit)),
      total: merged.length,
      semanticCount: semanticResults.length,
      textCount: textResults.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
