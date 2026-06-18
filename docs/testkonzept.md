# Testkonzept

Dieses Dokument beschreibt die Teststrategie fuer Overwatch TeamUp. Ziel ist, die zentralen Risiken des Systems automatisiert abzusichern: korrekte Fachlogik, stabile API-Vertraege, Zugriffsschutz, Architekturregeln und die wichtigsten Nutzerfluesse im Browser.

## Testpyramide

Das Projekt nutzt eine mehrstufige Testpyramide:

| Ebene | Zweck | Tools | Ort |
|-------|-------|-------|-----|
| Unit-Tests | Pruefen einzelne Komponenten, Funktionen und Domainregeln isoliert | Django TestCase, unittest, Vitest, React Testing Library | `backend/app/heroes/test_team_composition_service.py`, `frontend/src/*.test.tsx` |
| Integrationstests | Pruefen Zusammenspiel von API, Serializern, Authentifizierung, ORM und Testdatenbank | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Security-/Penetration-nahe Tests | Pruefen abgesicherte Endpunkte, JWT-Flows und Zugriffsschutz zwischen Benutzern | Django TestCase, DRF APIClient | `backend/app/heroes/tests.py`, `backend/app/heroes/test_integration.py` |
| Architekturtests | Pruefen, ob Backend-Abhaengigkeiten der dokumentierten Architektur entsprechen | pytestarch, PlantUML-Regeln | `backend/app/architecture_tests/` |
| End-to-End-Tests | Pruefen komplette Nutzerfluesse im echten Browser gegen Frontend, Backend und Datenbank | Playwright | `frontend/e2e/` |
| Statische Analyse | Findet Code-Smells, potenzielle Bugs und Regelverletzungen vor der Ausfuehrung | Ruff, ESLint, SonarQube | CI-Pipeline |

## Backend-Tests

Die Backend-Tests werden mit Django und der Django-Testdatenbank ausgefuehrt. Dadurch koennen API-Endpunkte, Persistenz und Authentifizierung ohne manuelle Datenbankeingriffe automatisiert getestet werden.

Wichtige Testbereiche:

- Domainregeln fuer Team-Compositions: genau fuenf Heroes, keine Duplikate, Role-Queue-Verteilung mit einem Tank, zwei Damage und zwei Support.
- Hero-API: Listen- und Detail-Endpunkte, unbekannte Heroes, Response-Struktur.
- Team-Composition-API: Erstellen, Lesen, Aktualisieren und Loeschen.
- Datenbankintegration: Adapter, Constraints, Cascade-/Restrict-Verhalten.
- DTO-Generierung: TypeScript-DTOs werden aus Backend-Serializern erzeugt.
- Resiliente OverFast-Anbindung: Timeout-Nutzung und nicht-blockierender Sync-Fehlerfall.

Ausfuehrung:

```bash
docker compose run --rm backend python manage.py test heroes
```

In CI werden die Backend-Tests mit Coverage ausgefuehrt:

```bash
coverage run --rcfile=backend/app/.coveragerc backend/app/manage.py test heroes
coverage xml --rcfile=backend/app/.coveragerc -o backend/app/coverage.xml
coverage report --rcfile=backend/app/.coveragerc
```

Der XML-Report wird von SonarQube eingelesen.

## Frontend-Unit-Tests

Die Frontend-Unit-Tests pruefen React-Komponenten isoliert. Sie decken Rendering, Filterlogik, Button-Zustaende und grundlegende UI-Zustaende ab.

Wichtige Testbereiche:

- Hero-Detailansicht und Fehleranzeige.
- Hero- und Team-Listen inklusive Filterung.
- Team-Composition-Slots und deaktivierte Aktionen ohne Login.
- Login-/Registrierungsansichten.
- Sidebar-Zustaende.

Ausfuehrung:

```bash
cd frontend
npm test
```

Vitest erzeugt dabei einen LCOV-Report unter:

```text
frontend/coverage/lcov.info
```

Dieser Report wird von SonarQube fuer die Frontend-Coverage eingelesen. Generierte DTOs, Testdateien, e2e-Tests und der Einstiegspunkt `main.tsx` sind aus der Coverage-Berechnung ausgeschlossen.

## Integrationstests

Integrationstests pruefen bewusst mehrere Schichten zusammen. Im Backend betrifft das vor allem:

- URL-Routing, Views und Serializer.
- DRF-Testclient und HTTP-Statuscodes.
- Authentifizierung und JWT-Handling.
- Django ORM und PostgreSQL-Testdatenbank.
- Adapter und Domain-Service.

Beispiele sind:

- Ein echter JWT-Access-Token erlaubt Zugriff auf geschuetzte Team-Composition-Endpunkte.
- Unauthentifizierte Requests erhalten `401`.
- Ein Benutzer kann Team-Compositions anderer Benutzer weder sehen, aktualisieren noch loeschen.
- Persistierte Team-Compositions werden korrekt aus der Datenbank gelesen.

Diese Tests zaehlen nicht als reine Unit-Tests, weil sie mehrere Anwendungsschichten und die Testdatenbank einbeziehen.

## Security-Tests

Die Security-/Penetration-nahen Tests sind als automatisierte Integrationstests umgesetzt. Sie fokussieren die abgesicherten Endpunkte und typische Broken-Access-Control-Risiken.

Abgedeckte Szenarien:

