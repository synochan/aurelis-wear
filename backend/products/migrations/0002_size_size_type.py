# Generated by Django 5.2.1 on 2025-05-22 15:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='size',
            name='size_type',
            field=models.CharField(choices=[('clothing', 'Clothing Size'), ('shoes', 'Shoe Size')], default='clothing', max_length=20),
        ),
    ]
