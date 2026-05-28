from dataclasses import dataclass
from pathlib import Path

from rest_framework import serializers

from heroes.serializers import (
    AbilitySerializer,
    HeroSerializer,
    HeroSummarySerializer,
    RegisterSerializer,
    TeamCompositionCreateUpdateSerializer,
    TeamCompositionSerializer,
)


@dataclass(frozen=True)
class DtoSpec:
    name: str
    serializer_class: type[serializers.Serializer]


DTO_SPECS = [
    DtoSpec("AbilityDto", AbilitySerializer),
    DtoSpec("HeroSummaryDto", HeroSummarySerializer),
    DtoSpec("HeroDto", HeroSerializer),
    DtoSpec("TeamCompositionDto", TeamCompositionSerializer),
    DtoSpec("TeamCompositionCreateUpdateDto", TeamCompositionCreateUpdateSerializer),
    DtoSpec("RegisterRequestDto", RegisterSerializer),
]

MANUAL_DTOS = {
    "RegisterResponseDto": {
        "id": "number",
        "username": "string",
    },
    "TokenRequestDto": {
        "username": "string",
        "password": "string",
    },
    "TokenResponseDto": {
        "access": "string",
        "refresh": "string",
    },
    "TokenRefreshRequestDto": {
        "refresh": "string",
    },
    "TokenRefreshResponseDto": {
        "access": "string",
    },
}


def generate_typescript_dtos() -> str:
    sections = [
        "/* eslint-disable */",
        "// This file is generated from backend DRF serializers.",
        "// Do not edit it by hand. Regenerate it with:",
        "// python manage.py generate_dtos",
        "",
    ]

    for spec in DTO_SPECS:
        sections.append(_serializer_to_type(spec.name, spec.serializer_class()))
        sections.append("")

    for name, fields in MANUAL_DTOS.items():
        sections.append(_fields_to_type(name, fields))
        sections.append("")

    return "\n".join(sections).rstrip() + "\n"


def write_typescript_dtos(output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(generate_typescript_dtos(), encoding="utf-8")
    return output_path


def _serializer_to_type(name: str, serializer: serializers.Serializer) -> str:
    fields = {
        field_name: _field_to_typescript(field)
        for field_name, field in serializer.fields.items()
    }
    return _fields_to_type(name, fields)


def _fields_to_type(name: str, fields: dict[str, str]) -> str:
    lines = [f"export type {name} = {{"]
    for field_name, field_type in fields.items():
        lines.append(f"  {field_name}: {field_type};")
    lines.append("};")
    return "\n".join(lines)


def _field_to_typescript(field: serializers.Field) -> str:
    if isinstance(field, serializers.ListSerializer):
        return f"{_field_to_typescript(field.child)}[]"

    if isinstance(field, serializers.Serializer):
        return f"{field.__class__.__name__.replace('Serializer', 'Dto')}"

    if isinstance(field, (serializers.IntegerField, serializers.FloatField)):
        return "number"

    if isinstance(field, serializers.BooleanField):
        return "boolean"

    if isinstance(field, serializers.DecimalField):
        return "string"

    if isinstance(field, serializers.DateTimeField):
        return "string"

    return "string"
