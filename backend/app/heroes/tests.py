from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.domain.entities import HeroEntity
from heroes.models import Hero


def make_hero(**overrides):
    defaults = {'hero_key': "tracer", 'display_name': "Tracer", 'role': "Damage", 'subrole': "Flanker",
                'winrate': Decimal("51.0"), 'pickrate': Decimal("4.2"), 'health': 150, 'armor': 0, 'shields': 0,
                'portrait_url': "http://example.com/tracer.png", 'description': "Cockney time traveler"}
    defaults.update(overrides)
    return Hero.objects.create(**defaults)


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
