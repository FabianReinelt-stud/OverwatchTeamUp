from abc import ABC, abstractmethod

from heroes.domain.entities import HeroEntity


class ExternalHeroSourcePort(ABC):
    @abstractmethod
    def fetch_all(self) -> list[HeroEntity]: ...
