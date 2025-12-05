#!/bin/bash
# Complete rebuild script for Docker deployment

echo "🔨 Rebuilding application..."

# Stop and remove containers
echo "Stopping existing containers..."
docker-compose down

# Remove old images
echo "Removing old images..."
docker-compose rm -f

# Rebuild from scratch
echo "Building new images..."
docker-compose build --no-cache

# Start services
echo "Starting services..."
docker-compose up -d

# Show logs
echo -e "\n✓ Rebuild complete! Showing logs...\n"
docker-compose logs -f
