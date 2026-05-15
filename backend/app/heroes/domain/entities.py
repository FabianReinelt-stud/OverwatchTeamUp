from dataclasses import dataclass
from decimal import Decimal


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
