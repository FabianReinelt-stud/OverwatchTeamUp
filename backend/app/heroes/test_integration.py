from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.domain.entities import AbilityEntity, HeroEntity
from heroes.models import Ability, Hero, TeamComposition


class TestHeroDataBaseAdapterUpsert(TestCase):
    def test_upsert_creates_hero_when_it_does_not_exist(self):
        entity = HeroEntity(
            hero_key="ana", display_name="Ana", role="Support", subrole="Healer",
            winrate=Decimal("52.3"), pickrate=Decimal("6.1"), health=200,
            armor=0, shields=0,
            portrait_url="http://example.com/ana.png", description="Legendary soldier",
        )

        HeroDataBaseAdapter().upsert(entity)

        assert Hero.objects.filter(hero_key="ana").exists()
        assert Hero.objects.get(hero_key="ana").display_name == "Ana"

    def test_upsert_updates_existing_hero_without_creating_duplicate(self):
        Hero.objects.create(
            hero_key="ana", display_name="OLD", role="Support", subrole="Healer",
            winrate=Decimal("50.0"), pickrate=Decimal("5.0"), health=200,
            armor=0, shields=0, portrait_url="http://example.com/ana.png",
            description="Old description",
        )
        entity = HeroEntity(
            hero_key="ana", display_name="Ana", role="Support", subrole="Healer",
            winrate=Decimal("52.3"), pickrate=Decimal("6.1"), health=200,
            armor=0, shields=0, portrait_url="http://example.com/ana.png",
            description="Legendary soldier",
        )

        HeroDataBaseAdapter().upsert(entity)

        assert Hero.objects.count() == 1
        assert Hero.objects.get(hero_key="ana").display_name == "Ana"
        assert Hero.objects.get(hero_key="ana").winrate == Decimal("52.3")

    def test_upsert_replaces_stale_abilities_on_re_sync(self):
        hero = Hero.objects.create(
            hero_key="ana", display_name="Ana", role="Support", subrole="Healer",
            winrate=Decimal("52.3"), pickrate=Decimal("6.1"), health=200,
            armor=0, shields=0, portrait_url="http://example.com/ana.png",
            description="Legendary soldier",
        )
        Ability.objects.create(hero=hero, name="Old Ability", description="Gone", icon="old.png")

        entity = HeroEntity(
            hero_key="ana", display_name="Ana", role="Support", subrole="Healer",
            winrate=Decimal("52.3"), pickrate=Decimal("6.1"), health=200,
            armor=0, shields=0, portrait_url="http://example.com/ana.png",
            description="Legendary soldier",
            abilities=[AbilityEntity(name="Sleep Dart", description="Puts enemies to sleep", icon="sleep.png")],
        )

        HeroDataBaseAdapter().upsert(entity)

        assert Ability.objects.filter(hero__hero_key="ana").count() == 1
        assert Ability.objects.get(hero__hero_key="ana").name == "Sleep Dart"


class TestDatabaseConstraints(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.tank = Hero.objects.create(
            hero_key="winston", display_name="Winston", role="Tank", subrole="Initiator",
            winrate=Decimal("50.0"), pickrate=Decimal("4.0"), health=425, armor=200,
            shields=0, portrait_url="http://example.com/winston.png", description="Scientist",
        )
        self.dmg1 = Hero.objects.create(
            hero_key="tracer", display_name="Tracer", role="Damage", subrole="Flanker",
            winrate=Decimal("51.0"), pickrate=Decimal("4.2"), health=150, armor=0,
            shields=0, portrait_url="http://example.com/tracer.png", description="Time traveler",
        )
        self.dmg2 = Hero.objects.create(
            hero_key="genji", display_name="Genji", role="Damage", subrole="Flanker",
            winrate=Decimal("52.0"), pickrate=Decimal("3.0"), health=250, armor=0,
            shields=0, portrait_url="http://example.com/genji.png", description="Cyborg ninja",
        )
        self.sup1 = Hero.objects.create(
            hero_key="mercy", display_name="Mercy", role="Support", subrole="Healer",
            winrate=Decimal("49.0"), pickrate=Decimal("5.0"), health=225, armor=0,
            shields=0, portrait_url="http://example.com/mercy.png", description="Guardian angel",
        )
        self.sup2 = Hero.objects.create(
            hero_key="lucio", display_name="Lucio", role="Support", subrole="Support",
            winrate=Decimal("51.0"), pickrate=Decimal("4.0"), health=225, armor=0,
            shields=0, portrait_url="http://example.com/lucio.png", description="DJ",
        )

    def _make_team(self):
        return TeamComposition.objects.create(
            user=self.user, name="Dive Comp",
            hero_1=self.tank, hero_2=self.dmg1, hero_3=self.dmg2,
            hero_4=self.sup1, hero_5=self.sup2,
        )

    def test_deleting_user_cascades_to_team_compositions(self):
        self._make_team()

        self.user.delete()

        assert TeamComposition.objects.count() == 0

    def test_deleting_hero_in_use_is_blocked_by_restrict(self):
        self._make_team()

        try:
            self.tank.delete()
            assert False, "Expected an error due to RESTRICT constraint"
        except Exception:
            pass

        assert Hero.objects.filter(hero_key="winston").exists()
