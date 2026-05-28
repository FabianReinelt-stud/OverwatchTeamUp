from abc import ABC, abstractmethod

from heroes.domain.entities import TeamCompositionEntity


class TeamCompositionPort(ABC):
    @abstractmethod
    def get_all(self, user=None) -> list[TeamCompositionEntity]: ...

    @abstractmethod
    def get_by_id(self, team_id: int, user=None) -> TeamCompositionEntity: ...

    @abstractmethod
    def create(self, team: TeamCompositionEntity, user=None) -> TeamCompositionEntity: ...

    @abstractmethod
    def update(self, team_id: int, team: TeamCompositionEntity, user=None) -> TeamCompositionEntity: ...

    @abstractmethod
    def delete(self, team_id: int, user=None) -> None: ...
