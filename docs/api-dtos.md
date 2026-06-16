# API DTOs

## Usage Table

| Use case | Method | Endpoint | Request DTO | Response DTO |
|---|---|---|---|---|
| Register user | `POST` | `/api/auth/register/` | `RegisterRequestDto` | `RegisterResponseDto` |
| Login | `POST` | `/api/auth/token/` | `TokenRequestDto` | `TokenResponseDto` |
| Refresh access token | `POST` | `/api/auth/token/refresh/` | `TokenRefreshRequestDto` | `TokenRefreshResponseDto` |
| List heroes | `GET` | `/api/heroes/` | - | `HeroSummaryDto[]` |
| Get hero details | `GET` | `/api/heroes/<hero_key>/` | - | `HeroDto` |
| List own team compositions | `GET` | `/api/team-compositions/` | - | `TeamCompositionDto[]` |
| Get own team composition | `GET` | `/api/team-compositions/<id>/` | - | `TeamCompositionDto` |
| Create team composition | `POST` | `/api/team-compositions/create/` | `TeamCompositionCreateUpdateDto` | `TeamCompositionDto` |
| Update team composition | `PUT` | `/api/team-compositions/<id>/update/` | `TeamCompositionCreateUpdateDto` | `TeamCompositionDto` |
| Delete team composition | `DELETE` | `/api/team-compositions/<id>/delete/` | - | - |

Team composition endpoints require a bearer access token:

```http
Authorization: Bearer <access-token>
```

### How to generate

The frontend DTOs are generated from the backend DRF serializers.

Generate DTOs with:

```bash
docker compose run --rm backend python manage.py generate_dtos
```

Default output:

```text
backend/app/generated/api-dtos.ts
```
