# Overwatch TeamUp Architecture Document
# Introduction and Goals 
## Requirements Overview 

OverwatchTeamUp is a web application that allows Overwatch players to browse hero statistics and assemble team compositions of five heroes. Hero data (stats, roles, abilities, win rates, pick rates) is sourced from the external OverFast API and stored locally to enable fast, reliable access. Users can create, view, update, and delete named team compositions tied to their account.

**Essential features:**

-   Browse all Overwatch heroes with key stats (role, win rate, pick rate, health, abilities)

-   View detailed hero profiles including abilities and portraits

-   Register and authenticate as a user (JWT-based)

-   Create and manage personal team compositions (5 heroes per team)

-   Hero data kept current via a sync mechanism against the external OverFast API

## Quality Goals 

| Priority | Quality Goal | Motivation | Metric |
|----------|-------------|------------|--------|
| 1 | **Reliability** | Hero data must be consistent and available even when the external API is temporarily unreachable | Hero list endpoint returns data within 500ms even when OverFast API is unreachable; `sync_heroes` is the only code path that calls the external API |
| 2 | **Security** | Team compositions are private per user; authentication and authorization must be enforced | Unauthenticated requests to team composition endpoints return 401; requests with a valid JWT cannot access another user's data (404); tokens older than 30 minutes are rejected |
| 3 | **Maintainability** | Hexagonal architecture (ports & adapters) keeps external dependencies replaceable | Replacing the OverFast API requires changes in exactly one file (`overfast_api_adapter.py`); no direct `import requests` outside of adapters |
| 4 | **Correctness** | Hero stats displayed must accurately reflect the synced upstream data | After `sync_heroes`, hero stats in the database match the OverFast API values for the same hero key; all heroes from the external API are present locally after sync |
| 5 | **Usability** | API responses must be fast and well-structured for frontend consumption | Hero list and detail endpoints respond in under 200ms; all endpoints return consistent JSON following the documented DTO structure |

## Stakeholders 

| Role/Name | Contact | Expectations |
|-----------|---------|--------------|
| Overwatch Players (end users) | — | Quickly look up hero stats and plan team compositions without leaving the app |
| Development Team | — | Clear architecture boundaries, testable code, and documented API contracts |


# Architecture Constraints 

| Constraint | Explanation |
|------------|-------------|
| **React / TypeScript / Vite frontend** | The team chose React 19 with TypeScript and Vite as the frontend stack; switching framework would require a full rewrite of all components |
| **Python / Django backend** | The team has Python expertise; the backend framework is fixed for the duration of the project |
| **PostgreSQL as database** | Chosen due to team familiarity and existing infrastructure; switching engines would require significant migration effort |
| **OverFast API as sole hero data source** | All hero data originates from this third-party public API. It has no SLA and no authentication, meaning it can change or go offline at any time. Hero data must therefore be cached locally rather than fetched live |
| **OverFast API data limitations** | Win rate and pick rate are only available for competitive PC EU rankings. Other regions, platforms, or game modes are not covered |

# Context and Scope {#section-context-and-scope}

OverwatchTeamUp interacts with two external parties: the end users who use the web interface, and the OverFast API from which all hero data originates. Everything else — the React frontend, Django backend, and PostgreSQL database — is internal to the system.

## Business Context {#_business_context}

| Communication Partner | Inputs to the system | Outputs from the system |
|-----------------------|---------------------|------------------------|
| **Overwatch Player (End User)** | Hero search queries, hero slot selections, login/register credentials, team save/update/delete actions | Rendered hero stats and portraits, team composition UI, authentication forms, confirmation feedback |
| **OverFast API** | Hero roster, hero detail (role, abilities, stats, portrait), hero win rate and pick rate per hero key | HTTP GET requests to `/heroes`, `/heroes/{key}`, `/heroes/stats` |

The end user interacts exclusively through the React frontend — never directly with the REST API or the OverFast API. All hero data enters the system through the `sync_heroes` management command and is served to users from the local database.

