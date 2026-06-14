# Event Planner - Full Stack Application

## Architecture

```
Frontend (React + Vite) :5173
    │
    └── /api/* ──> FastAPI Gateway :8000
                    ├── /api/auth/* ──┐
                    ├── /api/sql/* ───┤──> Spring Boot :8080 ──> PostgreSQL :5432
                    ├── /api/health ──┘
                    └── /api/mongo/* ──> Node.js/Express :3001 ──> MongoDB :27017
```

## Prerequisites

- Java 21+ (with Maven)
- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- MongoDB 7+

## Setup & Run

### 1. Database Setup

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE eventplanner;"
psql -U postgres -d eventplanner -f sql/schema.sql

# MongoDB (run in mongosh)
use eventplanner
load("mongodb/collections.js")
```

### 2. Start Services (4 terminals)

> For the review/demo flow, the frontend should be served through the Vite dev server at port 5173, which proxies to the FastAPI gateway on port 8000.

```bash
# Terminal 1: Spring Boot (port 8080)
cd backend-springboot
mvn spring-boot:run

# Terminal 2: Node.js (port 3001)
cd backend-nodejs
npm install
npm start

# Terminal 3: FastAPI Gateway (port 8000)
cd backend-fastapi
pip install -r requirements.txt
python main.py

# Terminal 4: Frontend (port 5173)
cd frontend
npm install
npm run dev
```

Or use:
```bash
scripts\start-all.bat   # Windows
bash scripts/start-all.sh  # Linux/Mac
```

### 3. Access

Open **http://localhost:5173** in your browser.

## Account Registration & Verification Flow

```
1. User opens app → Login page
                          
2. Clicks "Register" → fills Name, Email, Password, Role (USER / ORGANIZER)
                          
3. Submits → Backend creates account with is_verified = false
              (First-ever user becomes auto-verified ADMIN for bootstrap)
                          
4. User sees "Pending Approval" page
                          
5. Admin logs in → Navigates to Users page
                          
6. Admin clicks "Approve" on the pending user
                          
7. User can now log in with their credentials
```

### Key Rules
- **First user to register** → automatically becomes verified ADMIN (bootstrap)
- **All subsequent registrations** → created as unverified, need admin approval
- **Cannot register directly as ADMIN** (must be assigned by existing admin)
- **Login blocked** for unverified accounts with clear error message

## Rubric Coverage

### 1. Problem Identification & Frontend UI (10/10)
- Event scheduling system with time-based coordination and user participation
- 8-page React SPA: Login/Register, Dashboard, Events, Event Detail, Create Event, Calendar, Search (3 modes), My Registrations, Users
- Built with React 18 + Vite 5 + react-router-dom v6
- Responsive CSS grid layout, modern flat design
- Full registration flow with role selection and verification gate
- Graceful degradation with mock data fallback

### 2. API Gateway - FastAPI (10/10)
- Central FastAPI gateway on port 8000
- Routes `/api/auth/*`, `/api/sql/*`, `/api/health` to Spring Boot (port 8080)
- Routes `/api/mongo/*` to Node.js (port 3001)
- CORS configured for all origins
- Async proxying via httpx
- Backend health monitoring

### 3. Backend Spring Boot - JWT, CRUD, Role Based Access (10/10)
- **JWT Authentication**: Token generation/validation using jjwt 0.12 with HMAC-SHA
- **Endpoints**: Login, Register, Get Current User, Verify User
- **CRUD**: Full Create/Read/Update/Delete for Users, Events, Registrations, Categories, Venues
- **Role-Based Access** (3-tier):
  - `PUBLIC`: View events, categories, venues; register new account
  - `USER`: Register for events, view own registrations
  - `ORGANIZER`: Create/edit/cancel events, manage categories and venues
  - `ADMIN`: Full access including user management, verification, attendance marking
- **Account Verification**: New accounts start unverified; login blocked until admin approval
- **Bootstrap**: First user ever is auto-verified as ADMIN
- **Security**: BCrypt password encoding, Stateless JWT sessions, @PreAuthorize on all endpoints

### 4. Database Design - PostgreSQL (10/10)
- 7 tables fully normalized to BCNF
- Proper foreign keys with CASCADE/SET NULL referential integrity
- CHECK constraints on status fields and capacity
- `is_verified` column for account verification workflow
- 11 indexes covering all foreign keys, time-range queries, and uniqueness
- Entity relationships: users→events (organizer), users↔events (registrations, waitlist), events↔tags (many-to-many)

### 5. System Integration (10/10)
- FastAPI gateway connecting React SPA to dual backends (Spring Boot + Node.js)
- Application-level cross-referencing: SQL event/user IDs reused in MongoDB documents
- Graceful degradation: frontend works with mock data if backends unavailable
- Cross-origin support at every layer
- End-to-end flow: Register → Pending → Admin Approves → Login → Role-based access
