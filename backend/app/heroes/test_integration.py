from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.team_composition_adapter import TeamCompositionDatabaseAdapter
from heroes.domain.entities import AbilityEntity, HeroEntity
from heroes.models import Ability, Hero, SyncState, TeamComposition


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


class TestHeroDataBaseAdapterGetByKey(TestCase):
    def test_get_by_key_returns_abilities(self):
        hero = Hero.objects.create(
            hero_key="ana", display_name="Ana", role="Support", subrole="Healer",
            winrate=Decimal("52.3"), pickrate=Decimal("6.1"), health=200,
            armor=0, shields=0, portrait_url="http://example.com/ana.png",
            description="Legendary soldier",
        )
        Ability.objects.create(hero=hero, name="Sleep Dart", description="Puts enemies to sleep", icon="sleep.png")
        Ability.objects.create(hero=hero, name="Biotic Grenade", description="Heals allies", icon="grenade.png")

        entity = HeroDataBaseAdapter().get_by_key("ana")

        assert len(entity.abilities) == 2
        assert {a.name for a in entity.abilities} == {"Sleep Dart", "Biotic Grenade"}


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

    def test_get_by_id_raises_for_composition_owned_by_different_user(self):
        other_user = User.objects.create_user(username="other", password="password")
        team = self._make_team()

        try:
            TeamCompositionDatabaseAdapter().get_by_id(team.id, user=other_user)
            assert False, "Expected ObjectDoesNotExist"
        except ObjectDoesNotExist:
            pass

    def test_update_persists_name_change_to_database(self):
        from heroes.domain.entities import TeamCompositionEntity
        team = self._make_team()
        entity = TeamCompositionEntity(
            id=team.id, name="Updated Name",
            hero_1=HeroDataBaseAdapter().get_by_key("winston"),
            hero_2=HeroDataBaseAdapter().get_by_key("tracer"),
            hero_3=HeroDataBaseAdapter().get_by_key("genji"),
            hero_4=HeroDataBaseAdapter().get_by_key("mercy"),
            hero_5=HeroDataBaseAdapter().get_by_key("lucio"),
            created_at=None,
        )

        TeamCompositionDatabaseAdapter().update(team.id, entity, user=self.user)

        team.refresh_from_db()
        assert team.name == "Updated Name"

    def test_delete_does_not_remove_composition_owned_by_different_user(self):
        other_user = User.objects.create_user(username="other", password="password")
        team = self._make_team()

        try:
            TeamCompositionDatabaseAdapter().delete(team.id, user=other_user)
            assert False, "Expected ObjectDoesNotExist"
        except ObjectDoesNotExist:
            pass

        assert TeamComposition.objects.filter(pk=team.id).exists()

    def test_create_persists_team_composition_to_database(self):
        from heroes.domain.entities import TeamCompositionEntity
        entity = TeamCompositionEntity(
            id=None, name="Dive Comp",
            hero_1=HeroDataBaseAdapter().get_by_key("winston"),
            hero_2=HeroDataBaseAdapter().get_by_key("tracer"),
            hero_3=HeroDataBaseAdapter().get_by_key("genji"),
            hero_4=HeroDataBaseAdapter().get_by_key("mercy"),
            hero_5=HeroDataBaseAdapter().get_by_key("lucio"),
            created_at=None,
        )

        result = TeamCompositionDatabaseAdapter().create(entity, user=self.user)

        assert TeamComposition.objects.filter(pk=result.id).exists()
        assert TeamComposition.objects.get(pk=result.id).name == "Dive Comp"
        assert TeamComposition.objects.get(pk=result.id).user == self.user

    def test_get_all_only_returns_requesting_users_compositions(self):
        other_user = User.objects.create_user(username="other", password="password")
        self._make_team()
        TeamComposition.objects.create(
            user=other_user, name="Other Comp",
            hero_1=self.tank, hero_2=self.dmg1, hero_3=self.dmg2,
            hero_4=self.sup1, hero_5=self.sup2,
        )

        results = TeamCompositionDatabaseAdapter().get_all(user=self.user)

        assert len(results) == 1
        assert results[0].name == "Dive Comp"

    def test_deleting_hero_in_use_is_blocked_by_restrict(self):
        self._make_team()

        try:
            self.tank.delete()
            assert False, "Expected an error due to RESTRICT constraint"
        except Exception:
            pass

        assert Hero.objects.filter(hero_key="winston").exists()


class TestAuthIntegration(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_real_jwt_token_grants_access_to_protected_endpoint(self):
        User.objects.create_user(username="testuser", password="strongpass")
        token_response = self.client.post(
            "/api/auth/token/",
            {"username": "testuser", "password": "strongpass"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")

        response = self.client.get("/api/team-compositions/")

        assert response.status_code == 200

    def test_token_refresh_returns_new_access_token(self):
        User.objects.create_user(username="testuser", password="strongpass")
        token_response = self.client.post(
            "/api/auth/token/",
            {"username": "testuser", "password": "strongpass"},
            format="json",
        )

        refresh_response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": token_response.data["refresh"]},
            format="json",
        )

        assert refresh_response.status_code == 200
        assert "access" in refresh_response.data

    def test_registration_rejects_duplicate_username(self):
        User.objects.create_user(username="existing", password="strongpass")

        response = self.client.post(
            "/api/auth/register/",
            {"username": "existing", "password": "strongpass"},
            format="json",
        )

        assert response.status_code == 400
        assert User.objects.filter(username="existing").count() == 1


class TestSyncStateIntegration(TestCase):
    @patch("heroes.management.commands.sync_heroes.HeroSyncService")
    def test_successful_sync_writes_sync_state_to_database(self, service_class):
        service_class.return_value.sync.return_value = 5

        call_command("sync_heroes")

        assert SyncState.objects.count() == 1
        assert SyncState.objects.first().last_synced_at is not None

    @patch("heroes.management.commands.sync_heroes.HeroSyncService")
    def test_sync_is_skipped_when_data_is_fresh(self, service_class):
        SyncState.objects.create(last_synced_at=timezone.now())

        call_command("sync_heroes")

        service_class.return_value.sync.assert_not_called()

    @patch("heroes.management.commands.sync_heroes.HeroSyncService")
    def test_sync_runs_when_data_is_older_than_max_age(self, service_class):
        service_class.return_value.sync.return_value = 5
        SyncState.objects.create(last_synced_at=timezone.now() - timedelta(hours=25))

        call_command("sync_heroes")

        service_class.return_value.sync.assert_called_once()

    @patch("heroes.management.commands.sync_heroes.HeroSyncService")
    def test_max_age_hours_flag_overrides_default_threshold(self, service_class):
        service_class.return_value.sync.return_value = 5
        SyncState.objects.create(last_synced_at=timezone.now() - timedelta(hours=2))

        call_command("sync_heroes", "--max-age-hours", "1")

        service_class.return_value.sync.assert_called_once()
