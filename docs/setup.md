# Setup

This page describes the minimum steps required to run Overwatch TeamUp locally.

## Prerequisites

- Docker Desktop or a compatible Docker Engine
- Docker Compose
- Optional: Node.js 22 and npm for local frontend commands

## Start the Application

Create a local environment file:

```
cp .env.example .env
```

Start all services:

```
docker compose up
```

Docker Compose starts PostgreSQL, the Django backend, and the React/Vite frontend. The backend runs migrations on startup and syncs hero data from the OverFast API if available.

## Local URLs

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:5173> |
| Backend API | <http://localhost:8000/api/> |
| PostgreSQL | `localhost:5432` |

## Dev Commands

Start all containers in detached mode:

```bash
docker compose up -d
```

Apply the Django database migrations manually:

```bash
docker compose run --rm backend python manage.py migrate
```

Load the local demo records:

```bash
docker compose run --rm backend python manage.py loaddata heroes_demo
```

Open a PostgreSQL shell inside the database container:

```bash
docker exec -it overwatch-db psql -U dbuser -d overwatch
```

Stop all containers and reset the database volume:

```bash
docker compose down -v
```

Install the backend dependencies locally:

```bash
python -m pip install -r requirements.txt
```

Regenerate the hash-locked backend dependencies after changing `backend/requirements.txt`:

```bash
pip-compile --generate-hashes --output-file=backend/requirements.lock backend/requirements.txt
```

Create and activate a Python virtual environment on Windows:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

Generate the TypeScript API DTOs in the backend output directory:

```bash
docker compose run --rm backend python manage.py generate_dtos
```

Generate the TypeScript API DTOs directly in the frontend source directory from a local backend environment:

```bash
python backend/app/manage.py generate_dtos --output ../../frontend/src/api/dtos.ts
```
