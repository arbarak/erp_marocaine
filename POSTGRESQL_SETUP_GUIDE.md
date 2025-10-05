# PostgreSQL Setup Guide for ERP System

This guide will help you set up PostgreSQL for the ERP system and migrate from SQLite.

## Prerequisites

- Python 3.8+ installed
- Django ERP system downloaded
- Administrative access to your system

## Step 1: Install PostgreSQL

### Windows

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the latest version (15.x or 16.x recommended)
   - Run the installer as Administrator

2. **Installation Settings:**
   - **Port:** 5432 (default)
   - **Superuser password:** Choose a strong password (remember this!)
   - **Locale:** Default
   - **Components:** Install all components including pgAdmin

3. **Add PostgreSQL to PATH:**
   - Add `C:\Program Files\PostgreSQL\16\bin` to your system PATH
   - Or use the full path when running commands

### macOS

```bash
# Using Homebrew (recommended)
brew install postgresql
brew services start postgresql

# Or using MacPorts
sudo port install postgresql16-server
sudo port load postgresql16-server
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### CentOS/RHEL/Fedora

```bash
sudo dnf install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Verify PostgreSQL Installation

Open a new terminal/command prompt and test:

```bash
# Check PostgreSQL version
psql --version

# Connect to PostgreSQL (will prompt for password)
psql -U postgres
```

If you get "command not found", add PostgreSQL to your PATH or use the full path.

## Step 3: Set Up Database

### Option A: Automatic Setup (Recommended)

1. **Run the setup script:**

   **Windows:**
   ```cmd
   setup_postgresql.bat
   ```

   **Linux/macOS:**
   ```bash
   ./setup_postgresql.sh
   ```

### Option B: Manual Setup

1. **Create database and user:**
   ```bash
   # Connect as postgres superuser
   psql -U postgres
   
   # Run the SQL commands from setup_postgresql.sql
   \i setup_postgresql.sql
   
   # Exit PostgreSQL
   \q
   ```

2. **Run Django migration:**
   ```bash
   python migrate_to_postgresql.py
   ```

## Step 4: Verify Setup

1. **Check database connection:**
   ```bash
   psql -U erp_user -d erp_db -h localhost
   ```

2. **List tables:**
   ```sql
   \dt
   ```

3. **Check Django admin:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```
   
   Visit: http://localhost:8000/admin/
   Login: admin / admin123

## Configuration Details

### Database Settings

The system is configured with these PostgreSQL settings:

- **Database:** erp_db
- **User:** erp_user
- **Password:** erp_password
- **Host:** localhost
- **Port:** 5432

### Environment Variables

These are set in the `.env` file:

```env
DB_NAME=erp_db
DB_USER=erp_user
DB_PASSWORD=erp_password
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://erp_user:erp_password@localhost:5432/erp_db
```

## Troubleshooting

### Common Issues

1. **"psql: command not found"**
   - Add PostgreSQL bin directory to your PATH
   - Use full path: `C:\Program Files\PostgreSQL\16\bin\psql.exe`

2. **"Connection refused"**
   - Ensure PostgreSQL service is running
   - Check if port 5432 is available
   - Verify firewall settings

3. **"Authentication failed"**
   - Check username and password
   - Verify pg_hba.conf settings
   - Ensure user has correct permissions

4. **"Database does not exist"**
   - Run the setup_postgresql.sql script first
   - Create database manually if needed

### Manual Database Creation

If automatic setup fails:

```sql
-- Connect as postgres user
CREATE USER erp_user WITH PASSWORD 'erp_password';
CREATE DATABASE erp_db WITH OWNER = erp_user ENCODING = 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;
```

### Reset Database

To start fresh:

```sql
-- Connect as postgres user
DROP DATABASE IF EXISTS erp_db;
DROP USER IF EXISTS erp_user;

-- Then run setup again
```

## Performance Optimization

### PostgreSQL Configuration

For better performance, consider these settings in `postgresql.conf`:

```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connection settings
max_connections = 100

# Logging
log_statement = 'all'
log_duration = on
```

### Django Settings

The system includes these optimizations:

- Connection pooling
- Query optimization
- Index usage
- Serializable isolation level

## Security Considerations

1. **Change default passwords** in production
2. **Use SSL connections** for remote databases
3. **Restrict network access** with pg_hba.conf
4. **Regular backups** with pg_dump
5. **Monitor connections** and performance

## Backup and Restore

### Create Backup

```bash
pg_dump -U erp_user -h localhost erp_db > erp_backup.sql
```

### Restore Backup

```bash
psql -U erp_user -h localhost erp_db < erp_backup.sql
```

## Next Steps

After successful setup:

1. Start the Django server: `python manage.py runserver`
2. Start the frontend: `npm start` (in frontend directory)
3. Access the application at: http://localhost:3000
4. Admin panel at: http://localhost:8000/admin/

## Support

If you encounter issues:

1. Check the Django logs: `backend/logs/django.log`
2. Check PostgreSQL logs
3. Verify all services are running
4. Review the configuration files

For production deployment, consider using:
- Docker containers
- Managed PostgreSQL services (AWS RDS, Google Cloud SQL)
- Connection pooling (PgBouncer)
- Monitoring tools (pgAdmin, DataDog)
