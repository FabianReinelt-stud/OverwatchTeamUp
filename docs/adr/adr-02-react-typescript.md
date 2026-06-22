# ADR-02: React and TypeScript for the Frontend

## Status

Accepted

## Date

2026-05-15

## Context

OverwatchTeamUp is a student project. We chose React and TypeScript to gain practical experience with a new UI library and programming language. The frontend needed to let users browse heroes and manage team compositions. We also wanted type safety, reusable components, and fast local feedback during development.

## Decision

Use React 19 with TypeScript and Vite as the build tool. MUI is used for UI components. TypeScript DTOs are auto-generated from DRF serializers via `dto_generation.py`.

## Alternatives Considered

### Option 1: React 19 + TypeScript + Vite

- Pros: Reusable components; TypeScript catches many DTO mismatches during the build; Vite provides fast startup and hot module replacement.
- Cons: Generated DTOs must be refreshed explicitly after backend serializer changes; major React upgrades may require migration work.

### Option 2: Plain JavaScript / HTML

- Pros: No build tooling required; simpler setup.
- Cons: No static type checks and no built-in component model for the growing UI.

## Consequences

- (+) React components separate the main UI concerns.
- (+) TypeScript catches many DTO mismatches during the build.
- (+) Vite provides fast local startup and hot module replacement.
- (−) Generated DTOs must be refreshed explicitly with the `generate_dtos` management command after serializer changes.

## References

- [Vite documentation](https://vitejs.dev/)
- [MUI documentation](https://mui.com/)
- `heroes/dto_generation.py` — generates TypeScript types from DRF serializers.
