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