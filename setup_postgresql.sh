#!/bin/bash

echo "========================================"
echo "PostgreSQL Setup for ERP System"
echo "========================================"

echo ""
echo "Step 1: Setting up PostgreSQL database..."
echo "Please enter your PostgreSQL superuser password when prompted."
echo ""

# Run PostgreSQL setup script
psql -U postgres -f setup_postgresql.sql

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to set up PostgreSQL database!"
    echo "Please ensure:"
    echo "1. PostgreSQL is installed and running"
    echo "2. You have superuser access (postgres user)"
    echo "3. The setup_postgresql.sql file exists"
    echo ""
    echo "On Ubuntu/Debian, install PostgreSQL with:"
    echo "  sudo apt-get install postgresql postgresql-contrib"
    echo ""
    echo "On macOS with Homebrew:"
    echo "  brew install postgresql"
    echo "  brew services start postgresql"
    exit 1
fi

echo ""
echo "Step 2: Running Django migration..."
echo ""

# Run Django migration script
python3 migrate_to_postgresql.py

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Django migration failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "PostgreSQL setup completed successfully!"
echo "========================================"
echo ""
echo "You can now start the Django server:"
echo "  cd backend"
echo "  python manage.py runserver 0.0.0.0:8000"
echo ""
