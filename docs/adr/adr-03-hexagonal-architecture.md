# ADR-03: Hexagonal Architecture (Ports & Adapters)

## Status

Accepted

## Date

2026-05-15

## Context

The backend depends on two external systems, the OverFast API and PostgreSQL, that can change independently of the business logic. We wanted to test the domain without live infrastructure and replace external systems without modifying the core use cases.

## Decision

Apply the Hexagonal Architecture pattern to team composition management and hero synchronization. Domain entities have no framework dependencies. Application services access hero persistence, team composition persistence, and OverFast through the `HeroPort`, `TeamCompositionPort`, and `ExternalHeroSourcePort` interfaces. Concrete adapters implement these ports. Authentication and simple hero queries continue to use standard Django and DRF patterns.

## Alternatives Considered

### Option 1: Hexagonal Architecture (Ports & Adapters)

- Pros: Application services can be tested with in-memory port implementations; OverFast and database access remain outside those services.
- Cons: More files and indirection than a plain Django CRUD app; new contributors must understand the pattern before making changes.

### Option 2: Plain Django MVT / CRUD

- Pros: Less boilerplate; simpler mental model for Django developers.
- Cons: Business logic can become coupled to ORM models and HTTP concerns as the codebase grows.

## Consequences

- (+) `HeroSyncService` and `TeamCompositionService` can be tested with in-memory port implementations.
- (+) OverFast and database access remain outside these application services.
- (−) The additional interfaces and mappings add indirection.
- (−) Authentication, simple hero queries, and sync-state persistence do not yet follow the same structure.

## References

- `heroes/ports/` — abstract port interfaces.
- `heroes/adapters/` — concrete adapter implementations.
- `heroes/domain/entities.py` — pure Python domain entities with no framework imports.
- See [ADR-01](adr-01-python-django.md) — the core use cases keep Django ORM access in adapters, while the HTTP and authentication layers still use Django and DRF directly.
- See [ADR-04](adr-04-postgresql.md) — hero, team composition, and sync-state persistence use database adapters; Django authentication uses its own ORM integration.