- Zugriff auf Team-Compositions ohne Login wird mit `401` abgelehnt.
- Listen-, Detail-, Update- und Delete-Zugriffe liefern nur Daten des angemeldeten Benutzers.
- Fremde Team-Compositions werden fuer den anfragenden Benutzer wie nicht vorhanden behandelt (`404`).
- Login erzeugt Access- und Refresh-Token.
- Token Refresh erzeugt einen neuen Access-Token.
- Logout blacklisted den Refresh-Token.
- Doppelte Usernamen werden bei Registrierung abgelehnt.

Diese Tests ersetzen keinen vollstaendigen manuellen Penetrationstest, erfuellen aber die Projektanforderung, abgesicherte Endpunkte automatisiert auf Sicherheitslogik zu pruefen.

## Architekturtests

Die Architekturtests pruefen, ob die Backend-Module den dokumentierten Abhaengigkeitsregeln folgen. Die erlaubten Abhaengigkeiten sind in einer PlantUML-Datei beschrieben.

Ausfuehrung:

```bash
cd backend/app
python -m unittest discover -s architecture_tests -v
```

Damit wird insbesondere abgesichert, dass die hexagonale Struktur mit Domain, Ports, Adaptern, Services und Views nicht unbeabsichtigt verletzt wird.

## End-to-End-Tests

Die e2e-Tests laufen mit Playwright in einem echten Chromium-Browser gegen die laufende Anwendung. Sie pruefen den kompletten Weg von UI ueber Frontend-Code, REST-API, Backend und Datenbank.

Aktuelle e2e-Szenarien:

- Hero-Suche: App oeffnen, Hero aus der API laden, im UI suchen, anklicken und Detailansicht pruefen.
- Authentifizierter Team-Flow: User registrieren, einloggen, Team mit einem Tank, zwei Damage und zwei Support erstellen, speichern und ueber die Team-Liste wieder laden.

Lokale Ausfuehrung mit laufender Anwendung:

```bash
cd frontend
npm run test:e2e
```

Container-basierte Ausfuehrung:

```bash
docker run --rm -v "${PWD}/frontend:/work" -w /work \
  -e PLAYWRIGHT_BASE_URL=http://host.docker.internal:5173 \
  mcr.microsoft.com/playwright:v1.61.0-noble \
  sh -c "npm ci && npx playwright test"
```

In CI werden vor den e2e-Tests deterministische Testdaten geladen:

```bash
python manage.py loaddata e2e_heroes
```

Dadurch haengen die e2e-Tests nicht von der aktuellen Verfuegbarkeit oder dem Datenbestand der OverFast API ab.

## Statische Analyse und Linting

Das Projekt nutzt zwei Linter:

- Ruff fuer Python-Backend-Code.
- ESLint fuer React-/TypeScript-Frontend-Code.

Ausfuehrung:

```bash
ruff check backend/app
```

```bash
cd frontend
npm run lint
```

Zusaetzlich analysiert SonarQube Backend- und Frontend-Code. SonarQube fuehrt keine Tests selbst aus, sondern liest die zuvor erzeugten Coverage-Reports ein:

```properties
sonar.python.coverage.reportPaths=backend/app/coverage.xml
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
```

## CI-Pipeline

Die GitHub Actions Pipeline fuehrt folgende Qualitaetsschritte automatisiert aus:

1. Backend-Dependencies installieren.
2. Frontend-Dependencies installieren.
3. Backend linten mit Ruff.
4. Frontend linten mit ESLint.
5. Django-Migrations pruefen.
6. Datenbankmigrationen anwenden.
7. Architekturtests ausfuehren.
8. Backend-Tests mit Coverage ausfuehren.
9. Frontend-Unit-Tests mit Coverage ausfuehren.
10. Frontend bauen.
11. Playwright-Browser installieren.
12. e2e-Testdaten laden.
13. Backend und Frontend fuer e2e-Tests starten.
14. Playwright-e2e-Tests ausfuehren.
15. SonarQube-Analyse ausfuehren.

Damit werden sowohl schnelle statische Checks als auch automatisierte Tests ueber mehrere Ebenen der Testpyramide bei jedem Push und Pull Request ausgefuehrt.

## Coverage-Strategie

Die Coverage wird fuer Backend und Frontend an SonarQube uebergeben:

- Backend-Coverage wird aus den Django-Tests ueber `coverage.py` erzeugt.
- Frontend-Coverage wird aus den Vitest-Unit-Tests ueber LCOV erzeugt.

Nicht in die Coverage-Berechnung einbezogen werden:

- Testdateien.
- Django-Migrations.
- generierte DTOs.
- e2e-Tests.
- Frontend-Einstiegspunkt `main.tsx`.

E2E-Tests und Architekturtests werden bewusst nicht als Line-Coverage verrechnet. Sie pruefen Nutzerfluesse und Architekturregeln, liefern aber keine stabile und aussagekraeftige Line-Coverage-Metrik.

## Grenzen des Testkonzepts

Folgende Punkte sind bewusst nicht oder nur teilweise abgedeckt:

- Kein vollstaendiger manueller Penetrationstest mit Werkzeugen wie OWASP ZAP.
- Keine Last- oder Performance-Tests.
- Keine Browser-Matrix ueber mehrere Browser hinweg; Playwright laeuft aktuell mit Chromium.
- Frontend-Unit-Coverage ist niedriger als Backend-Coverage, wird aber durch e2e-Tests und statische Analyse ergaenzt.

Diese Grenzen sind fuer den aktuellen Projektumfang akzeptiert und koennen bei einer Weiterentwicklung gezielt ausgebaut werden.
