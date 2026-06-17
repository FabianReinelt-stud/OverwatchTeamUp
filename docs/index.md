# Overwatch TeamUp

A web application for Overwatch players to browse hero statistics and build team compositions.

## What it does

- Browse all Overwatch heroes with stats (role, win rate, pick rate, health, abilities)
- View detailed hero profiles including abilities and portraits
- Register and log in with a personal account
- Create, save, update, and delete named team compositions of 5 heroes
- Hero data is automatically synced from the [OverFast API](https://overfast-api.tekrop.fr) on startup

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, MUI |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) |
| Infrastructure | Docker Compose |

## Documentation

- [Setup](setup.md) — how to run the project locally
- [Architecture (arc42)](architecture/arc42.md) — full architecture documentation
- [C4 Model](architecture/c4-model.md) — context and container diagrams
- [API DTOs](api-dtos.md) — TypeScript types generated from backend serializers
