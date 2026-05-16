from rest_framework import serializers


class HeroSummarySerializer(serializers.Serializer):
    display_name = serializers.CharField()
    portrait_url = serializers.CharField()
    role = serializers.CharField()


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
