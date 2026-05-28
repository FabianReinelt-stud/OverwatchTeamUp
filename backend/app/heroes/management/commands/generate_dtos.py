from pathlib import Path

from django.core.management.base import BaseCommand

from heroes.dto_generation import write_typescript_dtos


class Command(BaseCommand):
    help = "Generate TypeScript DTOs from DRF serializers."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="generated/api-dtos.ts",
            help="Output path relative to backend/app or an absolute path.",
        )

    def handle(self, *args, **options):
        output_path = Path(options["output"])
        if not output_path.is_absolute():
            output_path = Path.cwd() / output_path

        written_path = write_typescript_dtos(output_path.resolve())
        self.stdout.write(self.style.SUCCESS(f"Generated DTOs at {written_path}"))
