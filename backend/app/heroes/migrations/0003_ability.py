import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heroes', '0002_teamcomposition'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ability',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('icon', models.TextField()),
                ('hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='abilities', to='heroes.hero')),
            ],
            options={
                'db_table': 'abilities',
            },
        ),
    ]
