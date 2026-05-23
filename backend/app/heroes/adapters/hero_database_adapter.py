from heroes.domain.entities import AbilityEntity, HeroEntity
from heroes.models import Ability, Hero
from heroes.ports.hero_port import HeroPort


class HeroDataBaseAdapter(HeroPort):
    def get_all(self) -> list[HeroEntity]:
        return [self._to_entity(h) for h in Hero.objects.all()]

    def get_by_key(self, hero_key: str) -> HeroEntity:
        hero = Hero.objects.prefetch_related("abilities").get(pk=hero_key)
        return self._to_entity(hero, include_abilities=True)

    def upsert(self, hero: HeroEntity) -> None:
        obj, _ = Hero.objects.update_or_create(
            hero_key=hero.hero_key,
            defaults={
                "display_name": hero.display_name,
                "role": hero.role,
                "subrole": hero.subrole,
                "winrate": hero.winrate,
                "pickrate": hero.pickrate,
                "health": hero.health,
                "armor": hero.armor,
                "shields": hero.shields,
                "portrait_url": hero.portrait_url,
                "description": hero.description,
            },
        )
        obj.abilities.all().delete()
        Ability.objects.bulk_create([
            Ability(hero=obj, name=a.name, description=a.description, icon=a.icon)
            for a in hero.abilities
        ])

    def _to_entity(self, h: Hero, include_abilities: bool = False) -> HeroEntity:
        abilities = (
            [
                AbilityEntity(name=a.name, description=a.description, icon=a.icon)
                for a in h.abilities.all()
            ]
            if include_abilities
            else []
        )
        return HeroEntity(
            hero_key=h.hero_key,
            display_name=h.display_name,
            role=h.role,
            subrole=h.subrole,
            winrate=h.winrate,
            pickrate=h.pickrate,
            health=h.health,
            armor=h.armor,
            shields=h.shields,
            portrait_url=h.portrait_url,
            description=h.description,
            abilities=abilities,
        )
