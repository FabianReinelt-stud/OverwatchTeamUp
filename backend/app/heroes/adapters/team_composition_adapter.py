from heroes.domain.entities import TeamCompositionEntity
from heroes.models import TeamComposition
from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.ports.team_composition_port import TeamCompositionPort


class TeamCompositionDatabaseAdapter(TeamCompositionPort):
    def __init__(self):
        self.hero_adapter = HeroDataBaseAdapter()

    def get_all(self, user=None) -> list[TeamCompositionEntity]:
        queryset = TeamComposition.objects.all()
        if user is not None:
            queryset = queryset.filter(user=user)
        return [self._to_entity(tc) for tc in queryset]

    def get_by_id(self, team_id: int, user=None) -> TeamCompositionEntity:
        queryset = TeamComposition.objects.all()
        if user is not None:
            queryset = queryset.filter(user=user)
        return self._to_entity(queryset.get(pk=team_id))

    def create(self, team: TeamCompositionEntity, user=None) -> TeamCompositionEntity:
        team_comp = TeamComposition.objects.create(
            user=user,
            name=team.name,
            hero_1_id=team.hero_1.hero_key,
            hero_2_id=team.hero_2.hero_key,
            hero_3_id=team.hero_3.hero_key,
            hero_4_id=team.hero_4.hero_key,
            hero_5_id=team.hero_5.hero_key,
        )
        return self._to_entity(team_comp)

    def update(self, team_id: int, team: TeamCompositionEntity, user=None) -> TeamCompositionEntity:
        queryset = TeamComposition.objects.all()
        if user is not None:
            queryset = queryset.filter(user=user)
        team_comp = queryset.get(pk=team_id)
        team_comp.name = team.name
        team_comp.hero_1_id = team.hero_1.hero_key
        team_comp.hero_2_id = team.hero_2.hero_key
        team_comp.hero_3_id = team.hero_3.hero_key
        team_comp.hero_4_id = team.hero_4.hero_key
        team_comp.hero_5_id = team.hero_5.hero_key
        team_comp.save()
        return self._to_entity(team_comp)

    def delete(self, team_id: int, user=None) -> None:
        queryset = TeamComposition.objects.all()
        if user is not None:
            queryset = queryset.filter(user=user)
        queryset.get(pk=team_id).delete()

    def _to_entity(self, tc: TeamComposition) -> TeamCompositionEntity:
        return TeamCompositionEntity(
            id=tc.id,
            name=tc.name,
            hero_1=self.hero_adapter.get_by_key(tc.hero_1_id),
            hero_2=self.hero_adapter.get_by_key(tc.hero_2_id),
            hero_3=self.hero_adapter.get_by_key(tc.hero_3_id),
            hero_4=self.hero_adapter.get_by_key(tc.hero_4_id),
            hero_5=self.hero_adapter.get_by_key(tc.hero_5_id),
            created_at=tc.created_at,
        )
