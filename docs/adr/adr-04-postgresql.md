# ADR-04: PostgreSQL as the Database

## Status

Accepted

## Date

2026-05-15

## Context

The application needs to persist hero data, user accounts, team compositions, and the last successful synchronization time. Heroes are referenced by team compositions, and compositions belong to users. The database therefore needs foreign keys, transactions, and Django ORM support.

## Decision

Use PostgreSQL 16 as the primary database, running as a Docker container in development.

## Alternatives Considered

### Option 1: PostgreSQL 16

- Pros: Foreign key constraints support the relational model; Django ORM supports PostgreSQL directly; Docker Compose provides the same database setup across development machines.
- Cons: Heavier than SQLite for local development (mitigated by Docker Compose); switching database engines would require migration effort.

### Option 2: SQLite

- Pros: Zero setup; built into Python; sufficient for small projects.
- Cons: No concurrent writes; `RESTRICT` foreign key behavior differs from PostgreSQL; not representative of a production setup.

## Consequences

- (+) Foreign key constraints enforce relationships between heroes, team compositions, and users.
- (+) Docker Compose provides a consistent local database setup.
- (−) Switching database engines requires schema migration and may require ORM query changes.
- (−) Local development depends on a running database container.

## References

- `heroes/models.py` — ORM schema with `RESTRICT` and `CASCADE` foreign key constraints.
- See [ADR-03](adr-03-hexagonal-architecture.md) — application persistence uses adapters, while Django authentication uses the framework's ORM integration directly.
