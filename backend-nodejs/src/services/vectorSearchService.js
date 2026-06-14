const EventEmbedding = require('../models/EventEmbedding');
const ActivityLog = require('../models/ActivityLog');

class VectorSearchService {

  constructor() {
    this.collectionName = 'event_embeddings';
    this.indexName = 'vector_index';
  }

  async search(query, options = {}) {
    const { limit = 10, numCandidates = 100, minScore = 0.7 } = options;

    const queryEmbedding = await this.generateEmbedding(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: this.indexName,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: numCandidates,
          limit: limit
        }
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $match: {
          score: { $gte: minScore }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          eventId: 1,
          title: 1,
          category: 1,
          tags: 1,
          textChunk: 1,
          score: 1
        }
      }
    ];

    try {
      const results = await EventEmbedding.aggregate(pipeline);
      return results;
    } catch (err) {
      return this.searchFallback(query, limit);
    }
  }

  async searchFallback(query, limit = 10) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const regexTerms = terms.map(t => new RegExp(t, 'i'));

    const results = await EventEmbedding.find({
      $or: [
        { title: { $in: regexTerms } },
        { category: { $in: regexTerms } },
        { tags: { $in: terms } },
        { textChunk: { $in: regexTerms } }
      ]
    })
      .select('eventId title category tags textChunk')
      .limit(limit)
      .lean();

    return results.map(r => ({ ...r, score: 0.5 }));
  }

  async generateEmbedding(text) {
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

module.exports = new VectorSearchService();
