# Generated migration for UserCompanyMembership model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserCompanyMembership',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(default=True, verbose_name='is active')),
                ('is_default', models.BooleanField(default=False, help_text='Default company for this user', verbose_name='is default')),
                ('joined_at', models.DateTimeField(auto_now_add=True, verbose_name='joined at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='updated at')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_memberships', to='companies.company', verbose_name='company')),
                ('roles', models.ManyToManyField(blank=True, related_name='user_memberships', to='accounts.role', verbose_name='roles')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='company_memberships', to=settings.AUTH_USER_MODEL, verbose_name='user')),
            ],
            options={
                'verbose_name': 'User Company Membership',
                'verbose_name_plural': 'User Company Memberships',
                'unique_together': {('user', 'company')},
            },
        ),
        migrations.AddField(
            model_name='user',
            name='current_company',
            field=models.ForeignKey(blank=True, help_text='Currently selected company for this user session', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='current_users', to='companies.company', verbose_name='current company'),
        ),
    ]
