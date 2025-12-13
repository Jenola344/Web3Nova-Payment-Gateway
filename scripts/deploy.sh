#!/bin/bash

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Run migrations
node scripts/migrate.js

# Restart application
pm2 restart web3nova-payment-gateway || pm2 start server.js --name web3nova-payment-gateway

echo " Deployment complete!"