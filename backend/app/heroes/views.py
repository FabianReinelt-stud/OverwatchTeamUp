from rest_framework.decorators import api_view
from rest_framework.response import Response

from heroes.adapters.hero_database_adapter import HeroDataBaseAdapter
from heroes.serializers import HeroSerializer


@api_view(["GET"])
def hero_list(request):
    repo = HeroDataBaseAdapter()
    heroes = repo.get_all()
    serializer = HeroSerializer(heroes, many=True)
    return Response(serializer.data)
