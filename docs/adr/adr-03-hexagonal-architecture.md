# ADR-03: Hexagonal Architecture (Ports & Adapters)

## Status

Accepted

## Date

2025-01-01

## Context

The backend depends on two external systems — the OverFast API and PostgreSQL — that could change independently of the business logic. The team wanted the domain to be testable without live infrastructure and for external systems to be swappable without touching core logic.

## Decision

Apply the Hexagonal Architecture pattern. The domain layer (entities, services) has no framework or infrastructure dependencies. All external dependencies are accessed through abstract port interfaces (`HeroPort`, `TeamCompositionPort`, `ExternalHeroSourcePort`). Concrete adapters implement those ports and live outside the domain.

## Alternatives Considered

### Option 1: Hexagonal Architecture (Ports & Adapters)

- Pros: Domain logic is testable with stub adapters; external systems are swappable by changing one file; business rules cannot leak into infrastructure code.
- Cons: More files and indirection than a plain Django CRUD app; new contributors must understand the pattern before making changes.

### Option 2: Plain Django MVT / CRUD

- Pros: Less boilerplate; simpler mental model for Django developers.
- Cons: Business logic becomes coupled to ORM models and the HTTP layer; replacing the external API or database would require changes throughout the codebase.

## Consequences

- (+) The OverFast API can be replaced by changing exactly one file (`overfast_api_adapter.py`).
- (+) Domain logic is testable with stub adapters; no live database or external API needed in unit tests.
- (+) Business rules cannot leak into infrastructure code.
- (−) More files and indirection than a plain Django CRUD app.
- (−) New contributors must understand the pattern before making changes.

## References

- `heroes/ports/` — abstract port interfaces.
- `heroes/adapters/` — concrete adapter implementations.
- `heroes/domain/entities.py` — pure Python domain entities with no framework imports.
- See [ADR-01](adr-01-python-django.md) — Django is confined to the adapter layer by this pattern.
- See [ADR-04](adr-04-postgresql.md) — PostgreSQL is accessed exclusively through `HeroDataBaseAdapter` and `TeamCompositionDatabaseAdapter`.
