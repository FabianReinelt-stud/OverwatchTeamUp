from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Hero
from .serializers import HeroSerializer


@api_view(["GET"])
def hero_list(request):
    heroes = Hero.objects.all()
    serializer = HeroSerializer(heroes, many=True)
    return Response(serializer.data)