# Test Concept

This document summarizes the automated test strategy for Overwatch TeamUp. The goal is to verify the main project risks: domain behavior, API contracts, authentication and access control, architecture rules, and the most important browser-based user flows.

## Test Levels

| Level | Purpose | Tools | Location |
|-------|---------|-------|----------|
| Unit tests | Verify isolated domain logic and React components | Django TestCase, unittest, Vitest, React Testing Library | `backend/app/heroes/test_team_composition_service.py`, `frontend/src/*.test.tsx` |
| Integration tests | Verify API, serializers, authentication, ORM, and database behavior together | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Security tests | Verify protected endpoints, JWT flows, and user isolation | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Architecture tests | Verify backend and frontend dependency rules | unittest, pytestarch, TypeScript compiler API, Vitest | `backend/app/architecture_tests/`, `frontend/src/architecture.test.ts` |
| End-to-end tests | Verify complete user flows in a real browser | Playwright | `frontend/e2e/` |
| Static analysis | Detect code smells and rule violations | Ruff, ESLint, SonarQube | CI pipeline |

## Backend Tests

Backend tests use Django's test framework and a test database. They cover:

- Team composition rules: exactly five heroes, no duplicates, and one Tank, two Damage, two Support heroes.
- Hero API list and detail endpoints.
- Team composition create, read, update, and delete behavior.
- Authentication, JWT handling, and user-specific access control.
- DTO generation from backend serializers.
- Resilient OverFast integration, including timeout and retry behavior.

Run locally:

```bash
docker compose run --rm backend python manage.py test heroes
```

In CI, backend coverage is generated with `coverage.py` and imported by SonarQube through `backend/app/coverage.xml`.

## Frontend Unit Tests

Frontend unit tests use Vitest and React Testing Library. They cover component rendering, filtering, disabled states, login and registration views, team composition slots, and sidebar states.

Run locally:

```bash
cd frontend
npm test
```

Vitest writes frontend coverage to `frontend/coverage/lcov.info`, which is imported by SonarQube.

## Integration and Security Tests

The integration and security tests are API-based tests against Django, DRF, authentication, and the test database. They are not pure unit tests because several application layers are tested together.

Covered security scenarios include:

- Unauthenticated access to team composition endpoints returns `401`.
- Users can only list, read, update, and delete their own team compositions.
- Team compositions owned by another user are treated as not found (`404`).
- Login, token refresh, logout, and duplicate registration behavior are verified.

These automated tests cover the security logic of the application. They do not replace a full manual penetration test with tools such as OWASP ZAP.

## Architecture Tests

Architecture tests check that backend modules follow the documented dependency rules for domain, ports, adapters, services, and views. Frontend architecture tests prevent circular imports, keep data and authentication infrastructure independent from UI modules, and ensure protected API calls use the authenticated request module.

Run locally:

```bash
cd backend/app
python -m unittest discover -s architecture_tests -v
```

Run the frontend architecture tests locally:

```bash
cd frontend
npm run test:architecture
```

## End-to-End Tests

End-to-end tests use Playwright with Chromium against the running frontend, backend, and database.

Current scenarios:

- Hero search and detail view.
- Registration, login, valid team creation, saving, and loading the saved team.

Run locally after starting the application:

```bash
cd frontend
npm run test:e2e
```

In CI, deterministic e2e hero data is loaded before the tests with:

```bash
python manage.py loaddata e2e_heroes
```

## Static Analysis and CI

The project uses Ruff for Python, ESLint for React/TypeScript, and SonarQube for code analysis and coverage reporting.

Run linters locally:

```bash
ruff check backend/app
```

```bash
cd frontend
npm run lint
```

The CI pipeline runs backend linting, frontend linting, migration checks, architecture tests, backend tests with coverage, frontend unit tests with coverage, frontend build, Playwright e2e tests, and SonarQube analysis.

## Coverage Strategy

SonarQube imports:

- Backend coverage from `backend/app/coverage.xml`.
- Frontend coverage from `frontend/coverage/lcov.info`.

Excluded from coverage calculation are test files, Django migrations, generated DTOs, e2e tests, and the frontend entry point `main.tsx`. Architecture and e2e tests are not counted as line coverage because they verify structure and user flows rather than providing a stable line coverage metric.

## Test Levels

| Level | Purpose | Tools |
|-------|---------|-------|
| Unit tests | Verify isolated domain logic and React components | Django TestCase, unittest, Vitest, React Testing Library |
| Integration tests | Verify API, serializers, authentication, ORM, and database behavior together | Django TestCase, DRF APIClient |
| Security tests | Verify protected endpoints, JWT flows, and user isolation | Django TestCase, DRF APIClient |
| Architecture tests | Verify backend and frontend dependency rules | unittest, pytestarch, TypeScript compiler API, Vitest |
| End-to-end tests | Verify complete user flows in a real browser | Playwright | 
| Static analysis | Detect code smells and rule violations | Ruff, ESLint, SonarQube | CI pipeline |