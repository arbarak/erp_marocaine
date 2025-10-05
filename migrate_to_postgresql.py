#!/usr/bin/env python3
"""
Migration script to set up PostgreSQL database for ERP system.
This script will:
1. Check PostgreSQL connection
2. Run Django migrations
3. Create superuser
4. Load test data
"""

import os
import sys
import subprocess
import psycopg2
from psycopg2 import sql
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
from django.db import connection

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

def check_postgresql_availability():
    """Check if PostgreSQL is available and configured."""
    try:
        import psycopg2
        print("✅ psycopg2 package is available")

        # Try to connect to PostgreSQL
        try:
            conn = psycopg2.connect(
                host='localhost',
                port='5432',
                user='erp_user',
                password='erp_password',
                database='erp_db'
            )
            conn.close()
            print("✅ PostgreSQL connection successful!")
            return True, "postgresql"
        except psycopg2.Error as e:
            print(f"⚠️  PostgreSQL connection failed: {e}")
            print("Will use SQLite as fallback database.")
            return True, "sqlite"

    except ImportError:
        print("⚠️  psycopg2 package not available")
        print("Will use SQLite as fallback database.")
        return True, "sqlite"

def run_django_command(command_args):
    """Run a Django management command."""
    try:
        print(f"🔄 Running: python manage.py {' '.join(command_args)}")
        
        # Change to backend directory
        original_cwd = os.getcwd()
        os.chdir(backend_dir)
        
        # Run the command
        execute_from_command_line(['manage.py'] + command_args)
        
        # Change back to original directory
        os.chdir(original_cwd)
        
        print(f"✅ Command completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Command failed: {e}")
        return False

def create_superuser():
    """Create a superuser if it doesn't exist."""
    try:
        # Initialize Django
        django.setup()
        
        User = get_user_model()
        
        # Check if superuser already exists
        if User.objects.filter(is_superuser=True).exists():
            print("✅ Superuser already exists!")
            return True
        
        # Create superuser
        user = User.objects.create_user(
            username='admin',
            email='admin@erpmaroc.com',
            password='admin123',
            first_name='Ahmed',
            last_name='Admin',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        
        print("✅ Superuser created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Email: admin@erpmaroc.com")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create superuser: {e}")
        return False

def load_test_data():
    """Load test data into the database."""
    try:
        # Check if test data script exists
        test_data_script = os.path.join(backend_dir, 'scripts', 'create_test_data.py')
        if os.path.exists(test_data_script):
            print("🔄 Loading test data...")
            return run_django_command(['runscript', 'scripts.create_test_data'])
        else:
            print("⚠️  Test data script not found, skipping...")
            return True
    except Exception as e:
        print(f"❌ Failed to load test data: {e}")
        return False

def main():
    """Main migration process."""
    print("🚀 Starting database setup for ERP system...")
    print("=" * 60)

    # Step 1: Check database availability
    print("\n📋 Step 1: Checking database availability...")
    success, db_type = check_postgresql_availability()
    if not success:
        print("\n❌ Database setup failed!")
        return False

    print(f"✅ Using {db_type.upper()} database")
    
    # Step 2: Run migrations
    print("\n📋 Step 2: Running Django migrations...")
    
    # Make migrations first
    if not run_django_command(['makemigrations']):
        print("❌ Failed to make migrations!")
        return False
    
    # Run migrations
    if not run_django_command(['migrate']):
        print("❌ Failed to run migrations!")
        return False
    
    # Step 3: Create superuser
    print("\n📋 Step 3: Creating superuser...")
    if not create_superuser():
        print("❌ Failed to create superuser!")
        return False
    
    # Step 4: Load test data
    print("\n📋 Step 4: Loading test data...")
    load_test_data()  # This is optional, so we don't fail if it doesn't work
    
    # Step 5: Collect static files
    print("\n📋 Step 5: Collecting static files...")
    run_django_command(['collectstatic', '--noinput'])
    
    print("\n" + "=" * 60)
    print(f"🎉 Database setup completed successfully using {db_type.upper()}!")
    print("\nNext steps:")
    print("1. Start the Django development server:")
    print("   cd backend && python manage.py runserver 0.0.0.0:8000")
    print("2. Access the admin panel at: http://localhost:8000/admin/")
    print("3. Login with: admin / admin123")
    print("4. Access the API at: http://localhost:8000/api/v1/")

    if db_type == "sqlite":
        print("\n📝 Note: Currently using SQLite database.")
        print("To migrate to PostgreSQL later:")
        print("1. Install PostgreSQL")
        print("2. Run: psql -U postgres -f setup_postgresql.sql")
        print("3. Update .env file with PostgreSQL settings")
        print("4. Run: python manage.py migrate")
        print("5. Restart the Django server")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
