from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime


@dataclass
class HeroEntity:
    hero_key: str
    display_name: str
    role: str
    subrole: str
    winrate: Decimal
    pickrate: Decimal
    health: int
    armor: int
    shields: int
    portrait_url: str
    description: str


@dataclass
class TeamCompositionEntity:
    id: int
    name: str
    hero_1: HeroEntity
    hero_2: HeroEntity
    hero_3: HeroEntity
    hero_4: HeroEntity
    hero_5: HeroEntity
    created_at: datetime

    @property
    def heroes(self) -> list[HeroEntity]:
        return [self.hero_1, self.hero_2, self.hero_3, self.hero_4, self.hero_5]

    @property
    def average_winrate(self) -> Decimal:
        total = sum(h.winrate for h in self.heroes)
        return total / 5
