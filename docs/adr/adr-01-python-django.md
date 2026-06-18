# ADR-01: Python and Django as Backend Technology

## Status

Accepted

## Date

2026-05-15

## Context

OverwatchTeamUp is a student project. The team chose it as an opportunity to learn Python as a new language. A backend was needed to expose a REST API, manage a PostgreSQL database, and sync hero data from an external API.

## Decision

Use Python as the backend language and Django with Django REST Framework (DRF) as the web framework.

## Alternatives Considered

### Option 1: Python / Django + DRF

- Pros: Learning goal fulfilled; Django ORM, DRF serializers, and the management command system reduce boilerplate; large ecosystem and strong documentation.
- Cons: Django is a full-stack framework; for an API-only service it brings unused features such as templates and the admin interface.

### Option 2: Java / Spring Boot

- Pros: Strongly typed; widely used in enterprise; good REST support.
- Cons: Does not fulfill the team's learning goal of working with Python; more verbose boilerplate.

## Consequences

- (+) Learning goal fulfilled — the project gave the team hands-on experience with Python and Django.
- (+) Django ORM, DRF serializers, and the management command system reduced boilerplate.
- (+) Large ecosystem and strong documentation available.
- (−) Django is a full-stack framework; for an API-only service it brings unused features such as templates and the admin interface.
- (−) Python performance is lower than compiled languages, though irrelevant at this scale.

## References

- [Django REST Framework documentation](https://www.django-rest-framework.org/)
- See [ADR-03](adr-03-hexagonal-architecture.md) for how the architecture keeps Django isolated from the domain.
