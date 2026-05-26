import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("heroes", "0003_ability"),
    ]

    operations = [
        migrations.AddField(
            model_name="teamcomposition",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="team_compositions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
