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
PORT=5001

DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=team_attendance_db
DB_PORT=5433
DB_HOST=localhost
AUTH_TOKEN_SECRET=change-this-dev-secret
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
http://localhost:5001
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

### Login

```txt
POST http://localhost:5001/api/auth/login
```

Demo accounts use the password `Password123!`:

```txt
Admin: mark.evans@company.com
Manager: alex.turner@company.com
Employee: priya.shah@company.com
```

### Employees

```txt
http://localhost:5001/api/employees
```

This endpoint requires a bearer token. Admin users can view all employees; manager users can view themselves and their direct reports.

### Schedules

```txt
http://localhost:5001/api/schedules
```
