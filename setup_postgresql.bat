@echo off
echo ========================================
echo PostgreSQL Setup for ERP System
echo ========================================

echo.
echo Step 1: Setting up PostgreSQL database...
echo Please enter your PostgreSQL superuser password when prompted.
echo.

psql -U postgres -f setup_postgresql.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to set up PostgreSQL database!
    echo Please ensure:
    echo 1. PostgreSQL is installed and running
    echo 2. You have superuser access (postgres user)
    echo 3. The setup_postgresql.sql file exists
    pause
    exit /b 1
)

echo.
echo Step 2: Running Django migration...
echo.

python migrate_to_postgresql.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Django migration failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo PostgreSQL setup completed successfully!
echo ========================================
echo.
echo You can now start the Django server:
echo   cd backend
echo   python manage.py runserver 0.0.0.0:8000
echo.
pause
