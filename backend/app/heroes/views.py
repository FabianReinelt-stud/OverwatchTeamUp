from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.team_composition_adapter import TeamCompositionDatabaseAdapter
from heroes.serializers import (
    HeroSerializer,
    HeroSummarySerializer,
    TeamCompositionSerializer,
    TeamCompositionCreateUpdateSerializer,
)
from heroes.domain.entities import TeamCompositionEntity


def _build_team_composition_entity(heroes_data, team_id=None):
    hero_adapter = HeroDataBaseAdapter()
    heroes = {
        field_name: hero_adapter.get_by_key(hero_data["hero_key"])
        for field_name, hero_data in heroes_data.items()
        if field_name.startswith("hero_")
    }
    return TeamCompositionEntity(
        id=team_id,
        name=heroes_data["name"],
        created_at=None,
        **heroes,
    )


@api_view(["GET"])
def hero_list(request):
    repo = HeroDataBaseAdapter()
    heroes = repo.get_all()
    serializer = HeroSummarySerializer(heroes, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def hero_detail(request, hero_key):
    repo = HeroDataBaseAdapter()
    try:
        hero = repo.get_by_key(hero_key)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = HeroSerializer(hero)
    return Response(serializer.data)


@api_view(["GET"])
def team_composition_list(request):
    repo = TeamCompositionDatabaseAdapter()
    compositions = repo.get_all()
    serializer = TeamCompositionSerializer(compositions, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_composition_detail(request, team_id):
    repo = TeamCompositionDatabaseAdapter()
    try:
        composition = repo.get_by_id(team_id)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = TeamCompositionSerializer(composition)
    return Response(serializer.data)


@api_view(["POST"])
def team_composition_create(request):
    serializer = TeamCompositionCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    repo = TeamCompositionDatabaseAdapter()
    
    try:
        team_entity = _build_team_composition_entity(serializer.validated_data)
        saved_team = repo.create(team_entity)
        result_serializer = TeamCompositionSerializer(saved_team)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    except ObjectDoesNotExist:
        return Response(
            {"error": "One or more heroes not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["PUT"])
def team_composition_update(request, team_id):
    serializer = TeamCompositionCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    repo = TeamCompositionDatabaseAdapter()
    
    try:
        team_entity = _build_team_composition_entity(
            serializer.validated_data,
            team_id=team_id,
        )
        updated_team = repo.update(team_id, team_entity)
        result_serializer = TeamCompositionSerializer(updated_team)
        return Response(result_serializer.data)
    
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
def team_composition_delete(request, team_id):
    repo = TeamCompositionDatabaseAdapter()
    try:
        repo.delete(team_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
