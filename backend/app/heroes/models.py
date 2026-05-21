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
        db_table = "heroes"


class TeamComposition(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    
    hero_1 = models.ForeignKey(
        Hero,
        on_delete=models.RESTRICT,
        related_name="team_comp_hero_1",
        db_column="hero_1"
    )
    hero_2 = models.ForeignKey(
        Hero,
        on_delete=models.RESTRICT,
        related_name="team_comp_hero_2",
        db_column="hero_2"
    )
    hero_3 = models.ForeignKey(
        Hero,
        on_delete=models.RESTRICT,
        related_name="team_comp_hero_3",
        db_column="hero_3"
    )
    hero_4 = models.ForeignKey(
        Hero,
        on_delete=models.RESTRICT,
        related_name="team_comp_hero_4",
        db_column="hero_4"
    )
    hero_5 = models.ForeignKey(
        Hero,
        on_delete=models.RESTRICT,
        related_name="team_comp_hero_5",
        db_column="hero_5"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "team_comps"
