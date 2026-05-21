from abc import ABC, abstractmethod

from heroes.domain.entities import TeamCompositionEntity


class TeamCompositionPort(ABC):
    @abstractmethod
    def get_all(self) -> list[TeamCompositionEntity]: ...

    @abstractmethod
    def get_by_id(self, team_id: int) -> TeamCompositionEntity: ...

    @abstractmethod
    def create(self, team: TeamCompositionEntity) -> TeamCompositionEntity: ...

    @abstractmethod
    def update(self, team_id: int, team: TeamCompositionEntity) -> TeamCompositionEntity: ...

    @abstractmethod
    def delete(self, team_id: int) -> None: ...
