from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    hero_list,
    hero_detail,
    logout,
    register,
    team_composition_list,
    team_composition_detail,
    team_composition_create,
    team_composition_update,
    team_composition_delete,
)


urlpatterns = [
    path("auth/register/", register, name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", logout, name="auth-logout"),
    path("heroes/", hero_list, name="hero-list"),
    path("heroes/<str:hero_key>/", hero_detail, name="hero-detail"),
    path("team-compositions/", team_composition_list, name="team-composition-list"),
    path(
        "team-compositions/<int:team_id>/",
        team_composition_detail,
        name="team-composition-detail",
    ),
    path(
        "team-compositions/create/",
        team_composition_create,
        name="team-composition-create",
    ),
    path(
        "team-compositions/<int:team_id>/update/",
        team_composition_update,
        name="team-composition-update",
    ),
    path(
        "team-compositions/<int:team_id>/delete/",
        team_composition_delete,
        name="team-composition-delete",
    ),
]
