from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods, require_POST, require_safe
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.adapters.team_composition_adapter import TeamCompositionDatabaseAdapter
from heroes.domain.exceptions import InvalidTeamComposition
from heroes.serializers import (
    HeroSerializer,
    HeroSummarySerializer,
    TeamCompositionSerializer,
    TeamCompositionCreateUpdateSerializer,
    RegisterSerializer,
)
from heroes.services.team_composition_service import TeamCompositionService


def _team_composition_service():
    return TeamCompositionService(
        team_compositions=TeamCompositionDatabaseAdapter(),
        heroes=HeroDataBaseAdapter(),
    )


def _team_composition_input(validated_data):
    hero_keys = [
        validated_data[f"hero_{position}"]["hero_key"]
        for position in range(1, 6)
    ]
    return validated_data["name"], hero_keys


@require_safe
@api_view(["GET"])
def hero_list(request):
    repo = HeroDataBaseAdapter()
    heroes = repo.get_all()
    serializer = HeroSummarySerializer(heroes, many=True)
    return Response(serializer.data)


@require_safe
@api_view(["GET"])
def hero_detail(request, hero_key):
    repo = HeroDataBaseAdapter()
    try:
        hero = repo.get_by_key(hero_key)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = HeroSerializer(hero)
    return Response(serializer.data)


@require_safe
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def team_composition_list(request):
    compositions = _team_composition_service().get_all(user=request.user)
    serializer = TeamCompositionSerializer(compositions, many=True)
    return Response(serializer.data)


@require_safe
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def team_composition_detail(request, team_id):
    try:
        composition = _team_composition_service().get_by_id(
            team_id,
            user=request.user,
        )
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = TeamCompositionSerializer(composition)
    return Response(serializer.data)


@require_POST
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def team_composition_create(request):
    serializer = TeamCompositionCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        name, hero_keys = _team_composition_input(serializer.validated_data)
        saved_team = _team_composition_service().create(
            name=name,
            hero_keys=hero_keys,
            user=request.user,
        )
        result_serializer = TeamCompositionSerializer(saved_team)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    except ObjectDoesNotExist:
        return Response(
            {"error": "One or more heroes not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except InvalidTeamComposition as error:
        return Response(
            {"error": str(error)},
            status=status.HTTP_400_BAD_REQUEST,
        )


@require_http_methods(["PUT"])
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def team_composition_update(request, team_id):
    serializer = TeamCompositionCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        name, hero_keys = _team_composition_input(serializer.validated_data)
        updated_team = _team_composition_service().update(
            team_id=team_id,
            name=name,
            hero_keys=hero_keys,
            user=request.user,
        )
        result_serializer = TeamCompositionSerializer(updated_team)
        return Response(result_serializer.data)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    except InvalidTeamComposition as error:
        return Response(
            {"error": str(error)},
            status=status.HTTP_400_BAD_REQUEST,
        )


@require_http_methods(["DELETE"])
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def team_composition_delete(request, team_id):
    try:
        _team_composition_service().delete(team_id, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"refresh": ["This field is required."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        RefreshToken(refresh_token).blacklist()
    except TokenError:
        return Response(
            {"refresh": ["Invalid or expired token."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(status=status.HTTP_204_NO_CONTENT)