## Technical Context {#_technical_context}

| Partner | Channel | Protocol | Direction | Notes |
|---------|---------|----------|-----------|-------|
| End User (browser) | TCP port 5173 (dev) | HTTP | Bidirectional | User navigates the React SPA; no direct contact with the backend |
| Frontend → Backend | Vite proxy (`/api` → `http://backend:8000`) in dev; direct HTTP in prod | REST/JSON | Bidirectional | JWT passed as `Authorization: Bearer <token>` on authenticated requests; tokens stored in `localStorage` |
| OverFast API (`overfast-api.tekrop.fr`) | HTTPS | REST/JSON | Pull (system initiates; hero data flows back as response) | Called exclusively by `OverfastAPIAdapter` during `sync_heroes`; three endpoints used: `/heroes`, `/heroes/{key}`, `/heroes/stats` |
| PostgreSQL database | TCP port 5432 (internal Docker network) | PostgreSQL wire protocol | Bidirectional | Accessed via Django ORM; not reachable from outside the Docker network |

# Solution Strategy {#section-solution-strategy}

| Decision | Rationale | Quality Goal |
|----------|-----------|--------------|
| **Hexagonal Architecture (Ports & Adapters)** | The domain is decoupled from Django, the database, and the OverFast API via explicit port interfaces and adapter implementations. External dependencies can be swapped without touching business logic. | Maintainability |
| **Local hero data cache** | Hero data is synced from OverFast into PostgreSQL rather than fetched live per request. The app continues to serve hero data even if the external API is unreachable. | Reliability |
| **`sync_heroes` as the single external API entry point** | All OverFast API calls are isolated in one management command that runs at startup. No view or service calls the API directly, keeping the boundary explicit and testable. | Reliability, Maintainability |
| **JWT stateless authentication** | Authentication is handled via short-lived JWT tokens, requiring no server-side session state. This fits cleanly with a stateless REST API. | Security |
| **TypeScript DTO generation** | Frontend types are auto-generated from DRF serializers via `dto_generation.py`, ensuring the frontend contract always stays in sync with the backend response structure. | Correctness |

# Building Block View {#section-building-block-view}

## Whitebox Overall System {#_whitebox_overall_system}

The backend is a single Django project containing one application module (`heroes`) that holds all domain logic, API endpoints, and data access code. The `config` package is the Django project root and has no business logic.

| Building Block | Responsibility |
|----------------|----------------|
| **`frontend`** (React / TypeScript / Vite SPA) | Renders the user interface; browses heroes, builds team compositions, handles login/register; communicates with the backend via REST/JSON |
| **`heroes`** (Django app) | All domain logic, REST API endpoints, data persistence, external API sync, and DTO generation |
| **`config`** | Django project settings, root URL routing (`/api/` to `heroes`), WSGI/ASGI entry points |

The `heroes` app contains all backend business logic. The frontend is a separate process that communicates with it over HTTP. Everything described in Level 2 is internal to the backend.

```mermaid
graph TD
    User(["End User (Browser)"])
    OverFast(["OverFast API"])
    DB[("PostgreSQL")]

    subgraph System["OverwatchTeamUp (Docker)"]
        Frontend["frontend
React / TypeScript / Vite
port 5173"]
        subgraph Backend["Backend"]
            Config["config
Settings / URL Routing"]
            Heroes["heroes
Domain / Adapters / Views / Services"]
        end
    end

    User -- "HTTP port 5173" --> Frontend
    Frontend -- "REST/JSON via /api proxy" --> Config
    Config --> Heroes
    Heroes -- "HTTPS - sync_heroes only" --> OverFast
    Heroes -- "TCP 5432 / Django ORM" --> DB
```




## Level 2 — `heroes` App Decomposition {#_level_2}

The `heroes` app is organized into layers following the Hexagonal Architecture pattern. Dependencies flow inward: views and adapters depend on ports and domain; domain depends on nothing.

