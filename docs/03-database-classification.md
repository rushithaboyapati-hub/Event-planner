# Database Classification: SQL vs MongoDB

## Classification Rationale

### SQL (PostgreSQL) — Structured, Relational Data

**Stores:**
- Users and authentication data
- Events core metadata
- Registrations and attendance
- Categories and tags
- Venues and locations
- All transactional/relational data

**Why SQL:**
| Reason | Explanation |
|--------|-------------|
| ACID Compliance | Registration transactions must be atomic (prevent double-booking) |
| Strict Schema | Event, User, Registration have fixed, well-defined structures |
| Relationships | Many-to-many (users-events via registrations), one-to-many (organizer-events) |
| Constraints | Unique emails, foreign key integrity, check constraints on status |
| Conflict Detection | SQL window functions and range queries for time overlap detection |
| Reporting | Aggregate queries for attendance, capacity, popular categories |

### MongoDB (NoSQL) — Unstructured Data, Logs, Text, Embeddings

**Stores:**
- `event_descriptions` — Rich text content (descriptions, agendas, speaker bios, prerequisites)
- `event_embeddings` — Vector embeddings for semantic search
- `user_activity_logs` — High-volume interaction logs (page views, searches, clicks)

**Why MongoDB:**
| Reason | Explanation |
|--------|-------------|
| Schema Flexibility | Event descriptions vary widely (some have agendas, speaker bios, prerequisites; others don't) |
| Large Text | Full descriptions, markdown content, speaker bios — large variable-length documents |
| Vector Search | Native `$vectorSearch` aggregation pipeline for semantic search |
| Write-Heavy Logs | User activity logs are high-volume, append-only — ideal for NoSQL |
| Embedding Storage | Vector embeddings (typically 1536-dim float arrays) stored naturally as arrays |
| No Joins Needed | Logs and descriptions are queried independently or with simple lookups |

## Data Flow Architecture

```
Client
  │
  ├── REST API (Spring Boot) ──── PostgreSQL
  │     └── CRUD: Users, Events, Registrations, Categories, Venues
  │
  └── REST API (Node.js/Express) ──── MongoDB
        └── CRUD: Descriptions, Logs, Vector Search
```

### Cross-Reference Strategy
- SQL `events.id` is stored as `eventId` in MongoDB documents
- SQL `users.id` is stored as `userId` in MongoDB documents
- Application-level joins via these keys
