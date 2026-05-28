from django.core.management.base import BaseCommand

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.overfast_api_adapter import OverfastAPIAdapter
from heroes.services.hero_sync_service import HeroSyncService


class Command(BaseCommand):
    help = "Sync heroes from Overfast API into the database"

    def handle(self, *args, **options):
        self.stdout.write("Syncing heroes...")
        count = HeroSyncService(
            source=OverfastAPIAdapter(),
            repo=HeroDataBaseAdapter(),
        ).sync()
        self.stdout.write(self.style.SUCCESS(f"Synced {count} heroes."))
