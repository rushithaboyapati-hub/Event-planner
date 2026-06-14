# Normalization Process

## Starting Point: Unnormalized Form (UNF)

From `event_records` and `user_records` tables with:
- Multi-valued attributes (comma-separated tags, registered events)
- Repeated data (category, venue, organizer info duplicated)
- Mixed entities (registrations inside user table)

---

## Step 1: First Normal Form (1NF)

**Goal:** Atomic values, no repeating groups.

### Changes Made
1. Split `tags` into separate `event_tags` table (one tag per row)
2. Split `registered_events` / `registration_dates` / `registration_statuses` into separate `registrations` table
3. Each column holds a single atomic value

```sql
-- After 1NF: event_tags table created
-- After 1NF: registrations table created from user_records.registered_events
```

---

## Step 2: Second Normal Form (2NF)

**Goal:** Remove partial dependencies (every non-key attribute must depend on the whole primary key).

### Analysis
- In `event_records`, `venue_name` depends on `venue_id`, not just `event_id`
- `category_name` depends on `category_id`, not just `event_id`
- `organizer_name` depends on `organizer_id`, not just `event_id`

### Changes Made
1. Extract `venues` table (venue_id → name, address, capacity)
2. Extract `categories` table (category_id → name, description)
3. Events table references venues and categories via foreign keys

---

## Step 3: Third Normal Form (3NF)

**Goal:** Remove transitive dependencies (non-key attributes should not depend on other non-key attributes).

### Analysis
- No transitive dependencies remain after 2NF separation
- `registration_status` depends on `registration_id` (the full key)
- `event_title` depends on `event_id` (the full key)

### Verification
- Every non-key attribute is:
  1. Mutually independent (no non-key depends on another non-key)
  2. Fully functionally dependent on the primary key

---

## Step 4: Boyce-Codd Normal Form (BCNF)

**Goal:** Every determinant must be a candidate key.

### Analysis
- In `registrations`, `(user_id, event_id)` is unique and is a candidate key
- `registration_id` is the chosen primary key, `(user_id, event_id)` is alternate key
- All functional dependencies are on candidate keys → **BCNF satisfied**

---

## Final Normalized Schema

### Tables

| Table | Primary Key | Foreign Keys |
|-------|-------------|--------------|
| `users` | `user_id` | — |
| `categories` | `category_id` | — |
| `venues` | `venue_id` | — |
| `events` | `event_id` | `category_id`, `venue_id`, `organizer_id` → users |
| `tags` | `tag_id` | — |
| `event_tags` | `(event_id, tag_id)` | `event_id` → events, `tag_id` → tags |
| `registrations` | `registration_id` | `user_id` → users, `event_id` → events |
| `waitlist` | `waitlist_id` | `user_id` → users, `event_id` → events |

### Functional Dependencies Verified

```
event_id → title, description, start_time, end_time, category_id, venue_id, organizer_id, capacity, status
user_id → name, email, password_hash, role, bio, phone, created_at
category_id → name, description
venue_id → name, address, city, capacity, facilities
tag_id → name
registration_id → user_id, event_id, status, registered_at
(user_id, event_id) → status, registered_at
```
