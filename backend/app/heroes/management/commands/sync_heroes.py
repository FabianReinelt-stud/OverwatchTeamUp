from django.core.management.base import BaseCommand
import requests

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.overfast_api_adapter import OverfastAPIAdapter
from heroes.services.hero_sync_service import HeroSyncService


class Command(BaseCommand):
    help = "Sync heroes from Overfast API into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--fail-on-error",
            action="store_true",
            help="Exit with an error if the external hero sync fails.",
        )

    def handle(self, *args, **options):
        self.stdout.write("Syncing heroes...")
        try:
            count = HeroSyncService(
                source=OverfastAPIAdapter(),
                repo=HeroDataBaseAdapter(),
            ).sync()
        except requests.RequestException as exc:
            message = (
                "Hero sync skipped because OverFast is unavailable. "
                "The application will continue using the last successfully synced local data."
            )
            self.stderr.write(self.style.WARNING(f"{message} ({exc})"))
            if options["fail_on_error"]:
                raise
            return

        self.stdout.write(self.style.SUCCESS(f"Synced {count} heroes."))
