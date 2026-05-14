from django.db import models


class Hero(models.Model):
    hero_key = models.CharField(
        max_length=30,
        primary_key=True
    )

    display_name = models.CharField(max_length=30)

    role = models.CharField(max_length=30)

    subrole = models.CharField(max_length=30)

    winrate = models.DecimalField(
        max_digits=4,
        decimal_places=1
    )

    pickrate = models.DecimalField(
        max_digits=4,
        decimal_places=1
    )

    health = models.IntegerField()
    armor = models.IntegerField()
    shields = models.IntegerField()

    portrait_url = models.TextField()
    description = models.TextField()

    class Meta:
        db_table = "hero"