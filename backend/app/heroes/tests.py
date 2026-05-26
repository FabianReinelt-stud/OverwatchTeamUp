from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.domain.entities import HeroEntity
from heroes.models import Hero, TeamComposition


def make_hero(**overrides):
    defaults = {'hero_key': "tracer", 'display_name': "Tracer", 'role': "Damage", 'subrole': "Flanker",
                'winrate': Decimal("51.0"), 'pickrate': Decimal("4.2"), 'health': 150, 'armor': 0, 'shields': 0,
                'portrait_url': "http://example.com/tracer.png", 'description': "Cockney time traveler"}
    defaults.update(overrides)
    return Hero.objects.create(**defaults)


def make_team_composition(**overrides):
    user = overrides.pop("user", None) or User.objects.create_user(
        username="team-owner",
        password="test-password",
    )
    tracer = overrides.pop("tracer", None) or make_hero()
    winston = overrides.pop("winston", None) or make_hero(
        hero_key="winston",
        display_name="Winston",
        role="Tank",
        subrole="Initiator",
        winrate=Decimal("50.0"),
        health=425,
        armor=200,
        portrait_url="http://example.com/winston.png",
        description="Scientist",
    )
    defaults = {
        "user": user,
        "name": "Dive Comp",
        "hero_1": winston,
        "hero_2": tracer,
        "hero_3": tracer,
        "hero_4": winston,
        "hero_5": tracer,
    }
    defaults.update(overrides)
    return TeamComposition.objects.create(**defaults)


class TestHeroDataBaseAdapter(TestCase):
    def test_entity_fields_match_model(self):
        make_hero()
        entity = HeroDataBaseAdapter().get_all()[0]
        assert entity.hero_key == "tracer"
        assert entity.display_name == "Tracer"
        assert entity.role == "Damage"
        assert entity.subrole == "Flanker"
        assert entity.winrate == Decimal("51.0")
        assert entity.pickrate == Decimal("4.2")
        assert entity.health == 150
        assert entity.armor == 0
        assert entity.shields == 0
        assert entity.portrait_url == "http://example.com/tracer.png"
        assert entity.description == "Cockney time traveler"

    def test_get_by_key_returns_entity(self):
        make_hero()
        entity = HeroDataBaseAdapter().get_by_key("tracer")
        assert isinstance(entity, HeroEntity)
        assert entity.hero_key == "tracer"

    def test_get_by_key_raises_for_unknown_key(self):
        try:
            HeroDataBaseAdapter().get_by_key("unknown")
            assert False, "Expected an exception"
        except Exception:
            pass