| Layer | Package / File | Responsibility |
|-------|----------------|----------------|
| **Domain** | `heroes/domain/entities.py` | Pure Python dataclasses (`HeroEntity`, `AbilityEntity`, `TeamCompositionEntity`); no framework imports |
| **Ports** | `heroes/ports/` | Abstract interfaces: `HeroPort`, `TeamCompositionPort`, `ExternalHeroSourcePort`; define contracts without implementations |
| **Database Adapters** | `heroes/adapters/hero_database_adapter.py`, `team_composition_adapter.py` | Implement `HeroPort` and `TeamCompositionPort`; translate between Django ORM models and domain entities |
| **External API Adapter** | `heroes/adapters/overfast_api_adapter.py` | Implements `ExternalHeroSourcePort`; fetches hero data from the OverFast API and maps responses to domain entities |
| **Domain Service** | `heroes/services/hero_sync_service.py` | Orchestrates the hero sync: pulls from `ExternalHeroSourcePort`, pushes to `HeroPort` via `upsert` |
| **Django Models** | `heroes/models.py` | ORM schema: `Hero`, `Ability`, `TeamComposition`; persistence only, no domain logic |
| **Views** | `heroes/views.py` | DRF function-based views; receives HTTP requests, calls adapters, returns serialized responses |
| **Serializers** | `heroes/serializers.py` | Translate between domain entities and JSON; `HeroSummarySerializer`, `HeroSerializer`, `TeamCompositionSerializer`, `TeamCompositionCreateUpdateSerializer`, `RegisterSerializer` |
| **Management Commands** | `heroes/management/commands/sync_heroes.py` | Entry point for hero data sync; wires `OverfastAPIAdapter` to `HeroSyncService` to `HeroDataBaseAdapter`; runs at startup |
| **DTO Generation** | `heroes/dto_generation.py`, `heroes/management/commands/generate_dtos.py` | Generates TypeScript types from DRF serializers; keeps frontend types in sync with API responses |

```mermaid
graph TD
    CMD["sync_heroes
(management command)"]
    DTO["dto_generation.py"]

    subgraph APILayer["REST API Layer"]
        Views["views.py"]
        Ser["serializers.py"]
    end

    subgraph SvcLayer["Services"]
        SS["HeroSyncService"]
    end

    subgraph PortLayer["Ports (Interfaces)"]
        HP["HeroPort"]
        TCP["TeamCompositionPort"]
        ESP["ExternalHeroSourcePort"]
    end

    subgraph AdapterLayer["Adapters"]
        HDBA["HeroDataBaseAdapter"]
        TCDA["TeamCompositionDatabaseAdapter"]
        OFA["OverfastAPIAdapter"]
    end

    subgraph DomainLayer["Domain"]
        Entities["entities.py
HeroEntity · AbilityEntity · TeamCompositionEntity"]
    end

    subgraph PersistLayer["Persistence"]
        Models["models.py
Hero · Ability · TeamComposition"]
    end

    CMD --> SS & OFA & HDBA
    SS --> ESP & HP
    OFA --> ESP
    HDBA --> HP & Models
    TCDA --> TCP & Models
    Views --> HDBA & TCDA & Ser
    DTO --> Ser
    HP & TCP & ESP --> Entities
```


# Runtime View {#section-runtime-view}

Three scenarios are documented here — startup sync, hero list request, and team composition creation — as they cover the most architecturally significant interactions between building blocks.

## RT-01: Startup Hero Sync {#_rt_01}

Triggered by Docker Compose at every container start. The `sync_heroes` command is the only code path that contacts the OverFast API.

