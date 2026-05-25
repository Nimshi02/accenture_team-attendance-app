# Team Attendance App

Hybrid workforce attendance and work location management system developed using React, Node.js, Express, PostgreSQL, and Docker.

## Tech Stack

- React.js
- Node.js
- Express.js
- PostgreSQL
- Docker

---

# Project Setup

## 1. Clone Repository

```bash
git clone <repo-url>
cd team-attendance-app
```

---

## 2. Setup Environment Variables

### Root `.env`

Create `.env` in project root:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=team_attendance_db
POSTGRES_PORT=5433
```

### Backend `.env`

Create `backend/.env`:

```env
PORT=5000

DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=team_attendance_db
DB_PORT=5433
DB_HOST=localhost
```

---

## 3. Start PostgreSQL Docker Container

```bash
docker compose up -d
```

---

## 4. Backend Setup

```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

## API Test Endpoints

### Employees

```txt
http://localhost:5000/api/employees
```

### Schedules

```txt
http://localhost:5000/api/schedules
```