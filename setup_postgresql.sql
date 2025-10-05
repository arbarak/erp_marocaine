-- PostgreSQL Database Setup for ERP System
-- Run this script as a PostgreSQL superuser (e.g., postgres)

-- Create database user
CREATE USER erp_user WITH PASSWORD 'erp_password';

-- Create database
CREATE DATABASE erp_db WITH 
    OWNER = erp_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'fr_MA.UTF-8'
    LC_CTYPE = 'fr_MA.UTF-8'
    TEMPLATE = template0;

-- Grant privileges to user
GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;

-- Connect to the database
\c erp_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO erp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO erp_user;

-- Display success message
SELECT 'PostgreSQL database setup completed successfully!' AS status;
