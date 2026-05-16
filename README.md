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
Start container with:
```bash
docker compose up -d #-d optional for detached terminal
```
The container starts listening at `localhost:5432` for a backend connection. Authenticate with `user=dbuser` and `password=secret`.

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

### Create  Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### SonarQube Account
User: admin
Password: Overwatchteamup1#