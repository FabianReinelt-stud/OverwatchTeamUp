from decimal import Decimal

import requests

from heroes.domain.entities import AbilityEntity, HeroEntity
from heroes.ports.external_hero_source_port import ExternalHeroSourcePort

_BASE_URL = "https://overfast-api.tekrop.fr"
class OverfastAPIAdapter(ExternalHeroSourcePort):
    def fetch_all(self) -> list[HeroEntity]:
        keys = [h["key"] for h in self._get(f"{_BASE_URL}/heroes")]
        return [self._fetch_hero(key) for key in keys]

    def _fetch_hero(self, hero_key: str) -> HeroEntity:
        detail = self._get(f"{_BASE_URL}/heroes/{hero_key}")
        hitpoints = detail.get("hitpoints") or {}
        return HeroEntity(
            hero_key=hero_key,
            display_name=detail["name"],
            role=detail["role"].title(),
            subrole=(detail.get("subrole") or "").title(),
            winrate=Decimal("0.0"),
            pickrate=Decimal("0.0"),
            health=hitpoints.get("health", 0),
            armor=hitpoints.get("armor", 0),
            shields=hitpoints.get("shields", 0),
            portrait_url=detail.get("portrait") or "",
            description=detail.get("description") or "",
            abilities=[
                AbilityEntity(
                    name=a["name"],
                    description=a["description"],
                    icon=a["icon"],
                )
                for a in detail.get("abilities", [])
            ],
        )

    def _get(self, url: str) -> dict | list:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
