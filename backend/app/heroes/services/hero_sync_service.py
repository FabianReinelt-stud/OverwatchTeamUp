from heroes.ports.external_hero_source_port import ExternalHeroSourcePort
from heroes.ports.hero_port import HeroPort


class HeroSyncService:
    def __init__(self, source: ExternalHeroSourcePort, repo: HeroPort):
        self.source = source
        self.repo = repo

    def sync(self) -> int:
        heroes = self.source.fetch_all()
        for hero in heroes:
            self.repo.upsert(hero)
        return len(heroes)
