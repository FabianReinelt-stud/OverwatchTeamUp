from django.urls import path
from .views import hero_list


urlpatterns = [
    path("heroes/", hero_list, name="hero-list"),
]