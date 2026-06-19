from decimal import Decimal

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from heroes.domain.entities import AbilityEntity, HeroEntity
from heroes.ports.external_hero_source_port import ExternalHeroSourcePort

_BASE_URL = "https://overfast-api.tekrop.fr"
_STATS_URL = f"{_BASE_URL}/heroes/stats?platform=pc&gamemode=competitive&region=europe&order_by=hero%3Aasc"
_TIMEOUT_SECONDS = 5


class OverfastAPIAdapter(ExternalHeroSourcePort):
    def __init__(self):
        retry = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[502, 503, 504],
            allowed_methods=["GET"],
        )
        self.session = requests.Session()
        self.session.mount("https://", HTTPAdapter(max_retries=retry))

    def fetch_all(self) -> list[HeroEntity]:
        stats_by_key = {
            s["hero"]: s for s in self._get(_STATS_URL)
        }
        keys = [h["key"] for h in self._get(f"{_BASE_URL}/heroes")]
        return [self._fetch_hero(key, stats_by_key.get(key, {})) for key in keys]

    def _fetch_hero(self, hero_key: str, stats: dict) -> HeroEntity:
        detail = self._get(f"{_BASE_URL}/heroes/{hero_key}")
        hitpoints = detail.get("hitpoints") or {}
        return HeroEntity(
            hero_key=hero_key,
            display_name=detail["name"],
            role=detail["role"].title(),
            subrole=(detail.get("subrole") or "").title(),
            winrate=Decimal(str(stats.get("winrate", 0.0))),
            pickrate=Decimal(str(stats.get("pickrate", 0.0))),
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
        response = self.session.get(url, timeout=_TIMEOUT_SECONDS)
        response.raise_for_status()
        return response.json()
