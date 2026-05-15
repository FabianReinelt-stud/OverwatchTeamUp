from abc import ABC, abstractmethod

from heroes.domain.entities import HeroEntity


class HeroPort(ABC):
    @abstractmethod
    def get_all(self) -> list[HeroEntity]: ...
