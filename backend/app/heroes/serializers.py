from django.contrib.auth.models import User
from rest_framework import serializers


class HeroSummarySerializer(serializers.Serializer):
    display_name = serializers.CharField()
    portrait_url = serializers.CharField()
    role = serializers.CharField()


class AbilitySerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()


class HeroSerializer(serializers.Serializer):
    hero_key = serializers.CharField()
    display_name = serializers.CharField()
    role = serializers.CharField()
    subrole = serializers.CharField()
    winrate = serializers.DecimalField(max_digits=4, decimal_places=1)
    pickrate = serializers.DecimalField(max_digits=4, decimal_places=1)
    health = serializers.IntegerField()
    armor = serializers.IntegerField()
    shields = serializers.IntegerField()
    portrait_url = serializers.CharField()
    description = serializers.CharField()
    abilities = AbilitySerializer(many=True)


class TeamCompositionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    hero_1 = HeroSerializer(read_only=True)
    hero_2 = HeroSerializer(read_only=True)
    hero_3 = HeroSerializer(read_only=True)
    hero_4 = HeroSerializer(read_only=True)
    hero_5 = HeroSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    average_winrate = serializers.DecimalField(
        max_digits=4, decimal_places=1, read_only=True
    )


class TeamCompositionCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    hero_1_key = serializers.CharField(max_length=30, source="hero_1.hero_key")
    hero_2_key = serializers.CharField(max_length=30, source="hero_2.hero_key")
    hero_3_key = serializers.CharField(max_length=30, source="hero_3.hero_key")
    hero_4_key = serializers.CharField(max_length=30, source="hero_4.hero_key")
    hero_5_key = serializers.CharField(max_length=30, source="hero_5.hero_key")


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
