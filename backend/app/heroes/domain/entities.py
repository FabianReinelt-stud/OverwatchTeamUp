from dataclasses import dataclass, field
from decimal import Decimal
from datetime import datetime

from heroes.domain.exceptions import InvalidTeamComposition


@dataclass
class AbilityEntity:
    name: str
    description: str
    icon: str


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
    abilities: list[AbilityEntity] = field(default_factory=list)


@dataclass
class TeamCompositionEntity:
    id: int | None
    name: str
    hero_1: HeroEntity
    hero_2: HeroEntity
    hero_3: HeroEntity
    hero_4: HeroEntity
    hero_5: HeroEntity
    created_at: datetime | None

    @classmethod
    def create(
        cls,
        name: str,
        heroes: list[HeroEntity],
        team_id: int | None = None,
        created_at: datetime | None = None,
    ) -> "TeamCompositionEntity":
        normalized_name = name.strip()
        if not normalized_name:
            raise InvalidTeamComposition("The team composition name must not be empty.")
        if len(normalized_name) > 100:
            raise InvalidTeamComposition(
                "The team composition name must not exceed 100 characters."
            )
        if len(heroes) != 5:
            raise InvalidTeamComposition(
                "A team composition must contain exactly five heroes."
            )

        hero_keys = [hero.hero_key for hero in heroes]
        if len(set(hero_keys)) != len(hero_keys):
            raise InvalidTeamComposition(
                "A team composition must contain five different heroes."
            )

        role_counts = {"tank": 0, "damage": 0, "support": 0}
        for hero in heroes:
            role = hero.role.strip().lower()
            if role in role_counts:
                role_counts[role] += 1

        if role_counts != {"tank": 1, "damage": 2, "support": 2}:
            raise InvalidTeamComposition(
                "A team composition requires one Tank, two Damage, and two Support heroes."
            )

        return cls(
            id=team_id,
            name=normalized_name,
            hero_1=heroes[0],
            hero_2=heroes[1],
            hero_3=heroes[2],
            hero_4=heroes[3],
            hero_5=heroes[4],
            created_at=created_at,
        )

    @property
    def heroes(self) -> list[HeroEntity]:
        return [self.hero_1, self.hero_2, self.hero_3, self.hero_4, self.hero_5]

    @property
    def average_winrate(self) -> Decimal:
        total = sum(h.winrate for h in self.heroes)
        return total / 5
