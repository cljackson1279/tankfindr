#!/bin/bash

# Run migration 002 on Supabase database
# Usage: ./run-migration.sh

echo "Applying migration 002..."

# Database connection string
DB_HOST="db.cijtllcbrvkbvrjriweu.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASS="your-db-password-here"  # Replace with actual password

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "psql not found. Installing..."
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Run migration
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f supabase/migrations/002_add_sources_and_tracking.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
else
    echo "❌ Migration failed. Check the error above."
    exit 1
fi
