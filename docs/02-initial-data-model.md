# Initial Data Modeling

## Initial (Unnormalized) Schema Design

This schema contains intentional redundancies, repeated attributes, and mixed entities prior to normalization.

### Initial Schema

```sql
CREATE TABLE event_records (
    event_id INT PRIMARY KEY,
    event_title VARCHAR(200),
    event_description TEXT,
    category_name VARCHAR(100),
    category_description TEXT,
    event_start DATETIME,
    event_end DATETIME,
    venue_name VARCHAR(200),
    venue_address TEXT,
    venue_capacity INT,
    organizer_id INT,
    organizer_name VARCHAR(100),
    organizer_email VARCHAR(200),
    max_participants INT,
    registration_status VARCHAR(50),
    tags VARCHAR(500),  -- comma-separated tags: "AI,Workshop,Cloud"
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE user_records (
    user_id INT PRIMARY KEY,
    user_name VARCHAR(100),
    user_email VARCHAR(200),
    user_phone VARCHAR(50),
    user_password VARCHAR(255),
    interests VARCHAR(500),  -- comma-separated interests
    registered_events VARCHAR(1000),  -- comma-separated event_ids
    registration_dates VARCHAR(1000),  -- comma-separated dates
    registration_statuses VARCHAR(1000),  -- comma-separated statuses
    created_at DATETIME,
    last_login DATETIME
);
```

## Issues with Initial Design

### Redundancies
- `category_name` and `category_description` repeated in every event row
- `organizer_name` and `organizer_email` repeated per event by same organizer
- `venue_name`, `venue_address`, `venue_capacity` repeated per event at same venue

### Repeated Attributes (Violates 1NF)
- `tags` column stores multiple values as comma-separated string
- `registered_events`, `registration_dates`, `registration_statuses` store repeating groups

### Mixed Entities
- Registration data mixed into user_records instead of separate table
- Category data embedded in event_records
- Venue data embedded in event_records
- Organizer (user) data embedded in event_records

### Missing Constraints
- No foreign key relationships
- No NOT NULL constraints on critical fields
- No UNIQUE constraints on emails
- No CHECK constraints on status values
- No indexing strategy
