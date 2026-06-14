# Problem Understanding

## Problem Statement
Create a system for scheduling and managing events with time-based coordination and user participation.

## Functional Requirements

### 1. Event Creation and Scheduling
- Create events with title, description, date/time, location, category, capacity
- Update and cancel events
- Set recurring schedules
- Define event metadata (tags, prerequisites, materials)

### 2. User Registration for Events
- Users can register for events
- Track registration status (pending, confirmed, cancelled, attended)
- Capacity management and waitlisting
- Registration deadlines

### 3. Calendar-Based Visualization
- View events in calendar format
- Filter by date range, category, status
- Personal calendar showing registered events
- Public event discovery calendar

### 4. Conflict-Aware Scheduling
- Detect overlapping event registrations for users
- Prevent double-booking
- Alert on scheduling conflicts during registration
- Venue/location conflict detection

### 5. Interest-Based Event Discovery
- Semantic search using vector embeddings
- Natural language queries (e.g., "AI workshops near me")
- Interest-based recommendations
- Category and tag-based filtering

## Derived Entities and Data Variables

### Core Entities
| Entity | Attributes |
|--------|------------|
| **User** | id, name, email, password, role, interests, created_at |
| **Event** | id, title, category, start_time, end_time, location, capacity, status, created_by, created_at |
| **Registration** | id, user_id, event_id, status, registered_at, attended |

### Supporting Entities
| Entity | Attributes |
|--------|------------|
| **Category** | id, name, description |
| **Tag** | id, name |
| **Event_Tag** | event_id, tag_id |
| **Venue** | id, name, address, capacity, facilities |

### MongoDB Documents
| Collection | Purpose |
|------------|---------|
| **event_descriptions** | Full-text event descriptions, agendas, speaker bios, prerequisites |
| **event_embeddings** | Vector embeddings for semantic search |
| **user_activity_logs** | User interaction logs (views, searches, clicks, registrations) |
