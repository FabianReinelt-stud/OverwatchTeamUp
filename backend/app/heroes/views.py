from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.serializers import HeroSerializer, HeroSummarySerializer


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
