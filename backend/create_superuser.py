#!/usr/bin/env python
"""
Script to create a superuser for demo.
"""
import os
import django

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.demo')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("✅ Superuser 'admin' created successfully!")
    print("   Username: admin")
    print("   Password: admin123")
else:
    print("ℹ️  Superuser 'admin' already exists")
