# ADR-04: PostgreSQL as the Database

## Status

Accepted

## Date

2026-05-15

## Context

The application needs to persist hero data, user accounts, and team compositions. The data is relational by nature — heroes are referenced by team compositions, compositions belong to users. A reliable, well-supported database with strong Django ORM integration was needed.

## Decision

Use PostgreSQL 16 as the primary database, running as a Docker container in development.

## Alternatives Considered

### Option 1: PostgreSQL 16

- Pros: Well-suited to the relational data model; foreign key constraints enforce referential integrity; Django ORM has first-class PostgreSQL support; Docker Compose keeps the local setup consistent.
- Cons: Heavier than SQLite for local development (mitigated by Docker Compose); switching database engines would require migration effort.

### Option 2: SQLite

- Pros: Zero setup; built into Python; sufficient for small projects.
- Cons: No concurrent writes; `RESTRICT` foreign key behavior differs from PostgreSQL; not representative of a production setup.

## Consequences

- (+) Well-suited to the relational data model; foreign key constraints enforce referential integrity between heroes, team compositions, and users.
- (+) Django ORM has first-class PostgreSQL support (`psycopg2`).
- (+) Running in Docker keeps the local setup consistent across machines.
- (−) Switching database engines would require migration effort and potential ORM query changes.
- (−) Heavier than SQLite for local development, though Docker Compose handles this transparently.

## References

- `heroes/models.py` — ORM schema with `RESTRICT` and `CASCADE` foreign key constraints.
- See [ADR-03](adr-03-hexagonal-architecture.md) — PostgreSQL is accessed only through the adapter layer.
