import requests
from django.core.management.base import BaseCommand
from django.utils import timezone

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.overfast_api_adapter import OverfastAPIAdapter
from heroes.adapters.sync_state_adapter import SyncStateAdapter
from heroes.services.hero_sync_service import HeroSyncService

_DEFAULT_MAX_AGE_HOURS = 24


class Command(BaseCommand):
    help = "Sync heroes from Overfast API into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--fail-on-error",
            action="store_true",
            help="Exit with an error if the external hero sync fails.",
        )
        parser.add_argument(
            "--max-age-hours",
            type=int,
            default=_DEFAULT_MAX_AGE_HOURS,
            help=f"Skip sync if last sync is younger than this many hours (default: {_DEFAULT_MAX_AGE_HOURS}).",
        )

    def handle(self, *args, **options):
        sync_state = SyncStateAdapter()
        last_synced_at = sync_state.get_last_synced_at()
        if last_synced_at:
            age_seconds = (timezone.now() - last_synced_at).total_seconds()
            if age_seconds < options["max_age_hours"] * 3600:
                age_hours = int(age_seconds // 3600)
                self.stdout.write(
                    f"Skipping sync — data is {age_hours}h old "
                    f"(max age: {options['max_age_hours']}h)."
                )
                return

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

        sync_state.update_last_synced_at()
        self.stdout.write(self.style.SUCCESS(f"Synced {count} heroes."))