class TestHeroListEndpoint(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_returns_only_summary_fields(self):
        make_hero()
        response = self.client.get("/api/heroes/")
        hero = response.data[0]
        assert set(hero.keys()) == {"display_name", "portrait_url", "role"}

    def test_empty_db_returns_empty_list(self):
        response = self.client.get("/api/heroes/")
        assert response.status_code == 200
        assert response.data == []

    def test_multiple_heroes_returned(self):
        make_hero(hero_key="tracer", display_name="Tracer")
        make_hero(hero_key="mercy", display_name="Mercy", role="Support", subrole="Healer")
        response = self.client.get("/api/heroes/")
        assert len(response.data) == 2


class TestHeroDetailEndpoint(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_returns_200_for_existing_hero(self):
        make_hero()
        response = self.client.get("/api/heroes/tracer/")
        assert response.status_code == 200

    def test_returns_404_for_unknown_hero(self):
        response = self.client.get("/api/heroes/unknown/")
        assert response.status_code == 404

    def test_detail_response_has_all_fields(self):
        make_hero()
        response = self.client.get("/api/heroes/tracer/")
        hero = response.data
        assert hero["hero_key"] == "tracer"
        assert hero["display_name"] == "Tracer"
        assert hero["role"] == "Damage"
        assert hero["subrole"] == "Flanker"
        assert hero["winrate"] == "51.0"
        assert hero["pickrate"] == "4.2"
        assert hero["health"] == 150
        assert hero["armor"] == 0
        assert hero["shields"] == 0
        assert hero["portrait_url"] == "http://example.com/tracer.png"
        assert hero["description"] == "Cockney time traveler"


class TestTeamCompositionEndpoints(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="team-user",
            password="test-password",
        )
        self.other_user = User.objects.create_user(
            username="other-user",
            password="test-password",
        )
        self.tracer = make_hero()
        self.winston = make_hero(
            hero_key="winston",
            display_name="Winston",
            role="Tank",
            subrole="Initiator",
            winrate=Decimal("50.0"),
            health=425,
            armor=200,
            portrait_url="http://example.com/winston.png",
            description="Scientist",
        )
        self.payload = {
            "name": "Dive Comp",
            "hero_1_key": "winston",
            "hero_2_key": "tracer",
            "hero_3_key": "tracer",
            "hero_4_key": "winston",
            "hero_5_key": "tracer",
        }

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.user)

    def test_list_requires_authentication(self):
        response = self.client.get("/api/team-compositions/")

        assert response.status_code == 401

    def test_list_returns_team_compositions(self):
        self.authenticate()
        make_team_composition(user=self.user, tracer=self.tracer, winston=self.winston)

        response = self.client.get("/api/team-compositions/")

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Dive Comp"
        assert response.data[0]["hero_1"]["hero_key"] == "winston"
        assert response.data[0]["average_winrate"] == "50.6"

    def test_list_only_returns_owned_team_compositions(self):
        self.authenticate()
        make_team_composition(user=self.user, tracer=self.tracer, winston=self.winston)
        make_team_composition(
            user=self.other_user,
            tracer=self.tracer,
            winston=self.winston,
            name="Other Comp",
        )

        response = self.client.get("/api/team-compositions/")

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Dive Comp"

    def test_detail_returns_team_composition(self):
        self.authenticate()
        team = make_team_composition(user=self.user, tracer=self.tracer, winston=self.winston)

        response = self.client.get(f"/api/team-compositions/{team.id}/")

        assert response.status_code == 200
        assert response.data["id"] == team.id
        assert response.data["hero_2"]["hero_key"] == "tracer"

    def test_detail_returns_404_for_unknown_team(self):
        self.authenticate()
        response = self.client.get("/api/team-compositions/999/")

        assert response.status_code == 404

    def test_detail_returns_404_for_another_users_team(self):
        self.authenticate()
        team = make_team_composition(
            user=self.other_user,
            tracer=self.tracer,
            winston=self.winston,
        )

        response = self.client.get(f"/api/team-compositions/{team.id}/")

        assert response.status_code == 404

    def test_create_requires_authentication(self):
        response = self.client.post(
            "/api/team-compositions/create/",
            self.payload,
            format="json",
        )

        assert response.status_code == 401
        assert TeamComposition.objects.count() == 0

    def test_create_persists_team_composition(self):
        self.authenticate()
        response = self.client.post(
            "/api/team-compositions/create/",
            self.payload,
            format="json",
        )

        assert response.status_code == 201
        assert TeamComposition.objects.count() == 1
        team = TeamComposition.objects.get(pk=response.data["id"])
        assert team.user == self.user
        assert team.name == "Dive Comp"
        assert team.hero_1_id == "winston"
        assert response.data["hero_5"]["hero_key"] == "tracer"

    def test_create_returns_404_when_a_hero_is_unknown(self):
        self.authenticate()
        payload = {**self.payload, "hero_5_key": "unknown"}

        response = self.client.post(
            "/api/team-compositions/create/",
            payload,
            format="json",
        )

        assert response.status_code == 404
        assert TeamComposition.objects.count() == 0

    def test_update_changes_team_composition(self):
        self.authenticate()
        team = make_team_composition(user=self.user, tracer=self.tracer, winston=self.winston)
        payload = {
            **self.payload,
            "name": "Updated Dive Comp",
            "hero_1_key": "tracer",
        }

        response = self.client.put(
            f"/api/team-compositions/{team.id}/update/",
            payload,
            format="json",
        )

        assert response.status_code == 200
        team.refresh_from_db()
        assert team.name == "Updated Dive Comp"
        assert team.hero_1_id == "tracer"
        assert response.data["hero_1"]["hero_key"] == "tracer"

    def test_update_returns_404_for_unknown_team(self):
        self.authenticate()
        response = self.client.put(
            "/api/team-compositions/999/update/",
            self.payload,
            format="json",
        )

        assert response.status_code == 404

    def test_update_returns_404_for_another_users_team(self):
        self.authenticate()
        team = make_team_composition(
            user=self.other_user,
            tracer=self.tracer,
            winston=self.winston,
        )

        response = self.client.put(
            f"/api/team-compositions/{team.id}/update/",
            self.payload,
            format="json",
        )

        assert response.status_code == 404

    def test_delete_removes_team_composition(self):
        self.authenticate()
        team = make_team_composition(user=self.user, tracer=self.tracer, winston=self.winston)

        response = self.client.delete(f"/api/team-compositions/{team.id}/delete/")

        assert response.status_code == 204
        assert TeamComposition.objects.count() == 0

    def test_delete_returns_404_for_another_users_team(self):
        self.authenticate()
        team = make_team_composition(
            user=self.other_user,
            tracer=self.tracer,
            winston=self.winston,
        )

        response = self.client.delete(f"/api/team-compositions/{team.id}/delete/")

        assert response.status_code == 404
        assert TeamComposition.objects.count() == 1


class TestAuthEndpoints(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {"username": "new-user", "password": "strong-password"},
            format="json",
        )

        assert response.status_code == 201
        assert response.data["username"] == "new-user"
        assert User.objects.filter(username="new-user").exists()

    def test_token_endpoint_returns_access_and_refresh_tokens(self):
        User.objects.create_user(username="token-user", password="strong-password")

        response = self.client.post(
            "/api/auth/token/",
            {"username": "token-user", "password": "strong-password"},
            format="json",
        )

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data
