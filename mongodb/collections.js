// Event Planner - MongoDB Collections & Indexes
// Run: mongosh eventplanner collections.js

// ============================================================
// 1. event_descriptions — Rich text content for events
// ============================================================
db.createCollection("event_descriptions");

db.event_descriptions.createIndex({ eventId: 1 }, { unique: true });
db.event_descriptions.createIndex(
  { description: "text", "agenda.title": "text", learningOutcomes: "text" },
  { name: "description_text_index" }
);

// ============================================================
// 2. event_embeddings — Vector embeddings for semantic search
// ============================================================
db.createCollection("event_embeddings");

db.event_embeddings.createIndex({ eventId: 1 }, { unique: true });

// Vector search index (requires MongoDB 6.0+ with Atlas or Enterprise)
// Create via: db.runCommand({ createIndexes: "event_embeddings", indexes: [...] })
// OR use Atlas UI. The index definition below is for reference:
/*
db.runCommand({
  createSearchIndexes: "event_embeddings",
  indexes: [{
    name: "vector_index",
    type: "vectorSearch",
    definition: {
      fields: [{
        type: "vector",
        path: "embedding",
        numDimensions: 1536,
        similarity: "cosine"
      }]
    }
  }]
});
*/

// ============================================================
// 3. user_activity_logs — User interaction tracking
// ============================================================
db.createCollection("user_activity_logs");

db.user_activity_logs.createIndex({ userId: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ action: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ timestamp: -1 });
db.user_activity_logs.createIndex({ eventId: 1, timestamp: -1 });

// Sample document structures for reference:
//
// event_descriptions:
// {
//   eventId: 1,
//   description: "Full description...",
//   agenda: [{ time: "10:00", title: "Intro", speaker: "John" }],
//   prerequisites: ["Python basics"],
//   materials: [{ name: "Slides", url: "https://...", type: "slides" }],
//   speakerBios: [{ name: "John", bio: "Expert in AI", photoUrl: "" }],
//   format: "in-person",
//   difficulty: "intermediate",
//   learningOutcomes: ["Understand transformers", "Build an LLM app"]
// }
//
// event_embeddings:
// {
//   eventId: 1,
//   title: "Introduction to AI",
//   category: "Technology",
//   tags: ["AI", "Workshop", "Machine Learning"],
//   embedding: [0.001, -0.023, ..., 0.015],  // 1536-dim float array
//   embeddingModel: "text-embedding-ada-002",
//   textChunk: "Introduction to AI Workshop in Technology category covering AI, Workshop, Machine Learning"
// }
//
// user_activity_logs:
// {
//   userId: 42,
//   eventId: 1,
//   action: "semantic_search",
//   metadata: { query: "AI workshops near me", searchResults: [1, 5, 12] },
//   timestamp: ISODate("2026-05-25T10:30:00Z")
// }
