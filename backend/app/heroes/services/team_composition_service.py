from heroes.domain.entities import TeamCompositionEntity
from heroes.ports.hero_port import HeroPort
from heroes.ports.team_composition_port import TeamCompositionPort


class TeamCompositionService:
    def __init__(
        self,
        team_compositions: TeamCompositionPort,
        heroes: HeroPort,
    ):
        self.team_compositions = team_compositions
        self.heroes = heroes

    def get_all(self, user=None) -> list[TeamCompositionEntity]:
        return self.team_compositions.get_all(user=user)

    def get_by_id(self, team_id: int, user=None) -> TeamCompositionEntity:
        return self.team_compositions.get_by_id(team_id, user=user)

    def create(
        self,
        name: str,
        hero_keys: list[str],
        user=None,
    ) -> TeamCompositionEntity:
        team = self._build_team(name=name, hero_keys=hero_keys)
        return self.team_compositions.create(team, user=user)

    def update(
        self,
        team_id: int,
        name: str,
        hero_keys: list[str],
        user=None,
    ) -> TeamCompositionEntity:
        team = self._build_team(
            name=name,
            hero_keys=hero_keys,
            team_id=team_id,
        )
        return self.team_compositions.update(team_id, team, user=user)

    def delete(self, team_id: int, user=None) -> None:
        self.team_compositions.delete(team_id, user=user)

    def _build_team(
        self,
        name: str,
        hero_keys: list[str],
        team_id: int | None = None,
    ) -> TeamCompositionEntity:
        heroes = [self.heroes.get_by_key(hero_key) for hero_key in hero_keys]
        return TeamCompositionEntity.create(
            name=name,
            heroes=heroes,
            team_id=team_id,
        )
