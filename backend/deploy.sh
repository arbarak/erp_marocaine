#!/bin/bash

# DigitalOcean deployment script for Django ERP application

set -e

echo "🌊 Deploying ERP Marocaine to DigitalOcean..."

# Set Django settings module
export DJANGO_SETTINGS_MODULE=config.settings.digitalocean

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Wait for database to be ready (if DATABASE_URL is provided)
if [ ! -z "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database..."
    python -c "
import os
import time
import psycopg2
from urllib.parse import urlparse

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
    
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            print('✅ Database is ready!')
            break
        except psycopg2.OperationalError:
            retry_count += 1
            print(f'⏳ Database not ready, retrying... ({retry_count}/{max_retries})')
            time.sleep(2)
    else:
        print('❌ Could not connect to database after maximum retries')
        exit(1)
"
fi

# Run database migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Create cache table if using database cache
echo "🗄️ Creating cache table..."
python manage.py createcachetable || echo "Cache table already exists or not needed"

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist
echo "👤 Setting up admin user..."
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
import os

User = get_user_model()
admin_email = os.environ.get('ADMIN_EMAIL', 'admin@erp.ma')
admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', admin_email, admin_password)
    print(f'✅ Superuser created: admin / {admin_password}')
    print('⚠️  Please change the default password after first login!')
else:
    print('ℹ️  Superuser already exists')
EOF

echo "✅ Deployment preparation complete!"
echo "🚀 Starting application server..."

# Start the application
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WEB_CONCURRENCY:-3} \
    --worker-class gevent \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 2 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
