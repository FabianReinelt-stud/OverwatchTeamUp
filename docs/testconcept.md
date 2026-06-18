# Test Concept

This document describes the test strategy for Overwatch TeamUp. The goal is to automatically verify the main risks of the system: correct domain behavior, stable API contracts, access control, architecture rules, and the most important browser-based user flows.

## Test Pyramid

The project uses a multi-level test pyramid:

| Level | Purpose | Tools | Location |
|-------|---------|-------|----------|
| Unit tests | Verify individual components, functions, and domain rules in isolation | Django TestCase, unittest, Vitest, React Testing Library | `backend/app/heroes/test_team_composition_service.py`, `frontend/src/*.test.tsx` |
| Integration tests | Verify API, serializers, authentication, ORM, and the test database together | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Security-related tests | Verify protected endpoints, JWT flows, and user isolation | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Architecture tests | Verify that backend dependencies follow the documented architecture rules | pytestarch, PlantUML rules | `backend/app/architecture_tests/` |
| End-to-end tests | Verify complete user flows in a real browser against frontend, backend, and database | Playwright | `frontend/e2e/` |
| Static analysis | Detect code smells, potential bugs, and rule violations before runtime | Ruff, ESLint, SonarQube | CI pipeline |

## Backend Tests

Backend tests run with Django and the Django test database. This allows API endpoints, persistence, and authentication to be tested automatically without manual database setup.

Important test areas:

- Domain rules for team compositions: exactly five heroes, no duplicates, and role queue distribution with one Tank, two Damage, and two Support heroes.
- Hero API: list and detail endpoints, unknown heroes, response structure.
- Team composition API: create, read, update, and delete behavior.
- Database integration: adapters, constraints, cascade and restrict behavior.
- DTO generation: TypeScript DTOs generated from backend serializers.
- Resilient OverFast integration: timeout usage and non-blocking sync failure behavior.

Run locally:

```bash
docker compose run --rm backend python manage.py test heroes
```

In CI, backend tests are executed with coverage:

```bash
coverage run --rcfile=backend/app/.coveragerc backend/app/manage.py test heroes
coverage xml --rcfile=backend/app/.coveragerc -o backend/app/coverage.xml
coverage report --rcfile=backend/app/.coveragerc
```

The XML report is imported by SonarQube.

## Frontend Unit Tests

Frontend unit tests verify React components in isolation. They cover rendering, filtering logic, disabled button states, and basic UI states.

Important test areas:

- Hero detail view and error display.
- Hero and team lists including filtering.
- Team composition slots and disabled actions without login.
- Login and registration views.
- Sidebar states.

Run locally:

```bash
cd frontend
npm test
```

Vitest generates an LCOV report at:

```text
frontend/coverage/lcov.info
```

This report is imported by SonarQube for frontend coverage. Generated DTOs, test files, e2e tests, and the frontend entry point `main.tsx` are excluded from coverage calculation.

## Integration Tests

Integration tests intentionally verify multiple layers together. In the backend this mainly includes:

- URL routing, views, and serializers.
- DRF test client and HTTP status codes.
- Authentication and JWT handling.
- Django ORM and PostgreSQL test database.
- Adapters and domain services.

Examples:

- A real JWT access token grants access to protected team composition endpoints.
- Unauthenticated requests return `401`.
- A user cannot list, read, update, or delete another user's team compositions.
- Persisted team compositions are correctly read from the database.

These tests are not pure unit tests because they include multiple application layers and the test database.

## Security Tests

The security-related tests are implemented as automated integration tests. They focus on protected endpoints and common broken access control risks.

Covered scenarios:

- Access to team compositions without login is rejected with `401`.
- List, detail, update, and delete operations only expose data owned by the authenticated user.
- Team compositions owned by another user are treated as not found (`404`).
- Login returns access and refresh tokens.
- Token refresh returns a new access token.
- Logout blacklists the refresh token.
- Duplicate usernames are rejected during registration.

These tests do not replace a full manual penetration test with tools such as OWASP ZAP. They do, however, fulfill the project requirement to automatically test the security logic of protected endpoints.

## Architecture Tests

Architecture tests verify that backend modules follow the documented dependency rules. The allowed dependencies are described in a PlantUML file.

Run locally:

```bash
cd backend/app
python -m unittest discover -s architecture_tests -v
```

This protects the hexagonal backend structure with domain, ports, adapters, services, and views from accidental dependency violations.

## End-to-End Tests

End-to-end tests run with Playwright in a real Chromium browser against the running application. They verify the full path from UI through frontend code, REST API, backend, and database.

Current e2e scenarios:

- Hero search: open the app, load a hero from the API, search for it in the UI, select it, and verify the detail view.
- Authenticated team flow: register a user, log in, create a team with one Tank, two Damage, and two Support heroes, save it, and load it again from the team list.

Run locally against a running application:

```bash
cd frontend
npm run test:e2e
```

Container-based execution:

```bash
docker run --rm -v "${PWD}/frontend:/work" -w /work \
  -e PLAYWRIGHT_BASE_URL=http://host.docker.internal:5173 \
  mcr.microsoft.com/playwright:v1.61.0-noble \
  sh -c "npm ci && npx playwright test"
```

In CI, deterministic e2e data is loaded before the tests:

```bash
python manage.py loaddata e2e_heroes
```

This makes the e2e tests independent from the current availability and data state of the OverFast API.

## Static Analysis and Linting

The project uses two linters:

- Ruff for Python backend code.
- ESLint for React and TypeScript frontend code.

Run locally:

```bash
ruff check backend/app
```

```bash
cd frontend
npm run lint
```

SonarQube additionally analyzes backend and frontend code. SonarQube does not run tests by itself; it imports coverage reports that were generated earlier in the pipeline:

```properties
sonar.python.coverage.reportPaths=backend/app/coverage.xml
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
```

## CI Pipeline

The GitHub Actions pipeline runs the following quality steps automatically:

1. Install backend dependencies.
2. Install frontend dependencies.
3. Lint backend with Ruff.
4. Lint frontend with ESLint.
5. Check Django migrations.
6. Apply database migrations.
7. Run architecture tests.
8. Run backend tests with coverage.
9. Run frontend unit tests with coverage.
10. Build the frontend.
11. Install Playwright browsers.
12. Load e2e test data.
13. Start backend and frontend for e2e tests.
14. Run Playwright e2e tests.
15. Run SonarQube analysis.

This combines fast static checks with automated tests across multiple levels of the test pyramid for every push and pull request.

## Coverage Strategy

Coverage is imported into SonarQube for backend and frontend code:

- Backend coverage is generated from Django tests using `coverage.py`.
- Frontend coverage is generated from Vitest unit tests using LCOV.

Excluded from coverage calculation:

- Test files.
- Django migrations.
- Generated DTOs.
- e2e tests.
- Frontend entry point `main.tsx`.

E2E tests and architecture tests are deliberately not counted as line coverage. They verify user flows and architecture rules, but they do not provide a stable and meaningful line coverage metric.

## Limitations

The following areas are not covered or only partially covered:

- No full manual penetration test with tools such as OWASP ZAP.
- No load or performance tests.
- No browser matrix across multiple browsers; Playwright currently runs with Chromium.
- Frontend unit coverage is lower than backend coverage, but it is complemented by e2e tests and static analysis.

These limitations are accepted for the current project scope and can be addressed in future development.
