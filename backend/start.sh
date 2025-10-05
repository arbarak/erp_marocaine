#!/bin/bash

# Railway startup script for Django ERP application

set -e

echo "Starting ERP Marocaine on Railway..."

# Set Django settings module
export DJANGO_SETTINGS_MODULE=config.settings.railway

# Wait for database to be ready
echo "Waiting for database..."
python -c "
import os
import time
import psycopg2
from urllib.parse import urlparse

# Parse DATABASE_URL if available
db_url = os.environ.get('DATABASE_URL')
if db_url:
    result = urlparse(db_url)
    db_config = {
        'host': result.hostname,
        'port': result.port or 5432,
        'user': result.username,
        'password': result.password,
        'database': result.path[1:],
    }
else:
    db_config = {
        'host': os.environ.get('PGHOST', 'localhost'),
        'port': int(os.environ.get('PGPORT', 5432)),
        'user': os.environ.get('PGUSER', 'postgres'),
        'password': os.environ.get('PGPASSWORD', ''),
        'database': os.environ.get('PGDATABASE', 'postgres'),
    }

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(**db_config)
        conn.close()
        print('Database is ready!')
        break
    except psycopg2.OperationalError:
        retry_count += 1
        print(f'Database not ready, retrying... ({retry_count}/{max_retries})')
        time.sleep(2)
else:
    print('Could not connect to database after maximum retries')
    exit(1)
"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist
echo "Creating superuser if needed..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@erp.ma', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
EOF

echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --worker-class gevent \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 2 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
