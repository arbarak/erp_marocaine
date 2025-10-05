#!/bin/bash

# PostgreSQL backup script for ERP system

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="erp_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="erp_postgres"
DB_NAME="erp_db"
DB_USER="erp_user"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🗄️  Creating PostgreSQL backup..."
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"
echo "File: $BACKUP_DIR/$BACKUP_FILE"

# Create backup
docker-compose exec -T $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "📦 Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Clean up old backups (keep last 7 days)
    find $BACKUP_DIR -name "erp_backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Old backups cleaned up (kept last 7 days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi
