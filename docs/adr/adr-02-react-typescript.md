# ADR-02: React and TypeScript for the Frontend

## Status

Accepted

## Date

2026-05-15

## Context

A web frontend was needed to let users browse heroes and manage team compositions. The team wanted type safety and a component-based UI with a modern developer experience.

## Decision

Use React 19 with TypeScript and Vite as the build tool. MUI is used for UI components. TypeScript DTOs are auto-generated from DRF serializers via `dto_generation.py`.

## Alternatives Considered

### Option 1: React 19 + TypeScript + Vite

- Pros: Component-based architecture; TypeScript catches frontend/backend contract mismatches at compile time; Vite dev proxy eliminates CORS friction during development.
- Cons: React ecosystem moves fast; major upgrades can be breaking; requires a DTO generation step to keep frontend types in sync.

### Option 2: Plain JavaScript / HTML

- Pros: No build tooling required; simpler setup.
- Cons: No type safety; harder to maintain as the codebase grows; no component reuse.

## Consequences

- (+) Component-based architecture keeps the UI maintainable and modular.
- (+) TypeScript catches frontend/backend contract mismatches at compile time.
- (+) Vite dev proxy eliminates CORS friction during development.
- (−) React ecosystem moves fast; major upgrades can be breaking.
- (−) Requires a DTO generation step (`generate_dtos` management command) to keep frontend types in sync with the backend serializers.

## References

- [Vite documentation](https://vitejs.dev/)
- [MUI documentation](https://mui.com/)
- `heroes/dto_generation.py` — generates TypeScript types from DRF serializers.
