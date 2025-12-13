#!/bin/bash

echo "Setting up database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database
echo "Creating database..."
createdb web3nova_payments 2>/dev/null || echo "Database already exists"

# Run migrations
echo "Running migrations..."
node scripts/migrate.js

# Seed data
echo "Seeding data..."
node scripts/seed.js

echo "Database setup complete!"