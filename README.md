# OverwatchTeamUp
### Scope
* Nutzer kann nach Hero per Name suchen
* Anzeigen von Hero Stats per Suchleiste oder allgemeiner Liste aller Heroes
* Nutzer kann Team Comp abspeichern (persistente Speicherung) und diese auch wieder aufrufen

Backend: Java + Spring Boot<br>
Frontend: React mit Typescript<br>
Datenbank: Postgres
## Docker
### Postgres DB Container Notes
Create a local `.env` from `.env.example` and set your development secrets
before starting Docker Compose.

Start container with:
```bash
docker compose up -d #-d optional for detached terminal
```
The container starts listening at `localhost:5432` for a backend connection.
Use the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values from
your local `.env` when connecting.

Apply the Django schema migrations after starting the database:
```bash
docker compose run --rm backend python manage.py migrate
```

Load the local demo records when you want sample heroes and a team composition:
```bash
docker compose run --rm backend python manage.py loaddata heroes_demo
```

Manually inspect DB and execute SQL-queries by opening a psql shell inside the container (or use with PGAdmin or DBeaver): 
```bash
docker exec -it overwatch-db psql -U dbuser -d overwatch
```
Reset the DB if needed:
```bash
docker compose down -v #-v resets the docker volume
```

## Backend 
### Install required Packages
```bash
python -m pip install -r requirements.txt
```

The backend Docker image installs the hash-locked runtime dependencies from
`backend/requirements.lock`. Regenerate the lock file after changing
`backend/requirements.txt`:
```bash
pip-compile --generate-hashes --output-file=backend/requirements.lock backend/requirements.txt
```

### Create  Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### Generate Frontend DTOs
TypeScript DTOs can be generated from the backend DRF serializers:
```bash
docker compose run --rm backend python manage.py generate_dtos
```

By default this writes:
```text
backend/app/generated/api-dtos.ts
```

To use these in the React frontend code, write them directly into the frontend source folder from a local 
backend environment:
```bash
python backend/app/manage.py generate_dtos --output ../../frontend/src/api/dtos.ts
```

### SonarQube Account
User: admin
Password: Overwatchteamup1#


| Method | Path | View |
|--------|------|------|
| GET | `/api/heroes/` | `hero_list` |
| GET | `/api/heroes/<hero_key>/` | `hero_detail` |
| GET | `/api/team-compositions/` | `team_composition_list` |
| GET | `/api/team-compositions/<id>/` | `team_composition_detail` |
| POST | `/api/team-compositions/create/` | `team_composition_create` |
| PUT | `/api/team-compositions/<id>/update/` | `team_composition_update` |
| DELETE | `/api/team-compositions/<id>/delete/` | `team_composition_delete` |
