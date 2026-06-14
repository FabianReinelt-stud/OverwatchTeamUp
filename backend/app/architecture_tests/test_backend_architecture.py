from pathlib import Path
from unittest import TestCase

from pytestarch import DiagramRule, get_evaluable_architecture


APP_DIR = Path(__file__).resolve().parents[1]
ARCHITECTURE_DIAGRAM = Path(__file__).with_name("backend-module-rules.puml")


class TestBackendArchitecture(TestCase):
    def test_module_dependencies_match_plantuml_diagram(self):
        architecture = get_evaluable_architecture(
            root_path=str(APP_DIR),
            module_path=str(APP_DIR / "heroes"),
            exclusions=(
                "*__pycache__*",
                "*migrations*",
                "*tests.py",
                "*test_*.py",
            ),
        )

        (
            DiagramRule()
            .from_file(ARCHITECTURE_DIAGRAM)
            .with_base_module("app.heroes")
            .assert_applies(architecture)
        )
