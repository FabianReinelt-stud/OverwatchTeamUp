# Overwatch TeamUp

[![CI](https://github.com/FabianReinelt-stud/OverwatchTeamUp/actions/workflows/sonarqube.yml/badge.svg)](https://github.com/FabianReinelt-stud/OverwatchTeamUp/actions/workflows/sonarqube.yml)

A web application for Overwatch players to browse hero statistics and build team compositions.

## What it does

- Browse all Overwatch heroes with stats (role, win rate, pick rate, health, abilities)
- View detailed hero profiles including abilities and portraits
- Register and log in with a personal account
- Create, save, update, and delete named team compositions of 5 heroes
- Hero data is automatically synced from the [OverFast API](https://overfast-api.tekrop.fr) on startup

## Project Links
- [Documentation](https://overwatchteamup.readthedocs.io/en/latest/)
- [SonarCloud Analysis](https://sonarcloud.io/project/overview?id=FabianReinelt-stud_OverwatchTeamUp)
## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, MUI |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) |
| Infrastructure | Docker Compose |

## Quick Start

Create your local environment file:

```bash
cp .env.example .env
```

Start the application:

```bash
docker compose up -d
```

The services are then available at:

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:5173> |
| Backend API | <http://localhost:8000/api/> |

## Tests

Run the backend unit, integration, API, and security tests:

```bash
docker compose run --rm backend python manage.py test heroes
```

Run the backend architecture tests:

```bash
docker compose run --rm backend python -m unittest discover -s architecture_tests -v
```

Run the frontend architecture tests:

```bash
cd frontend
npm run test:architecture
```

Run the frontend unit tests with coverage:

```bash
cd frontend
npm test -- --run
```

Run the Playwright end-to-end tests while the application is running:

```bash
cd frontend
npm run test:e2e
```

## Documentation

- [Setup](docs/setup.md) — how to run the project locally
- [Architecture (arc42)](docs/architecture/arc42.md) — full architecture documentation
- [C4 Model](docs/architecture/c4-model.md) — context and container diagrams
- [API DTOs](docs/api-dtos.md) — TypeScript types generated from backend serializers