```mermaid
sequenceDiagram
    participant DC as Docker Compose
    participant CMD as sync_heroes
    participant SS as HeroSyncService
    participant OFA as OverfastAPIAdapter
    participant API as OverFast API
    participant HDBA as HeroDataBaseAdapter
    participant DB as PostgreSQL

    DC->>CMD: python manage.py sync_heroes
    CMD->>SS: sync()
    SS->>OFA: fetch_all()
    OFA->>API: GET /heroes
    API-->>OFA: [{key: ana, ...}, ...]
    OFA->>API: GET /heroes/stats?platform=pc&gamemode=competitive&region=europe
    API-->>OFA: [{hero: ana, winrate: 46.8, pickrate: 26.6}, ...]
    loop for each hero key
        OFA->>API: GET /heroes/{key}
        API-->>OFA: {name, role, abilities, hitpoints, ...}
    end
    OFA-->>SS: list[HeroEntity]
    loop for each HeroEntity
        SS->>HDBA: upsert(hero)
        HDBA->>DB: INSERT ... ON CONFLICT DO UPDATE
    end
    SS-->>CMD: hero count synced
    CMD->>DC: exit 0 → runserver starts
```

## RT-02: Hero List Request {#_rt_02}

The frontend requests all heroes on load (via `SideBar.tsx`). The OverFast API is not involved — data is served entirely from the local database.

```mermaid
sequenceDiagram
    participant Client as Frontend (React SPA)
    participant View as hero_list view
    participant HDBA as HeroDataBaseAdapter
    participant DB as PostgreSQL
    participant Ser as HeroSummarySerializer

    Client->>View: GET /api/heroes/
    View->>HDBA: get_all()
    HDBA->>DB: SELECT * FROM heroes
    DB-->>HDBA: Hero rows
    HDBA-->>View: list[HeroEntity]
    View->>Ser: serialize(heroes, many=True)
    Ser-->>View: JSON
    View-->>Client: 200 OK [{hero_key, display_name, portrait_url, role}, ...]
```

## RT-03: Create Team Composition {#_rt_03}

An authenticated user saves a team composition via the frontend (via `TeamComposition.tsx`). The JWT middleware validates the token before the view is reached. Each hero key in the request body is resolved to a `HeroEntity` before the composition is persisted.

```mermaid
sequenceDiagram
    participant Client as Frontend (React SPA)
    participant JWT as JWT Middleware
    participant View as team_composition_create view
    participant Ser as TeamCompositionCreateUpdateSerializer
    participant HDBA as HeroDataBaseAdapter
    participant TCDA as TeamCompositionDatabaseAdapter
    participant DB as PostgreSQL

    Client->>JWT: POST /api/team-compositions/create/ + Authorization: Bearer <token>
    JWT->>JWT: validate token, extract user
    JWT->>View: request (user attached)
    View->>Ser: validate(request.data)
    Ser-->>View: validated_data {name, hero_1..5 keys}
    loop for each hero_key (5x)
        View->>HDBA: get_by_key(hero_key)
        HDBA->>DB: SELECT FROM heroes WHERE hero_key = ?
        DB-->>HDBA: Hero row
        HDBA-->>View: HeroEntity
    end
    View->>TCDA: create(TeamCompositionEntity, user)
    TCDA->>DB: INSERT INTO team_comps
    DB-->>TCDA: saved row with id
    TCDA-->>View: TeamCompositionEntity
    View-->>Client: 201 Created {id, name, hero_1..5, average_winrate}
```

# Deployment View {#section-deployment-view}

::: formalpara-title
**Content**
:::

The deployment view describes:

1.  technical infrastructure used to execute your system, with
    infrastructure elements like geographical locations, environments,
    computers, processors, channels and net topologies as well as other
    infrastructure elements and

2.  mapping of (software) building blocks to that infrastructure
    elements.

Often systems are executed in different environments, e.g. development
environment, test environment, production environment. In such cases you
should document all relevant environments.

Especially document a deployment view if your software is executed as
distributed system with more than one computer, processor, server or
container or when you design and construct your own hardware processors
and chips.

From a software perspective it is sufficient to capture only those
elements of an infrastructure that are needed to show a deployment of
your building blocks. Hardware architects can go beyond that and
describe an infrastructure to any level of detail they need to capture.

