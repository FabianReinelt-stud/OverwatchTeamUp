from decimal import Decimal
from unittest import TestCase

from heroes.domain.entities import HeroEntity, TeamCompositionEntity
from heroes.domain.exceptions import InvalidTeamComposition
from heroes.services.team_composition_service import TeamCompositionService


def hero(hero_key: str, role: str) -> HeroEntity:
    return HeroEntity(
        hero_key=hero_key,
        display_name=hero_key.title(),
        role=role,
        subrole="",
        winrate=Decimal("50.0"),
        pickrate=Decimal("1.0"),
        health=250,
        armor=0,
        shields=0,
        portrait_url="",
        description="",
    )


def valid_heroes() -> list[HeroEntity]:
    return [
        hero("winston", "Tank"),
        hero("tracer", "Damage"),
        hero("genji", "Damage"),
        hero("mercy", "Support"),
        hero("lucio", "Support"),
    ]


class FakeHeroPort:
    def __init__(self, heroes: list[HeroEntity]):
        self.by_key = {item.hero_key: item for item in heroes}

    def get_by_key(self, hero_key: str) -> HeroEntity:
        return self.by_key[hero_key]


class FakeTeamCompositionPort:
    def __init__(self):
        self.created = None

    def create(self, team, user=None):
        self.created = (team, user)
        return team


class TestTeamCompositionEntity(TestCase):
    def test_create_normalizes_name_and_accepts_role_queue_team(self):
        team = TeamCompositionEntity.create("  Dive Comp  ", valid_heroes())

        assert team.name == "Dive Comp"
        assert [item.hero_key for item in team.heroes] == [
            "winston",
            "tracer",
            "genji",
            "mercy",
            "lucio",
        ]

    def test_create_rejects_duplicate_heroes(self):
        heroes = valid_heroes()
        heroes[2] = heroes[1]

        with self.assertRaisesRegex(InvalidTeamComposition, "different heroes"):
            TeamCompositionEntity.create("Dive Comp", heroes)

    def test_create_rejects_team_without_exactly_five_heroes(self):
        with self.assertRaisesRegex(InvalidTeamComposition, "exactly five heroes"):
            TeamCompositionEntity.create("Dive Comp", valid_heroes()[:4])

    def test_create_rejects_invalid_role_distribution(self):
        heroes = valid_heroes()
        heroes[4] = hero("dva", "Tank")

        with self.assertRaisesRegex(InvalidTeamComposition, "one Tank"):
            TeamCompositionEntity.create("Dive Comp", heroes)

    def test_create_rejects_blank_name(self):
        with self.assertRaisesRegex(InvalidTeamComposition, "must not be empty"):
            TeamCompositionEntity.create("   ", valid_heroes())

    def test_create_rejects_name_longer_than_100_characters(self):
        with self.assertRaisesRegex(InvalidTeamComposition, "100 characters"):
            TeamCompositionEntity.create("x" * 101, valid_heroes())


class TestTeamCompositionService(TestCase):
    def test_create_resolves_heroes_and_persists_through_port(self):
        heroes = valid_heroes()
        team_port = FakeTeamCompositionPort()
        service = TeamCompositionService(
            team_compositions=team_port,
            heroes=FakeHeroPort(heroes),
        )
        user = object()

        result = service.create(
            name="Dive Comp",
            hero_keys=[item.hero_key for item in heroes],
            user=user,
        )

        assert result.name == "Dive Comp"
        assert team_port.created == (result, user)
