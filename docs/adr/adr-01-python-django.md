# ADR-01: Python and Django as Backend Technology

## Status

Accepted

## Date

2026-05-15

## Context

OverwatchTeamUp is a student project. We chose Python to gain practical experience with a new language. The backend needed to expose a REST API, manage a PostgreSQL database, and synchronize hero data from an external API.

## Decision

Use Python as the backend language and Django with Django REST Framework (DRF) as the web framework.

## Alternatives Considered

### Option 1: Python / Django + DRF

- Pros: Supports the learning goal; Django ORM, DRF serializers, and management commands cover most of the required backend infrastructure.
- Cons: Django is a full-stack framework; for an API-only service it brings unused features such as templates and the admin interface.

### Option 2: Java / Spring Boot

- Pros: Strongly typed; widely used in enterprise; good REST support.
- Cons: Does not support our goal of gaining experience with Python; requires more setup for this project.

## Consequences

- (+) We gained practical experience with Python and Django.
- (+) Django ORM, DRF serializers, and management commands cover most backend infrastructure needs.
- (−) The project uses only part of Django's full-stack feature set.

## References

- [Django REST Framework documentation](https://www.django-rest-framework.org/)
- See [ADR-03](adr-03-hexagonal-architecture.md) for how the architecture keeps Django isolated from the domain.
