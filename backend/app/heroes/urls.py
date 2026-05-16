from django.urls import path
from .views import hero_list, hero_detail


urlpatterns = [
    path("heroes/", hero_list, name="hero-list"),
    path("heroes/<str:hero_key>/", hero_detail, name="hero-detail"),
]
