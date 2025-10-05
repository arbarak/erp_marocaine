-- Initialize PostgreSQL database for ERP system
-- This script runs when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS audit;

-- Set default timezone
SET timezone = 'Africa/Casablanca';

-- Create indexes for common queries (will be created by Django migrations)
-- These are just placeholders for future optimization
