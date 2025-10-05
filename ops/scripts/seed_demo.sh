#!/bin/bash

# Demo data seeding script for ERP system

echo "🌱 Seeding demo data for ERP system..."

# Check if Docker Compose is running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker Compose services are not running. Please run 'make up' first."
    exit 1
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Load tax rates
echo "📊 Loading Moroccan tax rates..."
docker-compose exec backend python manage.py loaddata seeds/morocco_tax_rates.json

# Load chart of accounts
echo "📋 Loading chart of accounts..."
docker-compose exec backend python manage.py loaddata seeds/chart_of_accounts_morocco.json

# Create demo company
echo "🏢 Creating demo company..."
docker-compose exec backend python manage.py shell << EOF
from core.companies.models import Company, CompanySettings

# Create demo company
company, created = Company.objects.get_or_create(
    ice='123456789012345',
    defaults={
        'name': 'Société Démo SARL',
        'legal_name': 'Société Démo SARL',
        'if_number': '12345678',
        'rc': 'RC123456',
        'email': 'contact@demo.ma',
        'phone': '+212 5 22 12 34 56',
        'address_line1': '123 Avenue Mohammed V',
        'city': 'Casablanca',
        'postal_code': '20000',
        'country': 'Maroc',
        'currency': 'MAD',
        'locale': 'fr-MA',
    }
)

if created:
    print(f"✅ Created demo company: {company.name}")
    
    # Create company settings
    settings, created = CompanySettings.objects.get_or_create(
        company=company,
        defaults={
            'invoice_prefix': 'DEMO-INV',
            'quote_prefix': 'DEMO-QUO',
            'po_prefix': 'DEMO-PO',
            'so_prefix': 'DEMO-SO',
            'default_payment_terms': 30,
            'default_quote_validity': 30,
            'default_costing_method': 'FIFO',
        }
    )
    
    if created:
        print(f"✅ Created company settings for: {company.name}")
else:
    print(f"ℹ️  Demo company already exists: {company.name}")
EOF

# Create demo superuser
echo "👤 Creating demo superuser..."
docker-compose exec backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
from core.companies.models import Company

User = get_user_model()
company = Company.objects.get(ice='123456789012345')

user, created = User.objects.get_or_create(
    email='admin@demo.ma',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'Demo',
        'is_staff': True,
        'is_superuser': True,
        'current_company': company,
        'is_verified': True,
    }
)

if created:
    user.set_password('admin123')
    user.save()
    print(f"✅ Created demo superuser: {user.email}")
else:
    print(f"ℹ️  Demo superuser already exists: {user.email}")
EOF

echo "🎉 Demo data seeding completed!"
echo ""
echo "Demo credentials:"
echo "  Email: admin@demo.ma"
echo "  Password: admin123"
echo ""
echo "Demo company:"
echo "  Name: Société Démo SARL"
echo "  ICE: 123456789012345"
echo "  IF: 12345678"