::: formalpara-title
**Motivation**
:::

Software does not run without hardware. This underlying infrastructure
can and will influence a system and/or some cross-cutting concepts.
Therefore, there is a need to know the infrastructure.

::: formalpara-title
**Form**
:::

Maybe a highest level deployment diagram is already contained in section
3.2. as technical context with your own infrastructure as ONE black box.
In this section one can zoom into this black box using additional
deployment diagrams:

-   UML offers deployment diagrams to express that view. Use it,
    probably with nested diagrams, when your infrastructure is more
    complex.

-   When your (hardware) stakeholders prefer other kinds of diagrams
    rather than a deployment diagram, let them use any kind that is able
    to show nodes and channels of the infrastructure.

::: formalpara-title
**Further Information**
:::

See [Deployment View](https://docs.arc42.org/section-7/) in the arc42
documentation.

## Infrastructure Level 1 {#_infrastructure_level_1}

Describe (usually in a combination of diagrams, tables, and text):

-   distribution of a system to multiple locations, environments,
    computers, processors, .., as well as physical connections between
    them

-   important justifications or motivations for this deployment
    structure

-   quality and/or performance features of this infrastructure

-   mapping of software artifacts to elements of this infrastructure

For multiple environments or alternative deployments please copy and
adapt this section of arc42 for all relevant environments.

***\<Overview Diagram\>***

Motivation

:   *\<explanation in text form\>*

Quality and/or Performance Features

:   *\<explanation in text form\>*

Mapping of Building Blocks to Infrastructure

:   *\<description of the mapping\>*

## Infrastructure Level 2 {#_infrastructure_level_2}

Here you can include the internal structure of (some) infrastructure
elements from level 1.

Please copy the structure from level 1 for each selected element.

### *\<Infrastructure Element 1\>* {#_infrastructure_element_1}

*\<diagram + explanation\>*

### *\<Infrastructure Element 2\>* {#_infrastructure_element_2}

*\<diagram + explanation\>*

...​

### *\<Infrastructure Element n\>* {#_infrastructure_element_n}

*\<diagram + explanation\>*

# Cross-cutting Concepts {#section-concepts}

::: formalpara-title
**Content**
:::

This section describes crosscutting concepts (practices, patterns,
regulations or solution ideas). Such concepts are often related to
multiple building blocks. They may include many different topics, such
as the topics shown in the following diagram:

![Possible topics for crosscutting
concepts](images/08-concepts-EN.drawio.png)

::: formalpara-title
**Motivation**
:::

Concepts form the basis for *conceptual integrity* (consistency,
homogeneity) of the architecture. Thus, they are an important
contribution to achieve inner qualities of your system.

This is the place in the template that we provided for a cohesive
specification of such concepts.

Many of these concepts relate to or influence several of your building
blocks.

::: formalpara-title
**Form**
:::

The form can be varied:

-   concept papers with any kind of structure

-   example implementations,especially for technical concepts

-   cross-cutting model excerpts or scenarios using notations of the
    architecture views

::: formalpara-title
**Structure**
:::

Pick **only** the most-needed topics for your system and assign each a
level-2 heading in this section (e.g. 8.1, 8.2 etc).

DO NOT ATTEMPT to cover all of the topics of the aforementioned diagram.

::: formalpara-title
**Further Information**
:::

Some topics within systems often concern multiple building blocks,
hardware elements or development processes. It might be easier to
communicate or document such *cross-cutting* topics at a central
location, instead of repeating them in the description of the concerned
building blocks, hardware elements or development processes.

Certain concepts might concern **all** elements of a system, others
might only be relevant for a few. In the diagram above, logging concerns
all three components, whereas security is relevant only for two
components.

See [Concepts](https://docs.arc42.org/section-8/) in the arc42
documentation.

## *\<Concept 1\>* {#_concept_1}

*\<explanation\>*

## *\<Concept 2\>* {#_concept_2}

*\<explanation\>*

...​

## *\<Concept n\>* {#_concept_n}

*\<explanation\>*

# Architecture Decisions {#section-design-decisions}

::: formalpara-title
**Contents**
:::

Important, expensive, large scale or risky architecture decisions
including rationales. With \"decisions\" we mean selecting one
alternative based on given criteria.

Please use your judgement to decide whether an architectural decision
should be documented here in this central section or whether you better
document it locally (e.g. within the white box template of one building
block).

Avoid redundancy. Refer to section 4, where you already captured the
most important decisions of your architecture.

::: formalpara-title
**Motivation**
:::

Stakeholders of your system should be able to comprehend and retrace
your decisions.

::: formalpara-title
**Form**
:::

Various options:

-   ADR ([Documenting Architecture
    Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions))
    for every important decision

-   List or table, ordered by importance and consequences or:

-   more detailed in form of separate sections per decision

::: formalpara-title
**Further Information**
:::

See [Architecture Decisions](https://docs.arc42.org/section-9/) in the
arc42 documentation. There you will find links and examples about ADR.

# Quality Requirements {#section-quality-scenarios}

The top five quality requirements are defined in section 1.2 with concrete metrics. This section adds lower-priority requirements and expands each goal into a detailed scenario.

## Quality Requirements Overview {#_quality_requirements_overview}

| Category | Quality Requirement |
|----------|-------------------|
| Reliability | Hero data remains available when the OverFast API is unreachable |
| Security | Users can only access and modify their own team compositions |
| Maintainability | External data source can be replaced without changes to domain logic |
| Correctness | Hero stats in the database match the upstream API after every sync |
| Usability | API responses are fast and follow a consistent, documented structure |
| Testability | Domain logic and adapters can be tested independently without a live database or external API |
| Interoperability | The REST API can be consumed by any frontend framework without backend changes |

## Quality Scenarios {#_quality_scenarios}

### QS-01: Hero Data Available When External API Is Down

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-01 |
| **Scenario Name** | Hero Data Available When External API Is Down |
| **Source** | End user |
| **Stimulus** | User requests the hero list while the OverFast API is unreachable |
| **Environment** | Normal runtime; OverFast API is down or timing out |
| **Artifact** | `HeroDataBaseAdapter`, PostgreSQL database |
| **Response** | The system serves hero data from the local database without contacting the external API |
| **Response Measure** | Hero list endpoint returns HTTP 200 with full data within 500ms |

---

### QS-02: Unauthenticated Access to Team Compositions Rejected

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-02 |
| **Scenario Name** | Unauthenticated Access to Team Compositions Rejected |
| **Source** | Anonymous user or client without a JWT token |
| **Stimulus** | GET request to `/api/team-compositions/` without an Authorization header |
| **Environment** | Normal runtime |
| **Artifact** | `team_composition_list` view, JWT authentication middleware |
| **Response** | The system rejects the request without exposing any data |
| **Response Measure** | HTTP 401 returned; no team composition data included in the response |

---

### QS-03: User Cannot Access Another User's Team Composition

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-03 |
| **Scenario Name** | Cross-User Data Isolation |
| **Source** | Authenticated user |
| **Stimulus** | User A sends a GET request for a team composition owned by User B |
| **Environment** | Normal runtime; User A holds a valid JWT |
| **Artifact** | `TeamCompositionDatabaseAdapter`, `team_composition_detail` view |
| **Response** | The system treats the resource as non-existent for User A |
| **Response Measure** | HTTP 404 returned; User B's data is not exposed |

---

### QS-04: External API Adapter Can Be Replaced

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-04 |
| **Scenario Name** | External API Adapter Replacement |
| **Source** | Developer |
| **Stimulus** | OverFast API is replaced by a different hero data source |
| **Environment** | Development; new data source has a different response format |
| **Artifact** | `overfast_api_adapter.py`, `ExternalHeroSourcePort` |
| **Response** | Developer creates a new adapter implementing `ExternalHeroSourcePort`; no changes needed in domain logic, services, or other adapters |
| **Response Measure** | Only `overfast_api_adapter.py` is modified or replaced; all existing tests pass without changes |

---

### QS-05: Hero Stats Match Upstream After Sync

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-05 |
| **Scenario Name** | Hero Stats Correctness After Sync |
| **Source** | `sync_heroes` management command (triggered at startup) |
| **Stimulus** | `sync_heroes` completes successfully |
| **Environment** | Normal startup; OverFast API is reachable |
| **Artifact** | `OverfastAPIAdapter`, `HeroSyncService`, PostgreSQL database |
| **Response** | All heroes returned by the OverFast API are present in the local database with matching stats |
| **Response Measure** | Hero count in DB equals hero count from API; winrate and pickrate values match the API response for every hero key |

---

### QS-06: Hero Endpoints Respond Within Acceptable Time

| Field | Description |
|-------|-------------|
| **Scenario ID** | QS-06 |
| **Scenario Name** | Hero Endpoint Response Time |
| **Source** | End user or frontend client |
| **Stimulus** | GET request to `/api/heroes/` or `/api/heroes/{key}/` |
| **Environment** | Normal runtime; hero data is present in the database |
| **Artifact** | `hero_list` and `hero_detail` views, `HeroDataBaseAdapter` |
| **Response** | The system queries the local database and returns a serialized response |
| **Response Measure** | Response delivered within 200ms |

# Risks and Technical Debts {#section-technical-risks}

## Risks

| Priority | Risk | Impact | Mitigation |
|----------|------|--------|------------|
| High | **OverFast API is a single point of failure** — no SLA, no authentication; it can change its response format or go offline at any time | `sync_heroes` fails silently or crashes; hero data goes stale with no automatic recovery | Cache data locally (already done); monitor the API; implement error handling in `sync_heroes` to alert on failure |
| Medium | **Win rate and pick rate data is narrow** — only sourced from EU competitive PC rankings | Stats may be misleading or irrelevant for players in other regions or game modes | Make the region and game mode configurable; document the data source clearly in the UI |
| Medium | **No rate limiting on any endpoint** — the API is fully open | A client could hammer endpoints, degrading performance for all users | Add rate limiting via Django middleware or a reverse proxy |

## Technical Debts

| Priority | Debt | Impact | Suggested Fix |
|----------|------|--------|---------------|
| High | **Fixed 5-hero team schema** — team size is hardcoded as five separate foreign key columns in the database | Supporting flexible team sizes requires a full schema redesign and migration | Replace the five FK columns with a many-to-many join table |
| Medium | **`sync_heroes` runs on every startup** — no freshness check | Startup is blocked on the external API every time, even if data is already up to date | Add a last-synced timestamp and only re-sync if data is older than a threshold |
| Low | **No pagination on the hero list endpoint** | Works fine for the current roster size but will degrade if the hero pool grows significantly | Add cursor or page-based pagination to `/api/heroes/` |

# Glossary {#section-glossary}

::: formalpara-title
**Contents**
:::

The most important domain and technical terms that your stakeholders use
when discussing the system.

You can also see the glossary as source for translations if you work in
multi-language teams.

::: formalpara-title
**Motivation**
:::

You should clearly define your terms, so that all stakeholders

-   have an identical understanding of these terms

-   do not use synonyms and homonyms

::: formalpara-title
**Form**
:::

A table with columns \<Term\> and \<Definition\>.

Potentially more columns in case you need translations.

::: formalpara-title
**Further Information**
:::

See [Glossary](https://docs.arc42.org/section-12/) in the arc42
documentation.

+----------------------+-----------------------------------------------+
| Term                 | Definition                                    |
+======================+===============================================+
| *\<Term-1\>*         | *\<definition-1\>*                            |
+----------------------+-----------------------------------------------+
| *\<Term-2\>*         | *\<definition-2\>*                            |
+----------------------+-----------------------------------------------+
